"""SQLAlchemy ORM models for SnapBin."""
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)

    parts: Mapped[list["Part"]] = relationship(back_populates="category")


class Location(Base):
    """A physical storage location: cabinet -> drawer -> bin, nested via parent_id."""

    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("locations.id"), nullable=True)

    parts: Mapped[list["Part"]] = relationship(back_populates="location")


class Part(Base):
    __tablename__ = "parts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    manufacturer: Mapped[str | None] = mapped_column(String(200), nullable=True)
    mpn: Mapped[str | None] = mapped_column(String(200), nullable=True, index=True)  # manufacturer part number
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    value: Mapped[str | None] = mapped_column(String(100), nullable=True)  # e.g. "10k", "100nF"
    package: Mapped[str | None] = mapped_column(String(100), nullable=True)  # e.g. "0805", "TO-220", "DIP-8"

    quantity: Mapped[float] = mapped_column(Float, default=0)
    unit: Mapped[str] = mapped_column(String(30), default="pcs")
    quantity_threshold: Mapped[float] = mapped_column(Float, default=5)  # low-stock alert level

    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    datasheet_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    tags: Mapped[str | None] = mapped_column(String(500), nullable=True)  # comma-separated

    ai_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    ai_identified: Mapped[bool] = mapped_column(Boolean, default=False)

    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    location_id: Mapped[int | None] = mapped_column(ForeignKey("locations.id"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    category: Mapped[Category | None] = relationship(back_populates="parts")
    location: Mapped[Location | None] = relationship(back_populates="parts")
    bom_items: Mapped[list["BOMItem"]] = relationship(back_populates="part")


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="planning")  # planning|active|complete|archived
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    bom_items: Mapped[list["BOMItem"]] = relationship(back_populates="project", cascade="all, delete-orphan")


class BOMItem(Base):
    """A line in a project's bill of materials."""

    __tablename__ = "bom_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    part_id: Mapped[int] = mapped_column(ForeignKey("parts.id"))
    quantity_required: Mapped[float] = mapped_column(Float, default=1)

    project: Mapped[Project] = relationship(back_populates="bom_items")
    part: Mapped[Part] = relationship(back_populates="bom_items")


class ScanLog(Base):
    """Record of an AI recognition attempt, for auditing / retraining prompts later."""

    __tablename__ = "scan_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    image_url: Mapped[str] = mapped_column(String(500))
    ai_provider: Mapped[str | None] = mapped_column(String(50), nullable=True)
    raw_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    matched_part_id: Mapped[int | None] = mapped_column(ForeignKey("parts.id"), nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    source: Mapped[str] = mapped_column(String(30), default="web")  # web|capture-station
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
