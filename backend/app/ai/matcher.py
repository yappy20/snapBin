"""Fuzzy-match an AI-identified candidate against existing inventory so the
Scan flow can offer "increment existing part" instead of always creating a
duplicate row."""
from difflib import SequenceMatcher

from sqlalchemy.orm import Session

from app import models
from app.ai.base import RawCandidate

MATCH_THRESHOLD = 0.72


def _similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


def find_best_match(db: Session, candidate: RawCandidate) -> tuple[models.Part | None, float]:
    parts = db.query(models.Part).all()
    if not parts:
        return None, 0.0

    best_part: models.Part | None = None
    best_score = 0.0

    for part in parts:
        score = 0.0
        # Exact MPN match is a near-certain hit.
        if candidate.mpn and part.mpn and candidate.mpn.strip().lower() == part.mpn.strip().lower():
            score = 1.0
        else:
            name_score = _similarity(candidate.name, part.name)
            value_score = _similarity(candidate.value or "", part.value or "") if candidate.value and part.value else 0
            score = max(name_score, (name_score + value_score) / 2 if value_score else name_score)

        if score > best_score:
            best_score = score
            best_part = part

    if best_score >= MATCH_THRESHOLD:
        return best_part, best_score
    return None, best_score
