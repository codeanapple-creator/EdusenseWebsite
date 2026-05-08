"""School analytics (principal)."""
from fastapi import APIRouter, Depends

from core.auth import role_required
from core.config import db

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview")
async def analytics_overview(user: dict = Depends(role_required(["principal"]))):
    total_users = await db.users.count_documents({})
    total_parents = await db.users.count_documents({"role": "parent"})
    total_teachers = await db.users.count_documents({"role": "teacher"})
    total_principals = await db.users.count_documents({"role": "principal"})
    total_students = await db.students.count_documents({})
    total_children = await db.children.count_documents({})
    total_astro = await db.astrology_results.count_documents({})

    pipeline = [
        {"$group": {"_id": "$grade", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    grade_dist = []
    async for doc in db.students.aggregate(pipeline):
        grade_dist.append({"grade": doc["_id"] or "N/A", "count": doc["count"]})

    return {
        "total_users": total_users,
        "total_parents": total_parents,
        "total_teachers": total_teachers,
        "total_principals": total_principals,
        "total_students": total_students,
        "total_children": total_children,
        "total_astrology_consults": total_astro,
        "grade_distribution": grade_dist,
    }
