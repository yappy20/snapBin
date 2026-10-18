"""Pydantic request/response schemas."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict


# ---------- Category ----------
class CategoryBase(BaseModel):
    name: str
    parent_id: int | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Location ----------
class LocationBase(BaseModel):
    name: str
    description: str | None = None
    parent_id: int | None = None


class LocationCreate(LocationBase):
    pass


class LocationOut(LocationBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    part_count: int = 0


# ---------- Part ----------
class PartBase(BaseModel):
    name: str
    manufacturer: str | None = None
    mpn: str | None = None
    description: str | None = None
    value: str | None = None
    package: str | None = None
    quantity: float = 0
    unit: str = "pcs"
    quantity_threshold: float = 5
    image_url: str | None = None
    datasheet_url: str | None = None
    tags: str | None = None
    category_id: int | None = None
    location_id: int | None = None


class PartCreate(PartBase):
    ai_confidence: float | None = None
    ai_identified: bool = False


class PartUpdate(BaseModel):
    name: str | None = None
    manufacturer: str | None = None
    mpn: str | None = None
    description: str | None = None
    value: str | None = None
    package: str | None = None
    quantity: float | None = None
    unit: str | None = None
    quantity_threshold: float | None = None
    image_url: str | None = None
    datasheet_url: str | None = None
    tags: str | None = None
    category_id: int | None = None
    location_id: int | None = None


class QuantityAdjust(BaseModel):
    delta: float  # positive to add stock, negative to consume


class PartOut(PartBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    ai_confidence: float | None = None
    ai_identified: bool = False
    created_at: datetime
    updated_at: datetime
    category: CategoryOut | None = None
    location: LocationOut | None = None


# ---------- Project / BOM ----------
class BOMItemBase(BaseModel):
    part_id: int
    quantity_required: float = 1


class BOMItemCreate(BOMItemBase):
    pass


class BOMItemOut(BOMItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    part: PartOut


class ProjectBase(BaseModel):
    name: str
    description: str | None = None
    status: str = "planning"


class ProjectCreate(ProjectBase):
    pass


class ProjectOut(ProjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    bom_items: list[BOMItemOut] = []


# ---------- Scan / AI ----------
class ScanCandidate(BaseModel):
    name: str
    manufacturer: str | None = None
    mpn: str | None = None
    category: str | None = None
    value: str | None = None
    package: str | None = None
    description: str | None = None
    confidence: float
    matched_part_id: int | None = None  # set if this looks like an existing inventory item


class ScanResult(BaseModel):
    image_url: str
    provider: str
    candidates: list[ScanCandidate]
    scan_log_id: int


# ---------- Alerts ----------
class LowStockAlert(BaseModel):
    part: PartOut
    shortfall: float


# ---------- Settings (runtime-visible subset only; secrets are never returned) ----------
class SettingsOut(BaseModel):
    ai_provider: str
    ai_configured: bool
    mouser_configured: bool
    capture_key_is_default: bool
