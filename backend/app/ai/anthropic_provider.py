import base64

import httpx

from app.ai.base import AIProvider, IDENTIFY_PROMPT, IdentifyResult, parse_json_candidates

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"


class AnthropicProvider(AIProvider):
    name = "anthropic"

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-5"):
        self.api_key = api_key
        self.model = model

    async def identify(self, image_bytes: bytes, mime_type: str) -> IdentifyResult:
        b64 = base64.b64encode(image_bytes).decode("ascii")
        payload = {
            "model": self.model,
            "max_tokens": 2000,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {"type": "base64", "media_type": mime_type, "data": b64},
                        },
                        {"type": "text", "text": IDENTIFY_PROMPT},
                    ],
                }
            ],
        }
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(ANTHROPIC_API_URL, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()

        text = "".join(block.get("text", "") for block in data.get("content", []) if block.get("type") == "text")
        candidates = parse_json_candidates(text)
        return IdentifyResult(provider=self.name, candidates=candidates, raw_response=text)
