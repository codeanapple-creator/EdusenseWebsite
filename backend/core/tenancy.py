"""School/tenant helpers."""
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException

from .config import db


DEFAULT_SCHOOL_NAME = "EDUSENSE Demo"
DEFAULT_SCHOOL_CODE = "DEMO01"


async def ensure_default_school() -> dict:
    """Get or create the default demo school. Used as fallback for legacy data."""
    existing = await db.schools.find_one({"code": DEFAULT_SCHOOL_CODE}, {"_id": 0})
    if existing:
        return existing
    # Find any principal to own it
    principal = await db.users.find_one({"role": "principal"}, {"_id": 0})
    pid = principal["id"] if principal else "system"
    doc = {
        "id": str(uuid.uuid4()),
        "name": DEFAULT_SCHOOL_NAME,
        "code": DEFAULT_SCHOOL_CODE,
        "principal_id": pid,
        "plan": "free",
        "subscription_status": "active",
        "current_period_end": None,
        "grace_until": None,
        "student_limit": 30,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.schools.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


async def assign_default_school_to_user(user_id: str) -> str:
    """Assign default school to a user without one, return school_id."""
    school = await ensure_default_school()
    await db.users.update_one({"id": user_id}, {"$set": {"school_id": school["id"]}})
    return school["id"]


async def require_user_school(user: dict) -> str:
    """Return current user's school_id, auto-assigning default if missing.

    Keeps existing tests / legacy users working while new flows use real tenancy.
    """
    sid = user.get("school_id")
    if sid:
        return sid
    return await assign_default_school_to_user(user["id"])


async def refresh_subscription(school_id: str) -> dict:
    """Lightweight subscription state machine; returns updated school doc."""
    from datetime import timedelta as _td  # local import to avoid cycle
    school = await db.schools.find_one({"id": school_id}, {"_id": 0})
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    if school.get("plan") != "pro":
        return school
    cpe = school.get("current_period_end")
    if not cpe:
        return school
    now = datetime.now(timezone.utc)
    try:
        period_end = datetime.fromisoformat(cpe)
    except ValueError:
        return school
    if now <= period_end:
        return school
    grace_until = period_end + _td(days=7)
    if now <= grace_until:
        await db.schools.update_one(
            {"id": school_id},
            {"$set": {"subscription_status": "grace", "grace_until": grace_until.isoformat()}},
        )
        school["subscription_status"] = "grace"
        school["grace_until"] = grace_until.isoformat()
        return school
    await db.schools.update_one(
        {"id": school_id},
        {"$set": {"plan": "free", "subscription_status": "expired",
                  "student_limit": 30, "grace_until": grace_until.isoformat()}},
    )
    school["plan"] = "free"
    school["subscription_status"] = "expired"
    school["student_limit"] = 30
    school["grace_until"] = grace_until.isoformat()
    return school
