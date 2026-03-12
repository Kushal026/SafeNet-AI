from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from database import get_db, AsyncSessionLocal
from models import ScanHistory
from sqlalchemy import select, desc
import datetime
import json

router = APIRouter()


class HistoryCreate(BaseModel):
    scan_type: str
    input_data: str
    result_summary: str
    risk_level: str
    score: Optional[float] = 0.0


@router.get("")
async def get_history(limit: int = 50):
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ScanHistory).order_by(desc(ScanHistory.created_at)).limit(limit)
        )
        rows = result.scalars().all()
        return [
            {
                "id": r.id,
                "scan_type": r.scan_type,
                "input_data": r.input_data[:80] + "..." if len(r.input_data) > 80 else r.input_data,
                "result_summary": r.result_summary,
                "risk_level": r.risk_level,
                "score": r.score,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ]


@router.post("")
async def add_history(item: HistoryCreate):
    async with AsyncSessionLocal() as db:
        entry = ScanHistory(
            scan_type=item.scan_type,
            input_data=item.input_data,
            result_summary=item.result_summary,
            risk_level=item.risk_level,
            score=item.score,
            created_at=datetime.datetime.utcnow(),
        )
        db.add(entry)
        await db.commit()
        await db.refresh(entry)
        return {"id": entry.id, "status": "saved"}


@router.delete("")
async def clear_history():
    async with AsyncSessionLocal() as db:
        await db.execute(ScanHistory.__table__.delete())
        await db.commit()
        return {"status": "cleared"}
