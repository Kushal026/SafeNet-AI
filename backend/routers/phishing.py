from fastapi import APIRouter
from pydantic import BaseModel
from services.ai_analyzer import detect_phishing

router = APIRouter()


class PhishingRequest(BaseModel):
    text: str


@router.post("")
async def phishing_detect(req: PhishingRequest):
    if not req.text or len(req.text.strip()) < 10:
        return {"error": "Please provide at least 10 characters of text to analyze."}
    return detect_phishing(req.text)
