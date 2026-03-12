from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.ai_analyzer import analyze_permissions

router = APIRouter()


class PermissionRequest(BaseModel):
    app_name: str
    permissions: List[str]


@router.post("")
async def app_permission_risk(req: PermissionRequest):
    if not req.app_name:
        return {"error": "App name is required."}
    if not req.permissions:
        return {"error": "At least one permission is required."}
    return analyze_permissions(req.app_name, req.permissions)
