"""
AI Analysis Service
NLP-based phishing detection and text classification.
Works without external APIs using rule-based and pattern matching.
"""
import re
import math
import string
from typing import Tuple


# ─── Phishing Detection ──────────────────────────────────────────────────────

URGENCY_WORDS = [
    "urgent", "immediately", "account suspended", "verify now", "click here",
    "limited time", "act now", "confirm your", "security alert", "unusual activity",
    "login attempt", "your account", "expire", "suspended", "locked",
    "update required", "action required", "warning", "important notice",
    "payment failed", "invoice", "overdue", "confirm identity",
]

SUSPICIOUS_DOMAINS = [
    "paypal-login", "apple-security", "microsoft-support", "amazon-verify",
    "google-security", "banking-alert", "account-verify", "secure-login",
    ".tk", ".ml", ".ga", ".cf", ".gq",   # free TLDs commonly abused
    "login-", "-login", "secure-", "-secure", "verify-", "-verify",
    "update-", "-update", "account-", "-account",
]

BRAND_IMPERSONATION = [
    "paypal", "apple", "microsoft", "amazon", "google", "facebook",
    "netflix", "bank of america", "wells fargo", "chase", "citibank",
    "instagram", "whatsapp", "twitter", "linkedin", "dropbox",
]

MALICIOUS_LINK_PATTERNS = [
    r"https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}",  # IP-based URLs
    r"bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly",            # URL shorteners
    r"\.(tk|ml|ga|cf|gq)/",                              # Suspicious TLDs
    r"[a-z0-9]{20,}\.com",                               # Long random subdomains
]


def detect_phishing(text: str) -> dict:
    """
    Analyze text for phishing indicators.
    Returns structured analysis result.
    """
    text_lower = text.lower()
    found_urgency = []
    found_domains = []
    found_brands = []
    found_links = []

    # Check urgency words
    for word in URGENCY_WORDS:
        if word in text_lower:
            found_urgency.append(word)

    # Check suspicious domain patterns
    for pattern in SUSPICIOUS_DOMAINS:
        if pattern in text_lower:
            found_domains.append(pattern)

    # Check brand impersonation
    for brand in BRAND_IMPERSONATION:
        if brand in text_lower:
            found_brands.append(brand)

    # Check malicious link patterns
    urls = re.findall(r'https?://[^\s]+', text, re.IGNORECASE)
    for url in urls:
        for pattern in MALICIOUS_LINK_PATTERNS:
            if re.search(pattern, url, re.IGNORECASE):
                found_links.append(url[:80])
                break

    # Check for suspicious link patterns in text (non-https links)
    if re.search(r'click\s+here\s*[:\-]?\s*https?://', text_lower):
        found_links.append("Suspicious 'click here' with link")

    # Score calculation
    score = 0
    score += min(len(found_urgency) * 12, 35)
    score += min(len(found_domains) * 15, 30)
    score += min(len(found_brands) * 10, 20)
    score += min(len(found_links) * 15, 30)

    # Extra indicators
    if re.search(r'\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b', text, re.IGNORECASE):
        emails = re.findall(r'\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b', text, re.IGNORECASE)
        if any(found for found in emails if any(b in found.lower() for b in BRAND_IMPERSONATION)):
            score += 15

    score = min(score, 100)

    # Threat level
    if score >= 75:
        level = "CRITICAL"
    elif score >= 55:
        level = "HIGH"
    elif score >= 35:
        level = "MEDIUM"
    elif score >= 15:
        level = "LOW"
    else:
        level = "SAFE"

    suspicious_elements = []
    if found_urgency:
        suspicious_elements.append(f"Urgency language: {', '.join(found_urgency[:3])}")
    if found_domains:
        suspicious_elements.append(f"Suspicious domain patterns: {', '.join(found_domains[:3])}")
    if found_brands:
        suspicious_elements.append(f"Brand impersonation: {', '.join(found_brands[:3])}")
    if found_links:
        suspicious_elements.append(f"Malicious link patterns detected")

    return {
        "threat_level": level,
        "risk_score": score,
        "suspicious_elements": suspicious_elements,
        "details": {
            "urgency_words": found_urgency[:5],
            "suspicious_domains": found_domains[:5],
            "brand_impersonation": found_brands[:5],
            "malicious_links": found_links[:3],
        },
        "ai_explanation": _generate_phishing_explanation(level, score, found_urgency, found_brands, found_domains),
        "security_advice": _generate_security_advice(level),
    }


