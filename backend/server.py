from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

from emergentintegrations.llm.chat import LlmChat, UserMessage

# ----- Setup -----
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
WHATSAPP_NUMBER = os.environ.get('WHATSAPP_NUMBER', '+919999999999')

app = FastAPI(title="EDUSENSE API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ----- Helpers -----
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def role_required(allowed: list[str]):
    async def _checker(user: dict = Depends(get_current_user)):
        if user.get("role") not in allowed:
            raise HTTPException(status_code=403, detail="Forbidden: role not allowed")
        return user
    return _checker


# ----- Models -----
Role = Literal["parent", "teacher", "principal"]


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: Role


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: Role


class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    role: str
    created_at: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class AstrologyRequest(BaseModel):
    name: str
    place: str
    date_of_birth: str  # YYYY-MM-DD
    time_of_birth: str  # HH:MM


class AstrologyResponse(BaseModel):
    name: str
    sun_sign: str
    niche: str
    traits: List[str]
    career_paths: List[str]
    summary: str
    whatsapp_number: str
    whatsapp_link: str


class RecommendationRequest(BaseModel):
    subject: str
    age: int = Field(ge=3, le=18)


class BookItem(BaseModel):
    title: str
    author: str
    description: str


class LinkItem(BaseModel):
    title: str
    url: str
    description: str


class ActivityItem(BaseModel):
    title: str
    description: str
    duration_minutes: int


class RecommendationResponse(BaseModel):
    subject: str
    age: int
    books: List[BookItem]
    links: List[LinkItem]
    activities: List[ActivityItem]


class StudentCreate(BaseModel):
    name: str
    grade: str
    age: int
    subject_focus: str = "General"


class Student(BaseModel):
    id: str
    name: str
    grade: str
    age: int
    subject_focus: str
    teacher_id: str
    created_at: str


# ----- LLM helpers -----
ZODIAC = [
    ("Capricorn", (12, 22), (1, 19)),
    ("Aquarius", (1, 20), (2, 18)),
    ("Pisces", (2, 19), (3, 20)),
    ("Aries", (3, 21), (4, 19)),
    ("Taurus", (4, 20), (5, 20)),
    ("Gemini", (5, 21), (6, 20)),
    ("Cancer", (6, 21), (7, 22)),
    ("Leo", (7, 23), (8, 22)),
    ("Virgo", (8, 23), (9, 22)),
    ("Libra", (9, 23), (10, 22)),
    ("Scorpio", (10, 23), (11, 21)),
    ("Sagittarius", (11, 22), (12, 21)),
]


def get_sun_sign(date_str: str) -> str:
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
        m, day = d.month, d.day
    except ValueError:
        return "Unknown"
    for sign, start, end in ZODIAC:
        sm, sd = start
        em, ed = end
        if sm == 12 and m == 12 and day >= sd:
            return sign
        if sm == 12 and m == 1 and day <= ed:
            return sign
        if sm == m and day >= sd:
            return sign
        if em == m and day <= ed:
            return sign
    return "Capricorn"


async def llm_json(system: str, prompt: str, session_id: str) -> str:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")
    msg = UserMessage(text=prompt)
    return await chat.send_message(msg)


def parse_json_text(text: str) -> dict:
    import json, re
    text = text.strip()
    # Strip markdown code fences if present
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    if fence:
        text = fence.group(1).strip()
    # Find first { ... } block
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        text = m.group(0)
    return json.loads(text)


# ----- Routes -----
@api_router.get("/")
async def root():
    return {"app": "EDUSENSE by Codeanapple", "status": "ok"}


# Auth
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(payload: RegisterRequest):
    email = payload.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": user_id,
        "name": payload.name,
        "email": email,
        "role": payload.role,
        "password_hash": hash_password(payload.password),
        "created_at": now_iso,
    }
    await db.users.insert_one(doc)
    token = create_access_token(user_id, email, payload.role)
    return AuthResponse(
        token=token,
        user=UserOut(id=user_id, name=payload.name, email=email, role=payload.role, created_at=now_iso),
    )


