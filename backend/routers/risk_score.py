from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from services.ai_analyzer import calculate_risk_score

router = APIRouter()


class RiskScoreRequest(BaseModel):
    answers: Dict[str, Any]


@router.post("")
async def cyber_risk_score(req: RiskScoreRequest):
    if not req.answers:
        return {"error": "Please provide questionnaire answers."}
    return calculate_risk_score(req.answers)
