"""Sentiment analysis (Tiwari, 2024) — analyze, records CRUD, summary, trend."""
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from core.auth import get_current_user, role_required
from core.config import db, logger
from core.llm import llm_json, parse_json_text

router = APIRouter(prefix="/sentiment", tags=["sentiment"])

SentimentKind = Literal["feedback", "journal", "teacher_note", "standalone"]
SENTIMENTS = ("positive", "neutral", "negative", "mixed")


class SentimentAnalyzeRequest(BaseModel):
    text: str = Field(min_length=3, max_length=5000)


class SentimentResult(BaseModel):
    sentiment: Literal["positive", "neutral", "negative", "mixed"]
    polarity_score: float
    likert_score: float
    confidence: float
    nrc_emotions: dict
    satisfaction_score: float
    dissatisfaction_score: float
    aspects: dict
    key_themes: List[str]
    summary: str


class SentimentRecordCreate(BaseModel):
    kind: SentimentKind
    text: str = Field(min_length=3, max_length=5000)
    subject_name: Optional[str] = None
    student_id: Optional[str] = None
    child_id: Optional[str] = None


class SentimentRecord(BaseModel):
    id: str
    kind: str
    text: str
    subject_name: Optional[str] = None
    student_id: Optional[str] = None
    child_id: Optional[str] = None
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
    if sentiment not in SENTIMENTS:
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
        if a_sent not in SENTIMENTS:
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


@router.post("/analyze", response_model=SentimentResult)
async def sentiment_analyze(req: SentimentAnalyzeRequest, user: dict = Depends(get_current_user)):
    try:
        result = await run_sentiment(req.text, f"sent-analyze-{user['id']}-{uuid.uuid4().hex[:8]}")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Sentiment analyze error")
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")
    return SentimentResult(**result)


@router.post("/records", response_model=SentimentRecord)
async def create_sentiment_record(req: SentimentRecordCreate, user: dict = Depends(get_current_user)):
    try:
        result = await run_sentiment(req.text, f"sent-rec-{user['id']}-{uuid.uuid4().hex[:8]}")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Sentiment record error")
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")
    record = {
        "id": str(uuid.uuid4()),
        "kind": req.kind,
        "text": req.text,
        "subject_name": req.subject_name,
        "student_id": req.student_id,
        "child_id": req.child_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "user_role": user["role"],
        "result": result,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.sentiment_records.insert_one(record)
    return SentimentRecord(**{k: v for k, v in record.items() if k != "_id"})


@router.get("/records", response_model=List[SentimentRecord])
async def list_sentiment_records(
    kind: Optional[str] = None,
    child_id: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    base: dict = {}
    if kind:
        base["kind"] = kind
    if child_id:
        base["child_id"] = child_id

    if user["role"] == "principal":
        query = base
    elif user["role"] == "teacher":
        query = {"$and": [base, {"$or": [
            {"user_id": user["id"]},
            {"kind": {"$in": ["feedback", "journal"]}},
        ]}]} if base else {"$or": [
            {"user_id": user["id"]},
            {"kind": {"$in": ["feedback", "journal"]}},
        ]}
    else:  # parent
        query = {**base, "user_id": user["id"]}

    return await db.sentiment_records.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)


@router.delete("/records/{record_id}")
async def delete_sentiment_record(record_id: str, user: dict = Depends(get_current_user)):
    q = {"id": record_id}
    if user["role"] != "principal":
        q["user_id"] = user["id"]
    result = await db.sentiment_records.delete_one(q)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"ok": True}


@router.get("/summary")
async def sentiment_summary(user: dict = Depends(role_required(["principal", "teacher"]))):
    pipeline = [{"$group": {"_id": {"kind": "$kind", "sentiment": "$result.sentiment"}, "count": {"$sum": 1}}}]
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


@router.get("/trend")
async def sentiment_trend(
    days: int = Query(30, ge=1, le=180),
    user: dict = Depends(role_required(["principal", "teacher"])),
):
    """Daily sentiment trend over the last N days.
    Aggregation: MongoDB $group bucket by date (YYYY-MM-DD), then fill missing days as zero.
    """
    now = datetime.now(timezone.utc)
    start = (now - timedelta(days=days - 1)).replace(hour=0, minute=0, second=0, microsecond=0)
    start_iso = start.isoformat()

    pipeline = [
        {"$match": {"created_at": {"$gte": start_iso}}},
        {"$addFields": {
            "_date": {"$substr": ["$created_at", 0, 10]},
            "_pol": {"$ifNull": ["$result.polarity_score", 0]},
            "_lik": {"$ifNull": ["$result.likert_score", 0]},
            "_sent": {"$ifNull": ["$result.sentiment", "neutral"]},
        }},
        {"$group": {
            "_id": "$_date",
            "positive": {"$sum": {"$cond": [{"$eq": ["$_sent", "positive"]}, 1, 0]}},
            "neutral":  {"$sum": {"$cond": [{"$eq": ["$_sent", "neutral"]},  1, 0]}},
            "negative": {"$sum": {"$cond": [{"$eq": ["$_sent", "negative"]}, 1, 0]}},
            "mixed":    {"$sum": {"$cond": [{"$eq": ["$_sent", "mixed"]},    1, 0]}},
            "total":    {"$sum": 1},
            "avg_polarity": {"$avg": "$_pol"},
            "avg_likert":   {"$avg": "$_lik"},
        }},
    ]

    by_date: dict = {}
    async for doc in db.sentiment_records.aggregate(pipeline):
        by_date[doc["_id"]] = doc

    series = []
    for i in range(days):
        d = (start + timedelta(days=i)).date().isoformat()
        bucket = by_date.get(d)
        if bucket:
            series.append({
                "date": d,
                "positive": int(bucket.get("positive", 0)),
                "neutral":  int(bucket.get("neutral", 0)),
                "negative": int(bucket.get("negative", 0)),
                "mixed":    int(bucket.get("mixed", 0)),
                "total":    int(bucket.get("total", 0)),
                "avg_polarity": round(float(bucket.get("avg_polarity") or 0.0), 3),
                "avg_likert":   round(float(bucket.get("avg_likert") or 0.0), 3),
            })
        else:
            series.append({
                "date": d,
                "positive": 0, "neutral": 0, "negative": 0, "mixed": 0,
                "total": 0, "avg_polarity": 0.0, "avg_likert": 0.0,
            })
    return {"days": days, "series": series}
