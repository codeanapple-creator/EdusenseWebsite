"""EDUSENSE FastAPI app — slim entrypoint with modular routers."""
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import APIRouter, FastAPI
from starlette.middleware.cors import CORSMiddleware

from core.config import (
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    CORS_ORIGINS,
    db,
    logger,
    mongo_client,
)
from core.auth import hash_password, verify_password
from routes.analytics import router as analytics_router
from routes.astrology import router as astrology_router
from routes.auth import router as auth_router
from routes.children import router as children_router
from routes.recommendations import router as recommendations_router
from routes.sentiment import router as sentiment_router
from routes.students import router as students_router
from routes.whatsapp import router as whatsapp_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.students.create_index("teacher_id")
    await db.children.create_index("parent_id")
    await db.sentiment_records.create_index("user_id")
    await db.sentiment_records.create_index("kind")
    await db.sentiment_records.create_index("created_at")
    await db.sentiment_records.create_index("child_id")
    await db.astrology_results.create_index("user_id")
    await db.astrology_results.create_index("child_id")

    # Seed principal admin (idempotent)
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "name": "Principal Admin",
            "email": ADMIN_EMAIL,
            "role": "principal",
            "password_hash": hash_password(ADMIN_PASSWORD),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin: {ADMIN_EMAIL}")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one(
            {"email": ADMIN_EMAIL},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD), "role": "principal"}},
        )

    yield
    mongo_client.close()


app = FastAPI(title="EDUSENSE API", lifespan=lifespan)

api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"app": "EDUSENSE by Codeanapple", "status": "ok"}


api_router.include_router(auth_router)
api_router.include_router(astrology_router)
api_router.include_router(recommendations_router)
api_router.include_router(students_router)
api_router.include_router(children_router)
api_router.include_router(sentiment_router)
api_router.include_router(analytics_router)
api_router.include_router(whatsapp_router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
