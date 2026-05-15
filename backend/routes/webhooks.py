"""Razorpay webhook handler - subscription.* events.

Verifies HMAC-SHA256 signature, dedupes by event id, then transitions the
school's subscription state. Idempotent + safe.
"""
import hmac
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, Header, Request

from core.config import RAZORPAY_WEBHOOK_SECRET, db, logger

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

PRO_DURATION_DAYS = 30
GRACE_DAYS = 7
PRO_STUDENT_LIMIT = 100000
FREE_STUDENT_LIMIT = 30


def _verify_signature(raw_body: bytes, signature: Optional[str]) -> bool:
    if not RAZORPAY_WEBHOOK_SECRET or not signature:
        return False
    expected = hmac.new(
        key=RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
        msg=raw_body,
        digestmod=hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


async def _find_school(payload: dict) -> Optional[dict]:
    """Resolve school from webhook payload.

    Priority: payload.subscription.entity.notes.school_id → schools.razorpay_subscription_id.
    """
    sub_entity = (((payload or {}).get("payload") or {}).get("subscription") or {}).get("entity") or {}
    notes = sub_entity.get("notes") or {}
    school_id = notes.get("school_id") if isinstance(notes, dict) else None
    if school_id:
        school = await db.schools.find_one({"id": school_id}, {"_id": 0})
        if school:
            return school
    sub_id = sub_entity.get("id")
    if sub_id:
        return await db.schools.find_one({"razorpay_subscription_id": sub_id}, {"_id": 0})
    return None


async def _handle_activated_or_charged(school: dict, sub_entity: dict) -> dict:
    now = datetime.now(timezone.utc)
    # current_end if provided (Razorpay sends epoch seconds in current_end)
    cur_end_epoch = sub_entity.get("current_end")
    if cur_end_epoch:
        try:
            period_end = datetime.fromtimestamp(int(cur_end_epoch), tz=timezone.utc)
        except (TypeError, ValueError):
            period_end = now + timedelta(days=PRO_DURATION_DAYS)
    else:
        period_end = now + timedelta(days=PRO_DURATION_DAYS)
    update = {
        "plan": "pro",
        "subscription_status": "active",
        "current_period_end": period_end.isoformat(),
        "grace_until": None,
        "student_limit": PRO_STUDENT_LIMIT,
        "razorpay_subscription_id": sub_entity.get("id"),
        "last_webhook_at": now.isoformat(),
    }
    await db.schools.update_one({"id": school["id"]}, {"$set": update})
    return {**school, **update}


async def _handle_paused(school: dict) -> dict:
    now = datetime.now(timezone.utc)
    cpe = school.get("current_period_end")
    try:
        period_end = datetime.fromisoformat(cpe) if cpe else now
    except ValueError:
        period_end = now
    grace_until = max(now, period_end) + timedelta(days=GRACE_DAYS)
    update = {
        "subscription_status": "grace",
        "grace_until": grace_until.isoformat(),
        "last_webhook_at": now.isoformat(),
    }
    await db.schools.update_one({"id": school["id"]}, {"$set": update})
    return {**school, **update}


async def _handle_cancelled_or_completed(school: dict) -> dict:
    now = datetime.now(timezone.utc)
    update = {
        "plan": "free",
        "subscription_status": "expired",
        "student_limit": FREE_STUDENT_LIMIT,
        "grace_until": now.isoformat(),
        "last_webhook_at": now.isoformat(),
    }
    await db.schools.update_one({"id": school["id"]}, {"$set": update})
    return {**school, **update}


@router.post("/razorpay")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(default=None, alias="X-Razorpay-Signature"),
    x_razorpay_event_id: Optional[str] = Header(default=None, alias="X-Razorpay-Event-Id"),
):
    if not RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Razorpay webhook secret not configured. Set RAZORPAY_WEBHOOK_SECRET to enable.",
        )

    raw = await request.body()
    if not _verify_signature(raw, x_razorpay_signature):
        logger.warning("Razorpay webhook: invalid signature")
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Idempotency
    if x_razorpay_event_id:
        existing = await db.webhook_events.find_one({"event_id": x_razorpay_event_id})
        if existing:
            return {"ok": True, "duplicate": True}

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    event = str(body.get("event") or "")
    sub_entity = (((body.get("payload") or {}).get("subscription") or {}).get("entity")) or {}
    school = await _find_school(body)
    record_dt = datetime.now(timezone.utc).isoformat()

    handled = False
    if school is not None:
        if event in ("subscription.activated", "subscription.charged", "subscription.resumed"):
            await _handle_activated_or_charged(school, sub_entity)
            handled = True
        elif event == "subscription.paused":
            await _handle_paused(school)
            handled = True
        elif event in ("subscription.cancelled", "subscription.completed", "subscription.halted"):
            await _handle_cancelled_or_completed(school)
            handled = True

    # Persist event record (idempotent dedupe)
    record = {
        "event_id": x_razorpay_event_id or f"unknown-{record_dt}",
        "event": event,
        "school_id": school["id"] if school else None,
        "subscription_id": sub_entity.get("id"),
        "handled": handled,
        "received_at": record_dt,
        "raw": body,
    }
    try:
        await db.webhook_events.insert_one(record)
    except Exception:
        # Race: if another worker inserted the same event_id, treat as duplicate
        pass

    logger.info(
        f"Razorpay webhook event={event} school_id={record['school_id']} "
        f"sub_id={record['subscription_id']} handled={handled}"
    )
    return {"ok": True, "event": event, "handled": handled, "school_id": record["school_id"]}
