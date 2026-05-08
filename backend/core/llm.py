"""LLM helpers (emergentintegrations + JSON parsing)."""
import json
import re

from emergentintegrations.llm.chat import LlmChat, UserMessage

from .config import EMERGENT_LLM_KEY


async def llm_json(system: str, prompt: str, session_id: str) -> str:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")
    return await chat.send_message(UserMessage(text=prompt))


def parse_json_text(text: str) -> dict:
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    if fence:
        text = fence.group(1).strip()
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        text = m.group(0)
    return json.loads(text)
