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
from routes.schools import router as schools_router
from routes.sentiment import router as sentiment_router
from routes.students import router as students_router
from routes.whatsapp import router as whatsapp_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("school_id")
    await db.students.create_index("teacher_id")
    await db.students.create_index("school_id")
    await db.children.create_index("parent_id")
    await db.children.create_index("school_id")
    await db.sentiment_records.create_index("user_id")
    await db.sentiment_records.create_index("kind")
    await db.sentiment_records.create_index("created_at")
    await db.sentiment_records.create_index("child_id")
    await db.sentiment_records.create_index("school_id")
    await db.astrology_results.create_index("user_id")
    await db.astrology_results.create_index("child_id")
    await db.astrology_results.create_index("school_id")
    await db.schools.create_index("code", unique=True)
    await db.schools.create_index("principal_id")

    # Seed principal admin (idempotent)
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        admin_id = str(uuid.uuid4())
        await db.users.insert_one({
            "id": admin_id,
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

    # Seed default school for the seeded principal + backfill legacy data
    admin = await db.users.find_one({"email": ADMIN_EMAIL})
    if admin:
        if not admin.get("school_id"):
            existing_school = await db.schools.find_one({"principal_id": admin["id"]})
            if existing_school:
                school_id = existing_school["id"]
            else:
                school_id = str(uuid.uuid4())
                await db.schools.insert_one({
                    "id": school_id,
                    "name": "EDUSENSE Demo",
                    "code": "DEMO01",
                    "principal_id": admin["id"],
                    "plan": "free",
                    "subscription_status": "active",
                    "current_period_end": None,
                    "grace_until": None,
                    "student_limit": 30,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                })
                logger.info("Seeded default school 'EDUSENSE Demo' (code DEMO01)")
            await db.users.update_one({"id": admin["id"]}, {"$set": {"school_id": school_id}})
        else:
            school_id = admin["school_id"]

        # Backfill legacy records to default school
        for col in ("students", "children", "sentiment_records", "astrology_results"):
            await db[col].update_many(
                {"$or": [{"school_id": {"$exists": False}}, {"school_id": None}]},
                {"$set": {"school_id": school_id}},
            )
        # Backfill users with no school_id
        await db.users.update_many(
            {"$or": [{"school_id": {"$exists": False}}, {"school_id": None}]},
            {"$set": {"school_id": school_id}},
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
api_router.include_router(schools_router)
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