@api_router.post("/auth/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.get("role") != payload.role:
        raise HTTPException(status_code=403, detail=f"This account is registered as {user.get('role')}, not {payload.role}")
    token = create_access_token(user["id"], user["email"], user["role"])
    return AuthResponse(
        token=token,
        user=UserOut(
            id=user["id"], name=user["name"], email=user["email"],
            role=user["role"], created_at=user["created_at"],
        ),
    )


@api_router.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return UserOut(**user)


# Astrology
@api_router.post("/astrology/niche", response_model=AstrologyResponse)
async def astrology_niche(req: AstrologyRequest, user: dict = Depends(get_current_user)):
    sun_sign = get_sun_sign(req.date_of_birth)
    system = (
        "You are an expert western astrologer and child career counselor. "
        "Given birth details, return ONLY valid JSON with keys: niche (single short phrase), "
        "traits (array of 4-5 short strings), career_paths (array of 4-6 specific career suggestions), "
        "summary (2-3 sentence supportive paragraph for parents). No prose outside JSON."
    )
    prompt = (
        f"Child Name: {req.name}\n"
        f"Place of Birth: {req.place}\n"
        f"Date of Birth: {req.date_of_birth}\n"
        f"Time of Birth: {req.time_of_birth}\n"
        f"Sun Sign: {sun_sign}\n\n"
        "Provide career niche guidance in JSON only."
    )
    try:
        raw = await llm_json(system, prompt, f"astro-{user['id']}-{uuid.uuid4().hex[:8]}")
        data = parse_json_text(raw)
    except Exception as e:
        logger.exception("Astrology LLM error")
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")

    # Persist
    record = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "request": req.model_dump(),
        "sun_sign": sun_sign,
        "result": data,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.astrology_results.insert_one(record)

    wa_num_clean = WHATSAPP_NUMBER.replace("+", "").replace(" ", "")
    wa_text = f"Hi! I would like to know more about my child {req.name}'s niche guidance from EDUSENSE."
    import urllib.parse
    wa_link = f"https://wa.me/{wa_num_clean}?text={urllib.parse.quote(wa_text)}"

    return AstrologyResponse(
        name=req.name,
        sun_sign=sun_sign,
        niche=str(data.get("niche", "Creative Explorer")),
        traits=[str(x) for x in data.get("traits", [])],
        career_paths=[str(x) for x in data.get("career_paths", [])],
        summary=str(data.get("summary", "")),
        whatsapp_number=WHATSAPP_NUMBER,
        whatsapp_link=wa_link,
    )


@api_router.get("/astrology/history")
async def astrology_history(user: dict = Depends(get_current_user)):
    items = await db.astrology_results.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items


# Recommendations
@api_router.post("/recommendations", response_model=RecommendationResponse)
async def recommendations(req: RecommendationRequest, user: dict = Depends(get_current_user)):
    system = (
        "You are an expert child education curator. Given a subject and age, return ONLY valid JSON with: "
        "books (array of 5 objects {title, author, description}), "
        "links (array of 4 objects {title, url, description} - real, well-known educational sites like Khan Academy, NASA Kids, BBC Bitesize, National Geographic Kids, Scratch, Code.org, Duolingo, etc.), "
        "activities (array of 5 objects {title, description, duration_minutes}). "
        "Books and activities must be age-appropriate and educational. No prose outside JSON."
    )
    prompt = f"Subject: {req.subject}\nChild Age: {req.age} years\n\nReturn recommendations in JSON only."
    try:
        raw = await llm_json(system, prompt, f"rec-{user['id']}-{uuid.uuid4().hex[:8]}")
        data = parse_json_text(raw)
    except Exception as e:
        logger.exception("Recommendation LLM error")
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")

    return RecommendationResponse(
        subject=req.subject,
        age=req.age,
        books=[BookItem(**b) for b in data.get("books", [])][:6],
        links=[LinkItem(**l) for l in data.get("links", [])][:6],
        activities=[ActivityItem(**a) for a in data.get("activities", [])][:6],
    )


# WhatsApp
@api_router.get("/whatsapp/contact")
async def whatsapp_contact():
    num_clean = WHATSAPP_NUMBER.replace("+", "").replace(" ", "")
    return {
        "number": WHATSAPP_NUMBER,
        "link": f"https://wa.me/{num_clean}",
    }


# Teacher: students CRUD (per-teacher)
@api_router.post("/students", response_model=Student)
async def create_student(payload: StudentCreate, user: dict = Depends(role_required(["teacher", "principal"]))):
    student_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": student_id,
        "name": payload.name,
        "grade": payload.grade,
        "age": payload.age,
        "subject_focus": payload.subject_focus,
        "teacher_id": user["id"],
        "created_at": now_iso,
    }
    await db.students.insert_one(doc)
    return Student(**{k: v for k, v in doc.items() if k != "_id"})


