"""
SQLAlchemy ORM models for SafeNet-AI
"""
import datetime
from sqlalchemy import String, Text, Float, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class ScanHistory(Base):
    __tablename__ = "scan_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    scan_type: Mapped[str] = mapped_column(String(50))   # phishing | url | password | permission | risk
    input_data: Mapped[str] = mapped_column(Text)
    result_summary: Mapped[str] = mapped_column(Text)
    risk_level: Mapped[str] = mapped_column(String(20))   # safe | low | medium | high | critical
    score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String(100))
    role: Mapped[str] = mapped_column(String(10))   # user | assistant
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    answers: Mapped[str] = mapped_column(Text)   # JSON-encoded answers
    score: Mapped[float] = mapped_column(Float)
    risk_level: Mapped[str] = mapped_column(String(20))
    recommendations: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )
