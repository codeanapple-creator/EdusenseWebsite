"""Core configuration and shared resources."""
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.security import HTTPBearer

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

# Env
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
WHATSAPP_NUMBER = os.environ.get("WHATSAPP_NUMBER", "+919999999999")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "principal@edusense.com").lower()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin@123")

# Mongo
mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client[DB_NAME]

# Security
security = HTTPBearer(auto_error=False)

# Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("edusense")
