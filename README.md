# SafeNet-AI 🛡️

**Intelligent AI-Powered Cybersecurity Platform**

SafeNet-AI is a modern cybersecurity dashboard that helps users detect phishing attacks, analyze suspicious URLs, check password strength, and improve their digital security using AI.

![SafeNet-AI](https://img.shields.io/badge/SafeNet-AI-v1.0.0-blue)
![React](https://img.shields.io/badge/React-18-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-green)

## ✨ Features

- 🤖 **AI Phishing Detector** - Analyze emails for phishing indicators
- 🌐 **URL Safety Scanner** - Check websites for malicious content
- 🔐 **Password Strength Analyzer** - Evaluate passwords with breach checking
- 📱 **App Permission Analyzer** - Identify dangerous permission combinations
- 💬 **AI Security Assistant** - Ask cybersecurity questions
- 📊 **Cyber Risk Score** - Personal security assessment
- 📈 **Threat Intelligence Dashboard** - Live cyber attack statistics

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/SafeNet-AI.git
cd SafeNet-AI

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

## 🔧 Configuration

Edit `backend/.env` to add API keys:

```env
# OpenAI API Key (for AI chatbot)
OPENAI_API_KEY=sk-your-key-here

# VirusTotal API Key (optional - for URL scanning)
VIRUSTOTAL_API_KEY=your-key-here
```

Get free API keys:
- OpenAI: https://platform.openai.com/api-keys
- VirusTotal: https://www.virustotal.com/gui/join-us

## 🛠️ Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide Icons
- Vite

### Backend
- FastAPI (Python)
- SQLAlchemy (async)
- OpenAI API
- HaveIBeenPwned API
- VirusTotal API (optional)

## 📁 Project Structure

```
SafeNet-AI/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   │   ├── LandingPage.jsx
│   │   ├── Dashboard.jsx
│   │   └── tools/       # Security tools
│   ├── utils/           # Utility functions
│   └── App.jsx          # Main app component
├── backend/
│   ├── routers/          # API endpoints
│   ├── services/         # AI & analysis services
│   ├── main.py          # FastAPI app
│   └── .env             # Environment config
└── package.json
```

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/phishing-detect` | POST | Detect phishing in text |
| `/url-scan` | POST | Scan URL for threats |
| `/password-analyze` | POST | Analyze password strength |
| `/app-permission-risk` | POST | Analyze app permissions |
| `/cyber-risk-score` | POST | Calculate risk score |
| `/chat-assistant` | POST | AI chatbot |
| `/threat-intel` | GET | Get threat statistics |

API Documentation: http://localhost:8000/docs

## 🎨 UI Features

- Cyberpunk dark theme
- Neon blue/purple/green accents
- Glassmorphism cards
- Animated backgrounds
- Responsive design
- Floating AI assistant

## 📄 License

MIT License - Hackathon Project

## 👤 Author

SafeNet-AI - Built for cybersecurity awareness

---

**Note:** This is a demo project for educational purposes. Always use official security tools for critical security decisions.
