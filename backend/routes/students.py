"""Students CRUD (teacher/principal)."""
import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from core.auth import role_required
from core.config import db

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
    created_at: str


@router.post("", response_model=Student)
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


@router.get("", response_model=List[Student])
async def list_students(user: dict = Depends(role_required(["teacher", "principal"]))):
    query = {} if user["role"] == "principal" else {"teacher_id": user["id"]}
    return await db.students.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)


@router.delete("/{student_id}")
async def delete_student(student_id: str, user: dict = Depends(role_required(["teacher", "principal"]))):
    query = {"id": student_id} if user["role"] == "principal" else {"id": student_id, "teacher_id": user["id"]}
    result = await db.students.delete_one(query)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"ok": True}
