"""Auth endpoints: register, login, me."""
import uuid
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from core.auth import create_access_token, get_current_user, hash_password, verify_password
from core.config import db

router = APIRouter(prefix="/auth", tags=["auth"])

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


@router.post("/register", response_model=AuthResponse)
async def register(payload: RegisterRequest):
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    await db.users.insert_one({
        "id": user_id,
        "name": payload.name,
        "email": email,
        "role": payload.role,
        "password_hash": hash_password(payload.password),
        "created_at": now_iso,
    })
    token = create_access_token(user_id, email, payload.role)
    return AuthResponse(
        token=token,
        user=UserOut(id=user_id, name=payload.name, email=email, role=payload.role, created_at=now_iso),
    )


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.get("role") != payload.role:
        raise HTTPException(
            status_code=403,
            detail=f"This account is registered as {user.get('role')}, not {payload.role}",
        )
    token = create_access_token(user["id"], user["email"], user["role"])
    return AuthResponse(
        token=token,
        user=UserOut(
            id=user["id"], name=user["name"], email=user["email"],
            role=user["role"], created_at=user["created_at"],
        ),
    )


@router.get("/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return UserOut(**user)
