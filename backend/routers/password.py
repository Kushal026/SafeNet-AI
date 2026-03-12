from fastapi import APIRouter
from pydantic import BaseModel
from services.ai_analyzer import analyze_password
from services.threat_service import check_password_breach

router = APIRouter()


class PasswordRequest(BaseModel):
    password: str


@router.post("")
async def password_analyze(req: PasswordRequest):
    if not req.password:
        return {"error": "Password cannot be empty."}
    result = analyze_password(req.password)
    breach = await check_password_breach(req.password)
    result["breach_check"] = breach
    return result
