"""WhatsApp contact endpoint."""
from fastapi import APIRouter

from core.config import WHATSAPP_NUMBER

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])


@router.get("/contact")
async def whatsapp_contact():
    num_clean = WHATSAPP_NUMBER.replace("+", "").replace(" ", "")
    return {"number": WHATSAPP_NUMBER, "link": f"https://wa.me/{num_clean}"}
