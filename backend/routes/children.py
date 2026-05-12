"""Children CRUD (parent only) + linkage to sentiment/astrology."""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from core.auth import role_required, get_current_user
from core.config import db
from core.tenancy import require_user_school

router = APIRouter(prefix="/children", tags=["children"])


class ChildCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    date_of_birth: Optional[str] = None  # YYYY-MM-DD
    grade: Optional[str] = None
    age: Optional[int] = Field(default=None, ge=0, le=25)
    notes: Optional[str] = None


class ChildUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=80)
    date_of_birth: Optional[str] = None
    grade: Optional[str] = None
    age: Optional[int] = Field(default=None, ge=0, le=25)
    notes: Optional[str] = None


class Child(BaseModel):
    id: str
    parent_id: str
    school_id: str
    name: str
    date_of_birth: Optional[str] = None
    grade: Optional[str] = None
    age: Optional[int] = None
    notes: Optional[str] = None
    created_at: str


@router.post("", response_model=Child)
async def create_child(payload: ChildCreate, user: dict = Depends(role_required(["parent"]))):
    school_id = await require_user_school(user)
    child_id = str(uuid.uuid4())
    doc = {
        "id": child_id,
        "parent_id": user["id"],
        "school_id": school_id,
        "name": payload.name,
        "date_of_birth": payload.date_of_birth,
        "grade": payload.grade,
        "age": payload.age,
        "notes": payload.notes,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.children.insert_one(doc)
    return Child(**{k: v for k, v in doc.items() if k != "_id"})


@router.get("", response_model=List[Child])
async def list_children(user: dict = Depends(get_current_user)):
    school_id = await require_user_school(user)
    if user["role"] == "parent":
        q = {"parent_id": user["id"], "school_id": school_id}
    elif user["role"] == "principal":
        q = {"school_id": school_id}
    else:
        raise HTTPException(status_code=403, detail="Forbidden: role not allowed")
    return await db.children.find(q, {"_id": 0}).sort("created_at", -1).to_list(200)


@router.patch("/{child_id}", response_model=Child)
async def update_child(child_id: str, payload: ChildUpdate, user: dict = Depends(role_required(["parent"]))):
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    result = await db.children.update_one(
        {"id": child_id, "parent_id": user["id"]},
        {"$set": updates},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Child not found")
    doc = await db.children.find_one({"id": child_id}, {"_id": 0})
    return Child(**doc)


@router.delete("/{child_id}")
async def delete_child(child_id: str, user: dict = Depends(role_required(["parent"]))):
    result = await db.children.delete_one({"id": child_id, "parent_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Child not found")
    return {"ok": True}
