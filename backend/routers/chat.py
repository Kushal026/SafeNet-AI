"""
AI Chatbot Router — cybersecurity assistant with OpenAI integration.
Falls back to a comprehensive rule-based system when no OpenAI key is set.
"""
import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

CYBERSEC_SYSTEM_PROMPT = """You are SafeNet Assistant, an expert AI cybersecurity advisor. 
You help users with:
- Identifying phishing attacks and social engineering
- Password security and account protection
- Safe browsing and URL safety
- App privacy and permissions
- General cybersecurity best practices
- Explaining cyber threats in simple terms

Always provide practical, actionable advice. Be concise but thorough.
If someone shares a suspicious email or message, analyze it for phishing indicators.
Format your responses with clear sections when helpful."""

# Rule-based responses for common cybersecurity questions (fallback)
RULE_RESPONSES = {
    "phishing": """**Phishing Detection Guide** 🎣

A phishing attack tries to steal your credentials by impersonating a trusted entity. Look for:

🚩 **Red flags:**
- Urgency or threats ("Your account will be closed!")
- Mismatched sender email domain
- Generic greeting ("Dear Customer" instead of your name)
- Suspicious links (hover to see actual URL)
- Requests for passwords, SSNs, or payment info

✅ **What to do:**
- Never click links in suspicious emails
- Go directly to the website by typing the URL
- Report phishing to your email provider
- If you clicked a link, change passwords immediately""",

    "password": """**Password Security Best Practices** 🔐

**Strong Password Requirements:**
- At least 12 characters long
- Mix of uppercase, lowercase, numbers, symbols
- No dictionary words or personal info
- Unique for every account

**Pro Tips:**
- Use a **passphrase**: "Purple$Elephant!Dances99"
- Use a password manager (Bitwarden, 1Password)
- Enable 2FA on all important accounts
- Check if your password was breached at haveibeenpwned.com""",

    "wifi": """**Public WiFi Security Guide** 📶

**Risks of public WiFi:**
- Man-in-the-middle attacks can intercept your traffic
- Fake hotspots (evil twin attacks)
- Session hijacking on unencrypted sites

**Stay safe:**
✅ Use a VPN (ProtonVPN, Mullvad, NordVPN)
✅ Only visit HTTPS websites
✅ Avoid logging into banking or sensitive accounts
✅ Turn off auto-connect to known networks
✅ Use mobile data for sensitive tasks""",

    "2fa": """**Two-Factor Authentication (2FA)** 🔒

2FA adds a second layer of security beyond your password.

**Types (best to worst):**
1. 🥇 **Hardware key** (YubiKey) — most secure
2. 🥈 **Authenticator app** (Google Authenticator, Authy)
3. 🥉 **SMS code** — vulnerable to SIM swapping
4. ❌ **Email code** — weakest, if email is compromised so is this

**Enable 2FA on:** Email, banking, social media, password managers, cloud storage""",

    "vpn": """**VPN Guide** 🛡️

A VPN (Virtual Private Network) encrypts your internet traffic and masks your IP.

**Use a VPN when:**
- On public WiFi
- Want to keep browsing private from ISP
- Access region-restricted content

**Recommended VPNs:**
- ProtonVPN (Swiss privacy, free tier available)
- Mullvad (anonymous payment, no logs)
- NordVPN (popular, audited, fast)

⚠️ Free VPNs often sell your data — avoid them!""",

    "malware": """**Malware Protection Guide** 🦠

**Common types:**
- Ransomware: encrypts files and demands payment
- Spyware: monitors your activity silently
- Trojan: disguised as legitimate software
- Keylogger: records your keystrokes

**Protection:**
✅ Keep OS and apps updated
✅ Use reputable antivirus (Windows Defender is good)
✅ Only download from official sources
✅ Regular backups (offline/cloud)
✅ Never disable security warnings""",
}


def _rule_based_response(message: str) -> str:
    msg_lower = message.lower()
    
    if any(kw in msg_lower for kw in ["phishing", "scam", "suspicious email", "fake email"]):
        return RULE_RESPONSES["phishing"]
    elif any(kw in msg_lower for kw in ["password", "passphrase", "credential"]):
        return RULE_RESPONSES["password"]
    elif any(kw in msg_lower for kw in ["wifi", "wi-fi", "public network", "hotspot"]):
        return RULE_RESPONSES["wifi"]
    elif any(kw in msg_lower for kw in ["2fa", "two factor", "two-factor", "authentication", "otp"]):
        return RULE_RESPONSES["2fa"]
    elif any(kw in msg_lower for kw in ["vpn", "virtual private network", "privacy"]):
        return RULE_RESPONSES["vpn"]
    elif any(kw in msg_lower for kw in ["virus", "malware", "ransomware", "trojan", "spyware"]):
        return RULE_RESPONSES["malware"]
    elif any(kw in msg_lower for kw in ["hello", "hi", "hey", "help", "start"]):
        return """**Welcome to SafeNet Assistant!** 🛡️

I'm your AI cybersecurity advisor. I can help you with:

🎣 **Phishing detection** — Analyze suspicious emails or messages
🔐 **Password security** — Strength analysis and best practices
🌐 **URL safety** — Identify malicious websites
📱 **App permissions** — Spot dangerous privacy risks
📶 **Network security** — Safe WiFi and VPN guidance
🦠 **Malware protection** — Defend against viruses and ransomware

What can I help you with today? You can also use the **Security Tools** in the dashboard for automated analysis."""
    else:
        return f"""**SafeNet Assistant** 🛡️

Thanks for your question about: *"{message[:100]}"*

Here are some general cybersecurity principles that apply:

1. **Zero Trust** — Never trust, always verify. Don't assume anything is safe.
2. **Principle of Least Privilege** — Only grant minimum necessary access.
3. **Defense in Depth** — Use multiple security layers.
4. **Keep Updated** — Patches fix known vulnerabilities.
5. **Backup Regularly** — Protect against ransomware and data loss.

For specific analysis, use our **security tools**:
- 🎣 Phishing Detector for suspicious emails
- 🌐 URL Scanner for suspicious links
- 🔐 Password Analyzer for password strength

Is there a specific threat or topic you'd like me to explain in detail?"""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


@router.post("")
async def chat_assistant(req: ChatRequest):
    if not req.message.strip():
        return {"error": "Message cannot be empty."}

    # Try OpenAI if key is configured
    if OPENAI_API_KEY and OPENAI_API_KEY != "your_openai_api_key_here":
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=OPENAI_API_KEY)
            messages = [{"role": "system", "content": CYBERSEC_SYSTEM_PROMPT}]
            for msg in (req.history or [])[-10:]:  # Last 10 messages for context
                messages.append({"role": msg.role, "content": msg.content})
            messages.append({"role": "user", "content": req.message})

            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=800,
                temperature=0.7,
            )
            return {
                "response": response.choices[0].message.content,
                "model": "gpt-3.5-turbo",
            }
        except Exception as e:
            # Fall through to rule-based
            pass

    # Fallback rule-based response
    response_text = _rule_based_response(req.message)
    return {
        "response": response_text,
        "model": "safenet-rule-engine",
    }
