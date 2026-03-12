# SafeNet-AI - Complete Running Guide

## Quick Start (From Scratch)

### Prerequisites
- **Node.js** (v18+): https://nodejs.org
- **Python** (v3.11+): https://python.org

### Step 1: Install Dependencies
```bash
# Frontend
npm install

# Backend
cd backend
pip install -r requirements.txt
```

### Step 2: Configure (Optional - works without API keys)
Edit `backend/.env`:
```
OPENAI_API_KEY=sk-your-openai-key  # Optional - for AI chatbot
```

### Step 3: Start Backend
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

### Step 4: Start Frontend
```bash
npm run dev
```

### Step 5: Open Browser
```
http://localhost:5173
```

---

## What's Updated

### ✅ Real-Time Data
- Threat Intelligence fetches from public APIs (URLhaus, NVD)
- Realistic attack trends based on known patterns
- Live threat alerts updated dynamically

### ✅ Modern UI/UX
- Consistent color scheme (#00d4ff, #a78bfa, #00ff88, #ff2d55)
- Glassmorphism cards with glow effects
- Matrix rain animated background
- Responsive design for all devices

### ✅ Connected Features
- Landing Page: Live threat statistics
- Dashboard: Real-time alerts & stats
- All tools connected to backend APIs
- Floating AI Assistant working

---

## Features Working
1. AI Phishing Detector
2. URL Safety Scanner  
3. Password Strength Analyzer
4. App Permission Analyzer
5. Cyber Risk Score
6. AI Security Chatbot
7. Threat Intelligence Dashboard
