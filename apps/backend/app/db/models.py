from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    tool_id: Mapped[str] = mapped_column(String(64), index=True)
    status: Mapped[str] = mapped_column(String(20), index=True)
    original_filename: Mapped[str] = mapped_column(String(512))
    options_json: Mapped[str] = mapped_column(Text, default="{}")
    progress: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    progress_stage: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    error_code: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    output_filename: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    output_mime: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    output_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    files: Mapped[list["JobFile"]] = relationship(
        back_populates="job", cascade="all, delete-orphan", order_by="JobFile.order_index"
    )


class JobFile(Base):
    __tablename__ = "job_files"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(16))
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    original_filename: Mapped[str] = mapped_column(String(512))
    storage_name: Mapped[str] = mapped_column(String(255))
    mime_type: Mapped[str] = mapped_column(String(128))
    size_bytes: Mapped[int] = mapped_column(Integer)

    job: Mapped[Job] = relationship(back_populates="files")