@api_router.get("/students", response_model=List[Student])
async def list_students(user: dict = Depends(role_required(["teacher", "principal"]))):
    query = {} if user["role"] == "principal" else {"teacher_id": user["id"]}
    items = await db.students.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.delete("/students/{student_id}")
async def delete_student(student_id: str, user: dict = Depends(role_required(["teacher", "principal"]))):
    query = {"id": student_id} if user["role"] == "principal" else {"id": student_id, "teacher_id": user["id"]}
    result = await db.students.delete_one(query)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"ok": True}


# ----- Sentiment Analysis -----
SentimentKind = Literal["feedback", "journal", "teacher_note", "standalone"]


class SentimentAnalyzeRequest(BaseModel):
    text: str = Field(min_length=3, max_length=5000)


class SentimentResult(BaseModel):
    sentiment: Literal["positive", "neutral", "negative", "mixed"]
    polarity_score: float  # -1.0 to 1.0
    likert_score: float  # 0.0 to 5.0 (per Tiwari, 2024)
    confidence: float  # 0.0 to 1.0
    nrc_emotions: dict  # 8 NRC emotions -> intensity 0..1
    satisfaction_score: float  # 0..1 weighted (joy + trust + anticipation)
    dissatisfaction_score: float  # 0..1 weighted (anger + disgust + sadness + fear)
    aspects: dict  # aspect category -> {sentiment, score}
    key_themes: List[str]
    summary: str


class SentimentRecordCreate(BaseModel):
    kind: SentimentKind
    text: str = Field(min_length=3, max_length=5000)
    subject_name: Optional[str] = None  # student name (for teacher_note / journal)
    student_id: Optional[str] = None


class SentimentRecord(BaseModel):
    id: str
    kind: str
    text: str
    subject_name: Optional[str] = None
    student_id: Optional[str] = None
    user_id: str
    user_name: str
    user_role: str
    result: dict
    created_at: str


SENTIMENT_SYSTEM = (
    "You are a hybrid (lexicon + ML) sentiment analysis engine implementing the methodology from "
    "Bhawna Tiwari's 2024 PhD thesis 'Sentimental Analysis approach to improve teaching and learning "
    "in primary education'. Apply: (a) 3-class polarity {positive, negative, neutral} plus 'mixed', "
    "(b) NRC Emotion Lexicon with 8 emotions {anger, anticipation, disgust, fear, joy, sadness, surprise, trust}, "
    "(c) Aspect-Based Sentiment Analysis using the thesis aspect-categories. For primary-education context, "
    "use these aspects when applicable: 'happiness_index', 'active_participation', 'sharing', 'self_initiation', "
    "'gross_motors', 'fine_motors_cognitive', 'behaviour', 'learning', 'teaching_effectiveness', 'course_content', 'instructor_quality'. "
    "Compute a Likert score (0-5) consistent with polarity, where 0 = strongly negative and 5 = strongly positive. "
    "Satisfaction = weighted mean of (joy*0.5 + trust*0.3 + anticipation*0.2). "
    "Dissatisfaction = weighted mean of (anger*0.35 + disgust*0.25 + sadness*0.25 + fear*0.15). "
    "Return ONLY valid JSON with keys: sentiment, polarity_score (-1..1), likert_score (0..5), confidence (0..1), "
    "nrc_emotions (object with all 8 keys, intensities 0..1), satisfaction_score (0..1), dissatisfaction_score (0..1), "
    "aspects (object: {<aspect_key>: {sentiment, score}}), key_themes (array of 2-5 short phrases), "
    "summary (1-2 sentence interpretation). Output JSON only."
)


