"""
SafeNet-AI FastAPI Backend
Main application entry point
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import init_db
from routers import phishing, url_scan, password, permissions, risk_score, chat, threat_intel, history

load_dotenv()

app = FastAPI(
    title="SafeNet-AI API",
    description="Intelligent AI Cybersecurity Analysis Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend dev server and production
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    "http://localhost:3000",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(phishing.router, prefix="/phishing-detect", tags=["Phishing Detection"])
app.include_router(url_scan.router, prefix="/url-scan", tags=["URL Scanner"])
app.include_router(password.router, prefix="/password-analyze", tags=["Password Analysis"])
app.include_router(permissions.router, prefix="/app-permission-risk", tags=["App Permissions"])
app.include_router(risk_score.router, prefix="/cyber-risk-score", tags=["Risk Score"])
app.include_router(chat.router, prefix="/chat-assistant", tags=["AI Chatbot"])
app.include_router(threat_intel.router, prefix="/threat-intel", tags=["Threat Intelligence"])
app.include_router(history.router, prefix="/scan-history", tags=["Scan History"])


@app.on_event("startup")
async def startup():
    await init_db()


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "SafeNet-AI API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": [
            "/phishing-detect",
            "/url-scan",
            "/password-analyze",
            "/app-permission-risk",
            "/cyber-risk-score",
            "/chat-assistant",
            "/threat-intel",
            "/scan-history",
        ],
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