def _generate_phishing_explanation(level, score, urgency, brands, domains):
    parts = []
    if brands:
        parts.append(f"This message appears to impersonate {brands[0].title()} to gain your trust.")
    if urgency:
        parts.append(f"It uses urgency tactics like '{urgency[0]}' to pressure you into acting without thinking.")
    if domains:
        parts.append(f"Suspicious domain patterns suggest a fake website designed to steal credentials.")
    if not parts:
        if score > 0:
            parts.append("Some minor indicators were detected but the content appears mostly legitimate.")
        else:
            parts.append("No significant phishing indicators detected. This message appears safe.")

    return " ".join(parts) + f" Overall threat assessment: {level} (Risk Score: {score}/100)."


def _generate_security_advice(level):
    if level in ("CRITICAL", "HIGH"):
        return [
            "Do NOT click any links in this message",
            "Do NOT provide personal information or credentials",
            "Report this message as phishing to your email provider",
            "If you clicked a link, change your passwords immediately",
            "Enable 2FA on all accounts immediately",
        ]
    elif level == "MEDIUM":
        return [
            "Be cautious — verify the sender through official channels",
            "Do not click links directly; navigate to the official website manually",
            "Check the sender email domain carefully",
        ]
    elif level == "LOW":
        return [
            "Exercise caution with this message",
            "Verify sender identity before responding",
        ]
    else:
        return ["Message appears safe. Always stay vigilant online."]


# ─── Password Analysis ───────────────────────────────────────────────────────

COMMON_PASSWORDS = {
    "password", "123456", "password123", "admin", "letmein", "qwerty",
    "abc123", "monkey", "dragon", "master", "sunshine", "iloveyou",
    "princess", "welcome", "shadow", "superman", "football", "baseball",
    "login", "hello", "test", "passw0rd", "1234567890", "654321",
}


def analyze_password(password: str) -> dict:
    length = len(password)
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digits = any(c.isdigit() for c in password)
    has_special = any(c in string.punctuation for c in password)

    # Character set size
    charset = 0
    if has_lower: charset += 26
    if has_upper: charset += 26
    if has_digits: charset += 10
    if has_special: charset += 32

    # Entropy
    entropy = length * math.log2(charset) if charset > 0 else 0

    # Crack time estimate
    crack_time = _estimate_crack_time(entropy)

    # Strength score (0-100)
    score = 0
    score += min(length * 4, 30)          # Length up to 30
    score += 10 if has_upper else 0
    score += 10 if has_lower else 0
    score += 15 if has_digits else 0
    score += 20 if has_special else 0
    score += min(int(entropy / 3), 15)    # Entropy bonus

    # Penalties
    if password.lower() in COMMON_PASSWORDS:
        score = max(score - 40, 0)
    if len(set(password)) < len(password) * 0.5:
        score = max(score - 10, 0)
    if password.isdigit():
        score = max(score - 20, 0)

    score = min(score, 100)

    if score >= 80:
        strength = "Very Strong"
    elif score >= 60:
        strength = "Strong"
    elif score >= 40:
        strength = "Moderate"
    elif score >= 20:
        strength = "Weak"
    else:
        strength = "Very Weak"

    warnings = []
    if length < 8:
        warnings.append("Password is too short (minimum 8 characters)")
    if not has_upper:
        warnings.append("Add uppercase letters")
    if not has_lower:
        warnings.append("Add lowercase letters")
    if not has_special:
        warnings.append("Add special characters (!@#$%...)")
    if password.lower() in COMMON_PASSWORDS:
        warnings.append("This is an extremely common password — change it immediately!")
    if password.isdigit():
        warnings.append("Numbers-only passwords are very easy to crack")

    suggestions = _generate_password_suggestions(has_upper, has_lower, has_digits, has_special, length)

    return {
        "strength": strength,
        "score": score,
        "entropy": round(entropy, 1),
        "crack_time": crack_time,
        "character_analysis": {
            "length": length,
            "has_uppercase": has_upper,
            "has_lowercase": has_lower,
            "has_digits": has_digits,
            "has_special": has_special,
            "unique_chars": len(set(password)),
        },
        "warnings": warnings,
        "suggestions": suggestions,
    }