NRC_EMOTIONS = ["anger", "anticipation", "disgust", "fear", "joy", "sadness", "surprise", "trust"]


def _clamp(v, lo, hi):
    try:
        v = float(v)
    except (TypeError, ValueError):
        v = 0.0
    return max(lo, min(hi, v))


async def run_sentiment(text: str, session_id: str) -> dict:
    raw = await llm_json(SENTIMENT_SYSTEM, f"Text to analyze:\n\"\"\"\n{text}\n\"\"\"", session_id)
    data = parse_json_text(raw)

    sentiment = str(data.get("sentiment", "neutral")).lower()
    if sentiment not in ("positive", "neutral", "negative", "mixed"):
        sentiment = "neutral"

    polarity_score = _clamp(data.get("polarity_score", data.get("score", 0)), -1.0, 1.0)
    likert_score = _clamp(data.get("likert_score", (polarity_score + 1) * 2.5), 0.0, 5.0)
    confidence = _clamp(data.get("confidence", 0.7), 0.0, 1.0)

    nrc_raw = data.get("nrc_emotions", {}) or {}
    nrc_emotions = {e: _clamp(nrc_raw.get(e, 0.0), 0.0, 1.0) for e in NRC_EMOTIONS}

    sat = _clamp(
        data.get("satisfaction_score",
                 nrc_emotions["joy"] * 0.5 + nrc_emotions["trust"] * 0.3 + nrc_emotions["anticipation"] * 0.2),
        0.0, 1.0,
    )
    dis = _clamp(
        data.get("dissatisfaction_score",
                 nrc_emotions["anger"] * 0.35 + nrc_emotions["disgust"] * 0.25
                 + nrc_emotions["sadness"] * 0.25 + nrc_emotions["fear"] * 0.15),
        0.0, 1.0,
    )

    aspects_raw = data.get("aspects", {}) or {}
    aspects = {}
    for key, val in aspects_raw.items():
        if not isinstance(val, dict):
            continue
        a_sent = str(val.get("sentiment", "neutral")).lower()
        if a_sent not in ("positive", "negative", "neutral", "mixed"):
            a_sent = "neutral"
        aspects[str(key)] = {
            "sentiment": a_sent,
            "score": _clamp(val.get("score", 0), -1.0, 1.0),
        }

    return {
        "sentiment": sentiment,
        "polarity_score": polarity_score,
        "likert_score": round(likert_score, 2),
        "confidence": confidence,
        "nrc_emotions": nrc_emotions,
        "satisfaction_score": round(sat, 3),
        "dissatisfaction_score": round(dis, 3),
        "aspects": aspects,
        "key_themes": [str(t) for t in data.get("key_themes", [])][:6],
        "summary": str(data.get("summary", "")),
    }


@api_router.post("/sentiment/analyze", response_model=SentimentResult)
async def sentiment_analyze(req: SentimentAnalyzeRequest, user: dict = Depends(get_current_user)):
    try:
        result = await run_sentiment(req.text, f"sent-analyze-{user['id']}-{uuid.uuid4().hex[:8]}")
    except Exception as e:
        logger.exception("Sentiment analyze error")
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")
    return SentimentResult(**result)


