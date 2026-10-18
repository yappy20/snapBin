"""Pluggable AI vision provider abstraction.

SnapBin identifies electronic components from a photo by sending the image
to a vision-capable multimodal model with a prompt asking for structured
JSON describing what it sees. This keeps SnapBin provider-agnostic: swap in
any provider by implementing `AIProvider.identify()`.
"""
from __future__ import annotations

import abc
import json
import re
from dataclasses import dataclass, field

from app.config import Settings, get_settings

IDENTIFY_PROMPT = """You are an expert electronics technician helping catalog components for a \
personal parts inventory. Look closely at the photo (which may show one component or several \
on a workbench/in a bin) and identify each distinct electronic component you can see.

For EACH distinct component, provide:
- name: a short human-readable name (e.g. "10k Ohm Resistor", "NE555 Timer IC", "2N2222 NPN Transistor")
- manufacturer: if visible from markings/packaging, else null
- mpn: manufacturer part number if you can read it on the part or packaging, else null
- category: one of [Resistor, Capacitor, Inductor, Diode, Transistor, IC, Connector, Switch, \
Sensor, LED, Microcontroller Board, Module, Cable, Hardware, Other]
- value: electrical value if applicable (e.g. "10k", "100nF", "5V"), else null
- package: physical package/footprint if identifiable (e.g. "0805", "TO-92", "DIP-8", "SOT-23"), else null
- description: one short sentence describing the part and any distinguishing markings you can read
- confidence: your confidence in this identification, from 0.0 to 1.0

Respond with ONLY a JSON array of objects with exactly these fields, no markdown fences, no prose. \
If you cannot identify anything, respond with an empty JSON array [].
"""


@dataclass
class RawCandidate:
    name: str
    manufacturer: str | None = None
    mpn: str | None = None
    category: str | None = None
    value: str | None = None
    package: str | None = None
    description: str | None = None
    confidence: float = 0.5


@dataclass
class IdentifyResult:
    provider: str
    candidates: list[RawCandidate] = field(default_factory=list)
    raw_response: str = ""


def parse_json_candidates(text: str) -> list[RawCandidate]:
    """Best-effort extraction of a JSON array of candidates from model output."""
    cleaned = text.strip()
    # Strip markdown code fences if the model added them despite instructions.
    cleaned = re.sub(r"^```(json)?", "", cleaned.strip(), flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"```$", "", cleaned.strip()).strip()

    match = re.search(r"\[.*\]", cleaned, flags=re.DOTALL)
    json_str = match.group(0) if match else cleaned

    try:
        data = json.loads(json_str)
    except (json.JSONDecodeError, ValueError):
        return []

    if not isinstance(data, list):
        return []

    candidates: list[RawCandidate] = []
    for item in data:
        if not isinstance(item, dict) or "name" not in item:
            continue
        candidates.append(
            RawCandidate(
                name=str(item.get("name") or "Unknown component"),
                manufacturer=item.get("manufacturer") or None,
                mpn=item.get("mpn") or None,
                category=item.get("category") or None,
                value=item.get("value") or None,
                package=item.get("package") or None,
                description=item.get("description") or None,
                confidence=float(item.get("confidence") or 0.5),
            )
        )
    return candidates


class AIProvider(abc.ABC):
    name: str = "base"

    @abc.abstractmethod
    async def identify(self, image_bytes: bytes, mime_type: str) -> IdentifyResult:
        ...


class NoOpProvider(AIProvider):
    """Used when no API key is configured; the Scan page will explain how to set one up."""

    name = "none"

    async def identify(self, image_bytes: bytes, mime_type: str) -> IdentifyResult:
        return IdentifyResult(provider=self.name, candidates=[], raw_response="")


def get_ai_provider(settings: Settings | None = None) -> AIProvider:
    settings = settings or get_settings()

    if settings.ai_provider == "anthropic" and settings.anthropic_api_key:
        from app.ai.anthropic_provider import AnthropicProvider

        return AnthropicProvider(api_key=settings.anthropic_api_key, model=settings.anthropic_model)

    if settings.ai_provider == "openai" and settings.openai_api_key:
        from app.ai.openai_provider import OpenAIProvider

        return OpenAIProvider(api_key=settings.openai_api_key, model=settings.openai_model)

    return NoOpProvider()