def _estimate_crack_time(entropy: float) -> str:
    """At 10 billion guesses/second (GPU)."""
    attempts = 2 ** entropy
    seconds = attempts / 1e10

    if seconds < 1:
        return "Instantly"
    elif seconds < 60:
        return f"{int(seconds)} seconds"
    elif seconds < 3600:
        return f"{int(seconds/60)} minutes"
    elif seconds < 86400:
        return f"{int(seconds/3600)} hours"
    elif seconds < 2592000:
        return f"{int(seconds/86400)} days"
    elif seconds < 31536000:
        return f"{int(seconds/2592000)} months"
    elif seconds < 3153600000:
        return f"{int(seconds/31536000)} years"
    else:
        return "Centuries"


def _generate_password_suggestions(has_upper, has_lower, has_digits, has_special, length):
    tips = []
    if length < 12:
        tips.append("Use at least 12 characters for strong protection")
    if not has_special:
        tips.append("Add symbols like @, #, $, !, % to dramatically increase strength")
    if not has_upper or not has_lower:
        tips.append("Mix uppercase and lowercase letters")
    tips.append("Use a passphrase (multiple random words) for both security and memorability")
    tips.append("Consider using a password manager to generate and store unique passwords")
    return tips


# ─── Permission Risk Analysis ────────────────────────────────────────────────

DANGEROUS_COMBOS = [
    ({"camera", "microphone"}, "HIGH", "Surveillance Risk", "Can silently record audio and video"),
    ({"contacts", "internet"}, "HIGH", "Data Exfiltration", "Can upload your contact list to remote servers"),
    ({"location", "background"}, "HIGH", "Location Tracking", "Can track your location 24/7"),
    ({"storage", "internet"}, "MEDIUM", "Data Theft", "Can read and upload your files"),
    ({"contacts", "sms"}, "HIGH", "Communication Intercept", "Can read and send SMS using your contacts"),
    ({"microphone", "internet"}, "HIGH", "Audio Surveillance", "Can stream audio to remote servers"),
    ({"camera", "internet"}, "HIGH", "Visual Surveillance", "Can upload photos/video without your knowledge"),
    ({"accessibility", "overlay"}, "CRITICAL", "Clickjacking/Keylogging", "Can intercept all taps and overlay fake UIs"),
    ({"device_admin"}, "CRITICAL", "Device Control", "Has full administrative control over your device"),
    ({"read_sms", "internet"}, "CRITICAL", "2FA Bypass", "Can steal SMS-based two-factor authentication codes"),
]

PERMISSION_BASE_RISK = {
    "camera": 25, "microphone": 25, "location": 20, "contacts": 20,
    "storage": 15, "internet": 5, "background": 20, "sms": 30,
    "accessibility": 35, "overlay": 30, "device_admin": 40,
    "read_sms": 35, "call_log": 25, "accounts": 20, "biometric": 20,
}