@api_router.post("/sentiment/records", response_model=SentimentRecord)
async def create_sentiment_record(req: SentimentRecordCreate, user: dict = Depends(get_current_user)):
    try:
        result = await run_sentiment(req.text, f"sent-rec-{user['id']}-{uuid.uuid4().hex[:8]}")
    except Exception as e:
        logger.exception("Sentiment record error")
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")
    record = {
        "id": str(uuid.uuid4()),
        "kind": req.kind,
        "text": req.text,
        "subject_name": req.subject_name,
        "student_id": req.student_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "user_role": user["role"],
        "result": result,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.sentiment_records.insert_one(record)
    return SentimentRecord(**{k: v for k, v in record.items() if k != "_id"})


@api_router.get("/sentiment/records", response_model=List[SentimentRecord])
async def list_sentiment_records(
    kind: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    query: dict = {}
    if kind:
        query["kind"] = kind
    # Role-based visibility
    if user["role"] == "principal":
        pass  # see all
    elif user["role"] == "teacher":
        # Teachers can see their own records + all journals + all parent feedback
        query = {**query, "$or": [
            {"user_id": user["id"]},
            {"kind": {"$in": ["feedback", "journal"]}},
        ]}
    else:  # parent
        query["user_id"] = user["id"]
    items = await db.sentiment_records.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items


@api_router.delete("/sentiment/records/{record_id}")
async def delete_sentiment_record(record_id: str, user: dict = Depends(get_current_user)):
    q = {"id": record_id}
    if user["role"] != "principal":
        q["user_id"] = user["id"]
    result = await db.sentiment_records.delete_one(q)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"ok": True}


@api_router.get("/sentiment/summary")
async def sentiment_summary(user: dict = Depends(role_required(["principal", "teacher"]))):
    # Aggregate counts by sentiment + kind
    pipeline = [
        {"$group": {"_id": {"kind": "$kind", "sentiment": "$result.sentiment"}, "count": {"$sum": 1}}},
    ]
    by_kind: dict = {}
    overall: dict = {"positive": 0, "neutral": 0, "negative": 0, "mixed": 0}
    async for doc in db.sentiment_records.aggregate(pipeline):
        k = doc["_id"]["kind"]
        s = doc["_id"]["sentiment"]
        c = doc["count"]
        by_kind.setdefault(k, {"positive": 0, "neutral": 0, "negative": 0, "mixed": 0})
        by_kind[k][s] = c
        overall[s] = overall.get(s, 0) + c
    total = await db.sentiment_records.count_documents({})
    return {"total_records": total, "overall": overall, "by_kind": by_kind}


# Principal: analytics
@api_router.get("/analytics/overview")
async def analytics_overview(user: dict = Depends(role_required(["principal"]))):
    total_users = await db.users.count_documents({})
    total_parents = await db.users.count_documents({"role": "parent"})
    total_teachers = await db.users.count_documents({"role": "teacher"})
    total_principals = await db.users.count_documents({"role": "principal"})
    total_students = await db.students.count_documents({})
    total_astro = await db.astrology_results.count_documents({})

    # Distribution by grade
    pipeline = [
        {"$group": {"_id": "$grade", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    grade_dist = []
    async for doc in db.students.aggregate(pipeline):
        grade_dist.append({"grade": doc["_id"] or "N/A", "count": doc["count"]})

    return {
        "total_users": total_users,
        "total_parents": total_parents,
        "total_teachers": total_teachers,
        "total_principals": total_principals,
        "total_students": total_students,
        "total_astrology_consults": total_astro,
        "grade_distribution": grade_dist,
    }


# ----- App wiring -----
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.students.create_index("teacher_id")
    await db.sentiment_records.create_index("user_id")
    await db.sentiment_records.create_index("kind")
    # Seed admin (principal)
    admin_email = os.environ.get("ADMIN_EMAIL", "principal@edusense.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "name": "Principal Admin",
            "email": admin_email,
            "role": "principal",
            "password_hash": hash_password(admin_password),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin: {admin_email}")
    else:
        # ensure password matches env
        if not verify_password(admin_password, existing["password_hash"]):
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"password_hash": hash_password(admin_password), "role": "principal"}},
            )


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
