"""School multi-tenancy + subscription (mocked)."""
import secrets
import string
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from core.auth import get_current_user, role_required
from core.config import db, logger

router = APIRouter(prefix="/schools", tags=["schools"])

FREE_STUDENT_LIMIT = 30
PRO_PRICE_INR = 1499
PRO_DURATION_DAYS = 30
GRACE_DAYS = 7
ALPHABET = string.ascii_uppercase + string.digits


def gen_code(length: int = 6) -> str:
    return "".join(secrets.choice(ALPHABET) for _ in range(length))


# ---------- Models ----------
PlanType = Literal["free", "pro"]
SubscriptionStatus = Literal["active", "grace", "expired"]


class SchoolCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)


class SchoolJoin(BaseModel):
    code: str = Field(min_length=4, max_length=12)


class School(BaseModel):
    id: str
    name: str
    code: str
    principal_id: str
    plan: str
    subscription_status: str
    current_period_end: Optional[str] = None
    grace_until: Optional[str] = None
    student_limit: int
    created_at: str
    member_count: Optional[int] = None
    student_count: Optional[int] = None


# ---------- Helpers ----------
async def get_user_school(user: dict) -> Optional[dict]:
    sid = user.get("school_id")
    if not sid:
        return None
    return await db.schools.find_one({"id": sid}, {"_id": 0})


def school_view(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "name": doc["name"],
        "code": doc["code"],
        "principal_id": doc["principal_id"],
        "plan": doc.get("plan", "free"),
        "subscription_status": doc.get("subscription_status", "active"),
        "current_period_end": doc.get("current_period_end"),
        "grace_until": doc.get("grace_until"),
        "student_limit": doc.get("student_limit", FREE_STUDENT_LIMIT),
        "created_at": doc["created_at"],
    }


async def refresh_subscription_state(school: dict) -> dict:
    """Move active→grace→expired based on dates.
    Webhook-driven states (already 'grace' or 'expired') are NOT auto-reverted to 'active'.
    """
    now = datetime.now(timezone.utc)
    if school.get("plan") != "pro":
        return school
    cpe = school.get("current_period_end")
    if not cpe:
        return school
    try:
        period_end = datetime.fromisoformat(cpe)
    except ValueError:
        return school
    current_status = school.get("subscription_status", "active")
    if now <= period_end:
        # Only auto-set to active if not in webhook-driven grace/expired
        if current_status == "active":
            return school
        # Respect grace/expired set by webhook
        return school
    grace_until = period_end + timedelta(days=GRACE_DAYS)
    if now <= grace_until:
        if current_status != "grace":
            await db.schools.update_one({"id": school["id"]}, {"$set": {"subscription_status": "grace", "grace_until": grace_until.isoformat()}})
            school["subscription_status"] = "grace"
            school["grace_until"] = grace_until.isoformat()
        return school
    # Expired → downgrade to free
    await db.schools.update_one(
        {"id": school["id"]},
        {"$set": {
            "plan": "free",
            "subscription_status": "expired",
            "student_limit": FREE_STUDENT_LIMIT,
            "grace_until": grace_until.isoformat(),
        }},
    )
    school["plan"] = "free"
    school["subscription_status"] = "expired"
    school["student_limit"] = FREE_STUDENT_LIMIT
    school["grace_until"] = grace_until.isoformat()
    return school


# ---------- Routes ----------
@router.post("", response_model=School)
async def create_school(payload: SchoolCreate, user: dict = Depends(role_required(["principal"]))):
    if user.get("school_id"):
        existing = await db.schools.find_one({"id": user["school_id"]}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="You already manage a school")
    # Generate unique code
    for _ in range(8):
        code = gen_code()
        if not await db.schools.find_one({"code": code}):
            break
    else:
        raise HTTPException(status_code=500, detail="Could not generate unique code")
    school_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": school_id,
        "name": payload.name,
        "code": code,
        "principal_id": user["id"],
        "plan": "free",
        "subscription_status": "active",
        "current_period_end": None,
        "grace_until": None,
        "student_limit": FREE_STUDENT_LIMIT,
        "created_at": now_iso,
    }
    await db.schools.insert_one(doc)
    await db.users.update_one({"id": user["id"]}, {"$set": {"school_id": school_id}})
    return School(**school_view(doc))


@router.get("/me", response_model=School)
async def my_school(user: dict = Depends(get_current_user)):
    school = await get_user_school(user)
    if not school:
        raise HTTPException(status_code=404, detail="No school yet")
    school = await refresh_subscription_state(school)
    members = await db.users.count_documents({"school_id": school["id"]})
    students = await db.students.count_documents({"school_id": school["id"]})
    view = school_view(school)
    view["member_count"] = members
    view["student_count"] = students
    return School(**view)


@router.post("/join", response_model=School)
async def join_school(payload: SchoolJoin, user: dict = Depends(get_current_user)):
    if user["role"] == "principal":
        raise HTTPException(status_code=400, detail="Principals create their own schools")
    if user.get("school_id"):
        raise HTTPException(status_code=400, detail="You are already in a school")
    school = await db.schools.find_one({"code": payload.code.upper()}, {"_id": 0})
    if not school:
        raise HTTPException(status_code=404, detail="School code not found")
    await db.users.update_one({"id": user["id"]}, {"$set": {"school_id": school["id"]}})
    school = await refresh_subscription_state(school)
    return School(**school_view(school))


@router.post("/subscribe", response_model=School)
async def subscribe_pro(user: dict = Depends(role_required(["principal"]))):
    """MOCKED upgrade to Pro for 30 days. Razorpay integration pending."""
    school = await get_user_school(user)
    if not school:
        raise HTTPException(status_code=400, detail="Create a school first")
    now = datetime.now(timezone.utc)
    period_end = now + timedelta(days=PRO_DURATION_DAYS)
    await db.schools.update_one(
        {"id": school["id"]},
        {"$set": {
            "plan": "pro",
            "subscription_status": "active",
            "current_period_end": period_end.isoformat(),
            "grace_until": None,
            "student_limit": 100000,
            "_mock_subscribed_at": now.isoformat(),
        }},
    )
    logger.info(f"[MOCK] Pro subscription activated for school {school['id']} until {period_end.isoformat()}")
    school.update({
        "plan": "pro",
        "subscription_status": "active",
        "current_period_end": period_end.isoformat(),
        "grace_until": None,
        "student_limit": 100000,
    })
    return School(**school_view(school))


@router.get("/members")
async def list_members(user: dict = Depends(role_required(["principal"]))):
    school = await get_user_school(user)
    if not school:
        raise HTTPException(status_code=404, detail="No school yet")
    items = await db.users.find(
        {"school_id": school["id"]},
        {"_id": 0, "password_hash": 0},
    ).sort("created_at", -1).to_list(500)
    return items


@router.delete("/leave")
async def leave_school(user: dict = Depends(get_current_user)):
    if user["role"] == "principal":
        raise HTTPException(status_code=400, detail="Principals cannot leave their own school")
    if not user.get("school_id"):
        raise HTTPException(status_code=400, detail="You are not in a school")
    await db.users.update_one({"id": user["id"]}, {"$set": {"school_id": None}})
    return {"ok": True}
