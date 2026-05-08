"""Astrology niche finder + history."""
import urllib.parse
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from core.auth import get_current_user
from core.config import db, logger, WHATSAPP_NUMBER
from core.llm import llm_json, parse_json_text

router = APIRouter(prefix="/astrology", tags=["astrology"])


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


class AstrologyRequest(BaseModel):
    name: str
    place: str
    date_of_birth: str
    time_of_birth: str
    child_id: Optional[str] = None


class AstrologyResponse(BaseModel):
    name: str
    sun_sign: str
    niche: str
    traits: List[str]
    career_paths: List[str]
    summary: str
    whatsapp_number: str
    whatsapp_link: str
    child_id: Optional[str] = None


@router.post("/niche", response_model=AstrologyResponse)
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

    record = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "child_id": req.child_id,
        "request": req.model_dump(),
        "sun_sign": sun_sign,
        "result": data,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.astrology_results.insert_one(record)

    wa_num_clean = WHATSAPP_NUMBER.replace("+", "").replace(" ", "")
    wa_text = f"Hi! I would like to know more about my child {req.name}'s niche guidance from EDUSENSE."
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
        child_id=req.child_id,
    )


@router.get("/history")
async def astrology_history(child_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    q: dict = {"user_id": user["id"]}
    if child_id:
        q["child_id"] = child_id
    items = await db.astrology_results.find(q, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items
