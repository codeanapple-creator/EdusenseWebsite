"""LLM helpers (emergentintegrations + JSON parsing) with timeout."""
import asyncio
import json
import re

from fastapi import HTTPException
from emergentintegrations.llm.chat import LlmChat, UserMessage

from .config import EMERGENT_LLM_KEY, logger

LLM_TIMEOUT_SECONDS = 45


async def llm_json(system: str, prompt: str, session_id: str) -> str:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")
    try:
        return await asyncio.wait_for(
            chat.send_message(UserMessage(text=prompt)),
            timeout=LLM_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        logger.warning(f"LLM call timed out after {LLM_TIMEOUT_SECONDS}s (session={session_id})")
        raise HTTPException(status_code=504, detail=f"AI service timed out after {LLM_TIMEOUT_SECONDS}s. Please retry.")


def parse_json_text(text: str) -> dict:
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    if fence:
        text = fence.group(1).strip()
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        text = m.group(0)
    return json.loads(text)