def analyze_permissions(app_name: str, permissions: list) -> dict:
    perms_lower = {p.lower().replace(" ", "_").replace("-", "_") for p in permissions}

    individual_risks = []
    for perm in permissions:
        key = perm.lower().replace(" ", "_").replace("-", "_")
        risk_val = PERMISSION_BASE_RISK.get(key, 8)
        individual_risks.append({"permission": perm, "risk": risk_val})

    combo_risks = []
    for combo, level, name, desc in DANGEROUS_COMBOS:
        if combo.issubset(perms_lower):
            combo_risks.append({
                "combination": list(combo),
                "risk_level": level,
                "threat_name": name,
                "description": desc,
            })

    # Score
    base = sum(r["risk"] for r in individual_risks)
    combo_score = sum(40 if r["risk_level"] == "CRITICAL" else 25 if r["risk_level"] == "HIGH" else 15
                      for r in combo_risks)
    total = min(base + combo_score, 100)

    if total >= 75:
        risk_level = "CRITICAL"
    elif total >= 55:
        risk_level = "HIGH"
    elif total >= 35:
        risk_level = "MEDIUM"
    elif total >= 15:
        risk_level = "LOW"
    else:
        risk_level = "SAFE"

    recommendations = []
    if total >= 55:
        recommendations.append(f"DENY installation — {app_name} has an extremely dangerous permission profile")
    if any(r["risk_level"] == "CRITICAL" for r in combo_risks):
        recommendations.append("At least one CRITICAL permission combination was detected")
    recommendations.append("Review permissions in phone Settings > Apps before granting")
    if "internet" in perms_lower and len(perms_lower) > 5:
        recommendations.append("This app with internet access can exfiltrate any data it collects")

    return {
        "app_name": app_name,
        "privacy_risk_score": total,
        "risk_level": risk_level,
        "individual_permission_risks": individual_risks,
        "dangerous_combinations": combo_risks,
        "total_permissions": len(permissions),
        "recommendations": recommendations,
    }


# ─── Cyber Risk Score ────────────────────────────────────────────────────────

QUESTION_WEIGHTS = {
    "uses_2fa": -20,           # negative = good practice
    "reuses_passwords": 25,
    "updates_software": -10,
    "uses_public_wifi": 15,
    "backs_up_data": -5,
    "uses_vpn": -10,
    "clicks_unknown_links": 20,
    "uses_password_manager": -15,
    "shares_personal_info": 15,
    "has_antivirus": -10,
}


def calculate_risk_score(answers: dict) -> dict:
    base_score = 50
    for question, weight in QUESTION_WEIGHTS.items():
        if question in answers:
            answer = answers[question]
            if isinstance(answer, bool) and answer:
                base_score += weight
            elif answer == "yes":
                base_score += weight
            elif answer == "no":
                base_score -= weight

    score = max(0, min(100, base_score))

    if score >= 75:
        risk_level = "HIGH RISK"
        summary = "Your digital security posture needs immediate improvement."
    elif score >= 50:
        risk_level = "MEDIUM RISK"
        summary = "You have some good practices but several critical gaps."
    elif score >= 25:
        risk_level = "LOW RISK"
        summary = "You follow good security practices. Keep it up!"
    else:
        risk_level = "VERY LOW RISK"
        summary = "Excellent security posture. You're well protected."

    improvements = []
    if answers.get("reuses_passwords") or answers.get("reuses_passwords") == "yes":
        improvements.append("Use a password manager to create unique passwords for every account")
    if not answers.get("uses_2fa") and answers.get("uses_2fa") != "yes":
        improvements.append("Enable two-factor authentication on all critical accounts")
    if answers.get("uses_public_wifi") or answers.get("uses_public_wifi") == "yes":
        improvements.append("Use a VPN when connecting to public WiFi networks")
    if answers.get("clicks_unknown_links") or answers.get("clicks_unknown_links") == "yes":
        improvements.append("Never click links from unknown senders — navigate manually")
    if not answers.get("backs_up_data") and answers.get("backs_up_data") != "yes":
        improvements.append("Set up regular automated backups to protect against ransomware")

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "summary": summary,
        "improvements": improvements,
    }
