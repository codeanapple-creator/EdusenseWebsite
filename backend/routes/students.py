"""Students CRUD (teacher/principal)."""
import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from core.auth import role_required
from core.config import db
from core.tenancy import require_user_school

router = APIRouter(prefix="/students", tags=["students"])


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
    school_id: str
    created_at: str


@router.post("", response_model=Student)
async def create_student(payload: StudentCreate, user: dict = Depends(role_required(["teacher", "principal"]))):
    school_id = await require_user_school(user)
    # Soft quota check on Free plan
    school = await db.schools.find_one({"id": school_id}, {"_id": 0})
    if school and school.get("plan") == "free":
        current = await db.students.count_documents({"school_id": school_id})
        if current >= school.get("student_limit", 30):
            raise HTTPException(
                status_code=402,
                detail=f"Free plan limit of {school.get('student_limit', 30)} students reached. Upgrade to Pro to add more.",
            )
    student_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": student_id,
        "name": payload.name,
        "grade": payload.grade,
        "age": payload.age,
        "subject_focus": payload.subject_focus,
        "teacher_id": user["id"],
        "school_id": school_id,
        "created_at": now_iso,
    }
    await db.students.insert_one(doc)
    return Student(**{k: v for k, v in doc.items() if k != "_id"})


@router.get("", response_model=List[Student])
async def list_students(user: dict = Depends(role_required(["teacher", "principal"]))):
    school_id = await require_user_school(user)
    query: dict = {"school_id": school_id}
    if user["role"] == "teacher":
        query["teacher_id"] = user["id"]
    return await db.students.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)


@router.delete("/{student_id}")
async def delete_student(student_id: str, user: dict = Depends(role_required(["teacher", "principal"]))):
    school_id = await require_user_school(user)
    query = {"id": student_id, "school_id": school_id}
    if user["role"] != "principal":
        query["teacher_id"] = user["id"]
    result = await db.students.delete_one(query)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"ok": True}
