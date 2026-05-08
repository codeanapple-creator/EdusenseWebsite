"""Book/link/activity recommendations."""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from core.auth import get_current_user
from core.config import logger
from core.llm import llm_json, parse_json_text

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


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


@router.post("", response_model=RecommendationResponse)
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
    except HTTPException:
        raise
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
