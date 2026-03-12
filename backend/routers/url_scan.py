from fastapi import APIRouter
from pydantic import BaseModel
from services.threat_service import scan_url

router = APIRouter()


class URLRequest(BaseModel):
    url: str


@router.post("")
async def url_scan(req: URLRequest):
    if not req.url or len(req.url.strip()) < 4:
        return {"error": "Please provide a valid URL."}
    return await scan_url(req.url.strip())
