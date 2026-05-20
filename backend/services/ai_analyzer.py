"""
AI Analysis Service
NLP-based phishing detection and text classification.
Works without external APIs using rule-based and pattern matching.
"""
import re
import math
import string
import difflib
import os
import csv
from typing import Tuple, Optional


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

PHISHING_CSV_KEYWORDS_PATH = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'phishing_keywords.csv'))
SPAM_CSV_KEYWORDS_PATH = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'spam_keywords.csv'))

PHISHING_CSV_KEYWORDS = []
SPAM_CSV_KEYWORDS = []


def _load_csv_keywords(path):
    if not os.path.exists(path):
        return []
    keywords = []
    try:
        with open(path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                keyword = (row.get('keyword') or '').strip().lower()
                if keyword:
                    keywords.append(keyword)
    except Exception:
        pass
    return keywords

PHISHING_CSV_KEYWORDS = _load_csv_keywords(PHISHING_CSV_KEYWORDS_PATH)
SPAM_CSV_KEYWORDS = _load_csv_keywords(SPAM_CSV_KEYWORDS_PATH)

NAIVE_BAYES_ALPHA = 1.0
SPAM_PRIOR = 0.2

def _build_keyword_counts():
    counts = {}
    for kw in SPAM_CSV_KEYWORDS:
        counts[kw] = counts.get(kw, 0) + 2
    for kw in PHISHING_CSV_KEYWORDS:
        counts[kw] = counts.get(kw, 0) + 1
    return counts

SPAM_KEYWORD_COUNTS = _build_keyword_counts()
NB_VOCAB_SIZE = max(len(SPAM_KEYWORD_COUNTS), 1)
NB_TOTAL_COUNTS = sum(SPAM_KEYWORD_COUNTS.values())


def _find_keyword_matches(text, keywords):
    matches = []
    sorted_keywords = sorted(set(keywords), key=len, reverse=True)
    for kw in sorted_keywords:
        pattern = r'(?<!\w)' + re.escape(kw) + r'(?!\w)'
        found = re.findall(pattern, text)
        if found:
            matches.extend([kw] * len(found))
            text = re.sub(pattern, ' ', text)
    return matches


def _compute_naive_bayes_spam_probability(text):
    tokens = _find_keyword_matches(text, list(SPAM_KEYWORD_COUNTS.keys()))
    if not tokens:
        return 0.05

    log_spam = math.log(SPAM_PRIOR)
    log_ham = math.log(1 - SPAM_PRIOR)
    smoothing = NAIVE_BAYES_ALPHA
    denom_spam = NB_TOTAL_COUNTS + smoothing * (NB_VOCAB_SIZE + 1)
    denom_ham = NB_TOTAL_COUNTS + smoothing * (NB_VOCAB_SIZE + 1)

    for token in tokens:
        token_count = SPAM_KEYWORD_COUNTS.get(token, 0)
        prob_token_spam = (token_count + smoothing) / denom_spam
        prob_token_ham = (smoothing if token in SPAM_KEYWORD_COUNTS else 1 + smoothing) / denom_ham
        log_spam += math.log(prob_token_spam)
        log_ham += math.log(prob_token_ham)

    prob = 1 / (1 + math.exp(log_ham - log_spam))
    return min(max(prob, 0.0), 1.0)


def detect_phishing(text: str, sender: Optional[str] = None, headers: Optional[dict] = None) -> dict:
    """
    Analyze text for phishing indicators.
    Returns structured analysis result.
    """
    text_lower = text.lower()
    found_urgency = []
    found_domains = []
    found_brands = []
    found_links = []
    found_csv_keywords = []
    found_spam_keywords = []
    sender_indicators = []
    header_indicators = []
    style_indicators = []

    # Check urgency words
    for word in URGENCY_WORDS:
        if word in text_lower:
            found_urgency.append(word)

    # Check suspicious/threat keywords from CSV
    for word in PHISHING_CSV_KEYWORDS:
        if word in text_lower and word not in found_urgency and word not in found_csv_keywords:
            found_csv_keywords.append(word)

    # Check spam classification words from CSV
    for word in SPAM_CSV_KEYWORDS:
        if word in text_lower and word not in found_spam_keywords:
            found_spam_keywords.append(word)

    # Check suspicious domain patterns
    for pattern in SUSPICIOUS_DOMAINS:
        if pattern in text_lower:
            found_domains.append(pattern)

    # Check brand impersonation (text mentions brand)
    for brand in BRAND_IMPERSONATION:
        if brand in text_lower:
            found_brands.append(brand)

    # Check malicious link patterns and extract domains
    urls = re.findall(r'https?://[^\s]+', text, re.IGNORECASE)
    for url in urls:
        for pattern in MALICIOUS_LINK_PATTERNS:
            if re.search(pattern, url, re.IGNORECASE):
                found_links.append(url[:200])
                break
        # domain-based heuristics: check similarity to known brands
        try:
            from urllib.parse import urlparse
            dom = urlparse(url).netloc.lower()
            # strip port
            dom = dom.split(":")[0]
            # compare domain parts to brands
            for brand in BRAND_IMPERSONATION:
                brand_label = brand.replace(" ", "").lower()
                # exact contains
                if brand_label in dom:
                    if brand not in found_brands:
                        found_brands.append(brand)
                else:
                    # fuzzy match against second-level label
                    label = dom.split('.')[-2] if '.' in dom else dom
                    ratio = difflib.SequenceMatcher(a=brand_label, b=label).ratio()
                    if ratio > 0.7:
                        if brand not in found_brands:
                            found_brands.append(brand + " (lookalike)")
        except Exception:
            pass

    # Check for suspicious link patterns in text (non-https links)
    if re.search(r'click\s+here\s*[:\-]?\s*https?://', text_lower):
        found_links.append("Suspicious 'click here' with link")

    # Check for explicit 'password' or 'enter your password' on pages/text
    if re.search(r'enter (your )?(password|credentials)|provide (your )?(password|credentials)|enter password', text_lower):
        found_urgency.append('password-request')

    # Sender analysis (if provided)
    KNOWN_BAD_SENDERS = [
        "noreply@secure-update.com", "support@paypa1.com", "admin@banking-alert.net"
    ]
    if sender:
        s = sender.strip().lower()
        # extract email
        m = re.search(r'([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})', s)
        email = m.group(1) if m else s
        local, _, domain = email.partition('@')
        if any(b in email for b in KNOWN_BAD_SENDERS) or any(b in domain for b in ('.tk', '.ml', '.ga', '.cf', '.gq')):
            header_indicators.append('sender-domain-suspicious')
        # sender display name mismatch (common spoofing) like 'PayPal <random@x.com>' vs display
        if any(brand.replace(' ', '') in local or brand.replace(' ', '') in email for brand in BRAND_IMPERSONATION):
            sender_indicators.append('sender-mentions-brand')
        if email in KNOWN_BAD_SENDERS:
            sender_indicators.append('known-malicious-sender')

    # Header analysis (spam flags, many recipients)
    if headers and isinstance(headers, dict):
        # common spam header markers
        xflag = headers.get('x-spam-flag') or headers.get('X-Spam-Flag') or headers.get('X-Spam-Status')
        if xflag and 'yes' in str(xflag).lower():
            header_indicators.append('spam-flag')
        # many recipients
        to_field = headers.get('to') or headers.get('To')
        if isinstance(to_field, str) and to_field.count(',') >= 3:
            header_indicators.append('multiple-recipients')
        # suspicious subject
        subj = headers.get('subject') or headers.get('Subject')
        if isinstance(subj, str):
            for w in URGENCY_WORDS:
                if w in subj.lower():
                    found_urgency.append(f"subject:{w}")

    # Style indicators: many exclamations, high uppercase ratio
    exclaims = text.count('!')
    if exclaims >= 3:
        style_indicators.append('many-exclamations')
    letters = re.findall(r'[A-Za-z]', text)
    if letters:
        uppers = sum(1 for c in letters if c.isupper())
        if uppers / len(letters) > 0.6:
            style_indicators.append('all-caps-style')

    # Score calculation (textual)
    score_text = 0
    score_text += min(len(found_urgency) * 10, 35)
    score_text += min(len(found_domains) * 12, 30)
    score_text += min(len(found_brands) * 14, 35)
    score_text += min(len(found_links) * 12, 30)
    score_text += min(len(found_csv_keywords) * 10, 40)
    score_text += min(len(found_spam_keywords) * 8, 32)

    spam_probability = _compute_naive_bayes_spam_probability(text_lower)
    naive_bayes_score = round(spam_probability * 100)

    # Sender / header / style based scoring
    score_sender = min(len(sender_indicators) * 18, 40)
    score_header = min(len(header_indicators) * 15, 30)
    score_style = min(len(style_indicators) * 12, 24)

    score = score_text + score_sender + score_header + score_style
    score = max(score, naive_bayes_score)

    # Extra indicators: email addresses in message body that mimic brands
    if re.search(r'\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b', text, re.IGNORECASE):
        emails = re.findall(r'\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b', text, re.IGNORECASE)
        if any(found for found in emails if any(b.replace(' ', '') in found.lower() for b in BRAND_IMPERSONATION)):
            score += 12

    # penalize if both brand mention and suspicious domain/link present
    if found_brands and found_links:
        score = min(100, score + 12)

    # If only low textual indicators (weak urgency words) and no sender/header/style corroboration, reduce false positives
    textual_only = (score_text > 0 and score_text < 40 and (score_sender + score_header + score_style) == 0)
    if textual_only:
        score = max(0, score - 30)

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
        suspicious_elements.append(f"Brand impersonation / lookalike: {', '.join(found_brands[:3])}")
    if found_links:
        suspicious_elements.append(f"Malicious link patterns detected")
    if found_csv_keywords:
        suspicious_elements.append(f"Suspicious terms: {', '.join(found_csv_keywords[:5])}")
    if found_spam_keywords:
        suspicious_elements.append(f"Spam-like terms detected: {', '.join(found_spam_keywords[:5])}")
    if sender_indicators:
        suspicious_elements.append(f"Sender indicators: {', '.join(sender_indicators[:3])}")
    if header_indicators:
        suspicious_elements.append(f"Header/spam indicators: {', '.join(header_indicators[:3])}")
    if style_indicators:
        suspicious_elements.append(f"Style indicators: {', '.join(style_indicators[:3])}")

    return {
        "threat_level": level,
        "risk_score": score,
        "suspicious_elements": suspicious_elements,
        "details": {
            "urgency_words": found_urgency[:5],
            "suspicious_domains": found_domains[:5],
            "brand_impersonation": found_brands[:5],
            "malicious_links": found_links[:3],
            "spam_keywords": found_spam_keywords[:5],
            "naive_bayes_probability": round(spam_probability * 100, 1),
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
        strength = "Normal"
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
    "contacts": 20,
    "sms": 30,
    "accessibility": 40,
    "location": 25,
    "location_background": 25,
    "camera": 10,
    "microphone": 15,
    "storage": 15,
    "internet": 5,
    "background": 20,
    "overlay": 30,
    "device_admin": 40,
    "read_sms": 35,
    "call_log": 25,
    "accounts": 20,
    "biometric": 20,
}

# Human-friendly why/usage hints
PERMISSION_USAGE_HINTS = {
    "camera": "Used for taking photos or scanning QR codes.",
    "microphone": "Used for recording audio or voice calls.",
    "location": "Used to provide location-based features.",
    "location_background": "Allows tracking location even when app is not in use.",
    "contacts": "Access to your contacts — may read or upload contact list.",
    "storage": "Access to device storage for reading/writing files or photos.",
    "internet": "Network access — required to send or receive data.",
    "background": "Run background services when app is not in foreground.",
    "sms": "Read or send SMS messages — can access OTPs.",
    "read_sms": "Read SMS messages (may access OTPs and personal messages).",
    "accessibility": "Highly privileged access that can observe and interact with UI.",
    "overlay": "Draw over other apps (can display fake UIs).",
    "device_admin": "Grants device admin capabilities (very powerful).",
    "call_log": "Access to call history.",
}

# Expected permissions per app category
APP_CATEGORY_PERMISSIONS = {
    "social": {"internet", "camera", "microphone", "storage", "contacts"},
    "banking": {"internet", "accounts", "storage"},
    "camera": {"camera", "storage", "microphone"},
    "flashlight": {"camera"},
    "utility": {"internet", "storage"},
    "game": {"internet", "storage"},
    "shopping": {"internet", "storage", "accounts"},
}

# Per-category required and optional permission rules (for rule-driven classification)
APP_CATEGORY_REQUIRED = {
    "weather": {"location", "internet"},
    "banking": {"sms", "internet"},
    "social": {"internet", "storage"},
    "camera": {"camera", "storage"},
    "flashlight": {"camera"},
    "utility": {"internet"},
    "game": {"internet", "storage"},
    "shopping": {"internet", "storage"},
}

APP_CATEGORY_OPTIONAL = {
    "weather": {"sms"},
    "banking": {"contacts", "location", "camera"},
    "social": {"contacts", "microphone", "camera"},
    "camera": {"microphone"},
    "flashlight": set(),
    "utility": set(),
    "game": {"microphone"},
    "shopping": {"accounts"},
}

# Small trusted apps database (example)
TRUSTED_APP_PATTERNS = {
    "WhatsApp": {"microphone", "camera", "storage", "internet"},
    "Google Maps": {"location", "internet", "storage"},
    "Flashlight": {"camera"},
}

# Real-world justification examples for explanations
PERMISSION_REAL_WORLD_EXAMPLES = {
    "location": "Provides local weather forecasts or location-based features (e.g., Weather app).",
    "internet": "Needed to fetch remote data, APIs, or sync content.",
    "sms": "Used for OTP delivery or SMS-based verification (common in banking apps).",
    "contacts": "Used to find friends or invite contacts in social apps.",
    "camera": "Required to take photos or scan documents/QR codes.",
    "microphone": "Needed for voice messages or voice capture features.",
    "storage": "Required to save or read files and media.",
    "accessibility": "Used by accessibility tools to assist users with disabilities.",
    "overlay": "Draw over other apps for floating UI elements (rare; high risk).",
    "device_admin": "Device administration for enterprise device management.",
}

# App permission analysis removed — feature deprecated.


# ─── Cyber Risk Score ────────────────────────────────────────────────────────

QUESTION_DEFINITIONS = {
    "uses_2fa": True,
    "reuses_passwords": False,
    "updates_software": True,
    "uses_public_wifi": False,
    "backs_up_data": True,
    "uses_vpn": True,
    "clicks_unknown_links": False,
    "uses_password_manager": True,
    "shares_personal_info": False,
    "has_antivirus": True,
}

# Weights represent how much each unsafe answer contributes to overall risk (sum = 100)
QUESTION_WEIGHTS = {
    "uses_2fa": 10,
    "reuses_passwords": 15,
    "updates_software": 10,
    "uses_public_wifi": 12,
    "backs_up_data": 8,
    "uses_vpn": 8,
    "clicks_unknown_links": 15,
    "uses_password_manager": 10,
    "shares_personal_info": 7,
    "has_antivirus": 5,
}

# Per-question recommendation templates for unsafe answers
QUESTION_RECOMMENDATIONS = {
    "uses_2fa": "Enable two-factor authentication (2FA) on all important accounts (email, banking, cloud).",
    "reuses_passwords": "Use a password manager and avoid reusing passwords across sites.",
    "updates_software": "Turn on automatic updates for your OS and apps to receive security patches.",
    "uses_public_wifi": "Avoid using public WiFi for sensitive tasks or use a trusted VPN when necessary.",
    "backs_up_data": "Configure regular automated backups (cloud or offline) to protect against data loss and ransomware.",
    "uses_vpn": "Consider using a reputable VPN when on untrusted networks to protect your traffic.",
    "clicks_unknown_links": "Do not click links from unknown senders; instead visit the site directly or verify with the sender.",
    "uses_password_manager": "Start using a password manager to generate and store unique, strong passwords.",
    "shares_personal_info": "Limit sharing of personal information online and verify requests before disclosing sensitive data.",
    "has_antivirus": "Install and keep reputable antivirus/endpoint protection up to date on your devices.",
}

def _answer_is_safe(question: str, answer) -> bool:
    if isinstance(answer, str):
        answer = answer.strip().lower()
        if answer not in {"yes", "no", "true", "false"}:
            return False
        if answer in {"true", "yes"}:
            answer = True
        else:
            answer = False
    if isinstance(answer, bool):
        expected_positive = QUESTION_DEFINITIONS.get(question, True)
        return answer is expected_positive
    return False


def calculate_risk_score(answers: dict) -> dict:
    # Compute weighted risk: each unsafe answer contributes its weight toward risk
    total_questions = len(QUESTION_DEFINITIONS)
    safe_answers = 0
    unsafe_questions = []
    accumulated_risk = 0
    for question, expected in QUESTION_DEFINITIONS.items():
        provided = answers.get(question, None)
        is_safe = _answer_is_safe(question, provided) if provided is not None else False
        if is_safe:
            safe_answers += 1
        else:
            # If missing or unsafe answer, add weight to risk
            weight = QUESTION_WEIGHTS.get(question, int(100 / total_questions))
            accumulated_risk += weight
            unsafe_questions.append(question)

    # Normalize accumulated_risk to 0-100 and clamp
    score = max(0, min(int(accumulated_risk), 100))

    # Risk level mapping (higher score => higher risk)
    if score >= 80:
        risk_level = "VERY HIGH RISK"
        summary = "Multiple unsafe practices detected — immediate action recommended."
    elif score >= 55:
        risk_level = "HIGH RISK"
        summary = "Several risky behaviors detected — prioritize improvements soon."
    elif score >= 35:
        risk_level = "MEDIUM RISK"
        summary = "Moderate risk — good practices exist but there are clear weaknesses."
    elif score >= 15:
        risk_level = "LOW RISK"
        summary = "Relatively low risk, but a few improvements would increase safety."
    else:
        risk_level = "VERY LOW RISK"
        summary = "Your answers indicate strong security habits. Keep maintaining them."

    # Generate tailored recommendations based on specific unsafe answers
    improvements = []
    for q in unsafe_questions:
        rec = QUESTION_RECOMMENDATIONS.get(q)
        if rec and rec not in improvements:
            improvements.append(rec)

    # If user skipped questions, add a general suggestion to complete questionnaire
    if len(answers) < total_questions:
        improvements.append("Complete all security questions for a more accurate risk assessment.")

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "summary": summary,
        "safe_answers": safe_answers,
        "total_questions": total_questions,
        "improvements": improvements,
        "unsafe_questions": unsafe_questions,
    }
