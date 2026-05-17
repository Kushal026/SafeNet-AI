"""
Threat Intelligence Service
Integrates with VirusTotal, Google Safe Browsing, and WHOIS heuristics.
Uses a feature-based scoring pipeline to classify URLs by safety, suspicion, or phishing.
"""
import os
import re
import hashlib
import httpx
import ssl
import socket
import asyncio
from datetime import datetime
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY", "")
GOOGLE_SB_KEY = os.getenv("GOOGLE_SAFE_BROWSING_KEY", "")

BRAND_NAMES = [
    "paypal", "apple", "microsoft", "amazon", "google", "facebook",
    "netflix", "bankofamerica", "wellsfargo", "chase", "citibank",
    "instagram", "whatsapp", "twitter", "linkedin", "dropbox",
]

PHISHING_KEYWORDS = [
    "login", "verify", "secure", "update", "account", "banking",
    "free-gift", "gift", "password", "confirm", "urgent",
]

SUSPICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".win"]
SHORTENERS = ["bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "tiny.cc"]


async def scan_url(url: str) -> dict:
    """Full URL reputation scan."""
    original_url = url.strip()
    if not original_url:
        return {"error": "Please provide a valid URL."}

    normalized_url = original_url if original_url.startswith("http") else f"http://{original_url}"
    parsed = urlparse(normalized_url)
    domain = parsed.netloc or parsed.path.split("/")[0]
    if not domain:
        return {"error": "Unable to parse domain from URL."}

    page_data = await _fetch_page(normalized_url)
    whois_data = await _get_domain_age(domain)
    sb_data = await _google_safe_browsing_check(normalized_url) if GOOGLE_SB_KEY else None
    vt_data = await _virustotal_scan(normalized_url) if VIRUSTOTAL_API_KEY else None

    features = _extract_features(normalized_url, parsed, domain, page_data, whois_data)
    score, risk_indicators = _score_url(features, whois_data, sb_data, vt_data, domain)
    result = _build_result(original_url, domain, features, page_data, whois_data, sb_data, vt_data, score, risk_indicators)
    return result


async def _fetch_page(url: str) -> dict:
    """Fetch the page and collect content-based signals, including HTTPS certificate validity."""
    data = {
        "http_status": None,
        "final_url": url,
        "redirects": 0,
        "content": "",
        "ssl_valid": None,
        "ssl_error": None,
        "fetch_error": None,
    }
    try:
        async with httpx.AsyncClient(timeout=8, follow_redirects=True) as client:
            resp = await client.get(url)
            data["http_status"] = resp.status_code
            data["final_url"] = str(resp.url)
            data["redirects"] = len(getattr(resp, "history", []))
            data["content"] = resp.text or ""
            data["ssl_valid"] = True
    except httpx.HTTPError as http_err:
        error_message = str(http_err)
        if "ssl" in error_message.lower() or "tls" in error_message.lower():
            data["ssl_valid"] = False
            data["ssl_error"] = error_message
            try:
                async with httpx.AsyncClient(timeout=8, follow_redirects=True, verify=False) as client:
                    resp = await client.get(url)
                    data["http_status"] = resp.status_code
                    data["final_url"] = str(resp.url)
                    data["redirects"] = len(getattr(resp, "history", []))
                    data["content"] = resp.text or ""
            except Exception as inner_err:
                data["fetch_error"] = str(inner_err)
        else:
            data["fetch_error"] = error_message
    except Exception as fetch_err:
        data["fetch_error"] = str(fetch_err)
    return data


async def _get_domain_age(domain: str) -> dict:
    """Try to look up WHOIS registration age if the whois library is available."""
    try:
        import whois
    except Exception:
        return {"age_days": None, "created_date": None, "whois_available": False}

    try:
        whois_info = await asyncio.to_thread(whois.whois, domain)
        created = whois_info.creation_date
        if isinstance(created, list):
            created = created[0]
        if isinstance(created, str):
            created = datetime.fromisoformat(created)
        if isinstance(created, datetime):
            age_days = (datetime.utcnow() - created).days
            return {"age_days": age_days, "created_date": created.isoformat(), "whois_available": True}
    except Exception:
        pass

    return {"age_days": None, "created_date": None, "whois_available": False}


async def _google_safe_browsing_check(url: str) -> dict | None:
    """Query Google Safe Browsing API if a key is configured."""
    payload = {
        "client": {"clientId": "SafeNetAI", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "POTENTIALLY_HARMFUL_APPLICATION", "UNWANTED_SOFTWARE"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}],
        },
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={GOOGLE_SB_KEY}",
                json=payload,
            )
            if resp.status_code == 200:
                data = resp.json()
                matches = data.get("matches")
                if matches:
                    kinds = [match.get("threatType") for match in matches]
                    return {"matched": True, "threat_types": kinds, "raw": data}
                return {"matched": False, "threat_types": [], "raw": data}
    except Exception:
        pass
    return None


def _extract_features(url: str, parsed, domain: str, page_data: dict, whois_data: dict) -> dict:
    path = parsed.path or ""
    keywords = [kw for kw in PHISHING_KEYWORDS if kw in url.lower()]
    num_special = len(re.findall(r"[@%_\-\.\?=+!$&]", url))
    num_dots = url.count(".")
    num_hyphens = url.count("-")
    special_chars = len(re.findall(r"[^a-zA-Z0-9:/\.\-_%&?=+!$]", url))
    entropy = _shannon_entropy(domain)
    typo_score = _detect_typosquatting(domain)
    suspicious_tld = any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS)
    is_ip = bool(re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", domain))
    is_shortener = domain in SHORTENERS
    content_lower = (page_data.get("content", "") or "").lower()
    password_field = bool(re.search(r'type=["\']password["\']|name=["\']password["\']', content_lower))
    form_present = bool(re.search(r'<form[^>]*>', content_lower))
    has_login_form = password_field or (form_present and "login" in content_lower)
    hidden_redirects = bool(re.search(r'meta[^>]+refresh|window\.location|location\.href|setTimeout\(|document\.write\(|window\.open\(', content_lower))
    popup_signals = bool(re.search(r'alert\(|confirm\(|prompt\(|window\.open\(', content_lower))
    made_of_logos = any(brand in content_lower for brand in BRAND_NAMES)

    return {
        "is_https": parsed.scheme == "https",
        "url_length": len(url),
        "path_length": len(path),
        "num_dots": num_dots,
        "num_hyphens": num_hyphens,
        "special_char_count": num_special,
        "special_symbol_count": special_chars,
        "keyword_count": len(keywords),
        "keywords": keywords,
        "typo_score": typo_score,
        "suspicious_tld": suspicious_tld,
        "is_ip": is_ip,
        "is_shortener": is_shortener,
        "entropy": round(entropy, 2),
        "domain_age_days": whois_data.get("age_days"),
        "has_login_form": has_login_form,
        "hidden_redirects": hidden_redirects,
        "popup_signals": popup_signals,
        "brand_logo_signals": made_of_logos,
        "ssl_valid": page_data.get("ssl_valid"),
        "final_domain": urlparse(page_data.get("final_url", url)).netloc.split(":")[0].lower(),
    }


def _shannon_entropy(value: str) -> float:
    if not value:
        return 0.0
    counts = {ch: value.count(ch) for ch in set(value)}
    entropy = 0.0
    length = len(value)
    for count in counts.values():
        p = count / length
        entropy -= p * (p and __import__("math").log2(p) or 0)
    return entropy


def _normalize_typosquatting(text: str) -> str:
    replacements = {
        "0": "o",
        "1": "l",
        "3": "e",
        "5": "s",
        "7": "t",
        "@": "a",
    }
    return "".join(replacements.get(ch, ch) for ch in text.lower())


def _detect_typosquatting(domain: str) -> float:
    label = domain.split(".")[0].lower()
    normalized = _normalize_typosquatting(label)
    best = 0.0
    matcher = __import__("difflib").SequenceMatcher
    for brand in BRAND_NAMES:
        brand_normalized = _normalize_typosquatting(brand)
        ratio = matcher(a=brand_normalized, b=normalized).ratio()
        best = max(best, ratio)
        if brand_normalized in normalized or normalized in brand_normalized:
            best = max(best, 0.85)
    return round(best, 3)


def _score_url(features: dict, whois_data: dict, sb_data: dict | None, vt_data: dict | None, domain: str) -> tuple[int, list]:
    score = 100
    indicators = []

    if not features["is_https"]:
        indicators.append("No HTTPS — connection is unencrypted")
        score -= 20
    if features["ssl_valid"] is False:
        indicators.append("Invalid or expired SSL certificate")
        score -= 15
    if features["is_ip"]:
        indicators.append("URL uses raw IP address instead of a domain")
        score -= 25
    if features["suspicious_tld"]:
        indicators.append("Suspicious top-level domain detected")
        score -= 20
    if features["is_shortener"]:
        indicators.append("URL shortener service detected")
        score -= 20
    if features["url_length"] > 120:
        indicators.append("Very long URL length")
        score -= 20
    elif features["url_length"] > 90:
        indicators.append("Long URL length")
        score -= 10
    if features["path_length"] > 40:
        indicators.append("Long URL path suggests obfuscation")
        score -= 10
    if features["num_dots"] > 4:
        indicators.append("Many dots in URL — possible subdomain trickery")
        score -= 10
    if features["num_hyphens"] > 3:
        indicators.append("Many hyphens in URL — may be a fake or obfuscated domain")
        score -= 8
    if features["special_char_count"] > 7:
        indicators.append("Excessive special characters in URL")
        score -= 10
    if features["keyword_count"] >= 2:
        indicators.append(f"Multiple suspicious keywords found: {', '.join(features['keywords'][:3])}")
        score -= 15
    elif features["keyword_count"] == 1:
        indicators.append(f"Suspicious keyword detected: {features['keywords'][0]}")
        score -= 8
    if features["typo_score"] >= 0.82:
        indicators.append("High typo-squatting similarity to a known brand")
        score -= 25
    elif features["typo_score"] >= 0.70:
        indicators.append("Possible typo-squatting detected")
        score -= 15
    if features["entropy"] > 3.5:
        indicators.append("High entropy/randomness in domain name")
        score -= 8
    if features["has_login_form"]:
        indicators.append("Login form or credential input detected on the page")
        score -= 20
    if features["hidden_redirects"] and (not features["is_https"] or features["suspicious_tld"] or features["is_shortener"] or features["keyword_count"] > 0 or features["is_ip"]):
        indicators.append("Hidden redirect or JavaScript redirect patterns found")
        score -= 15
    if features["popup_signals"] and (features["keyword_count"] > 0 or features["is_shortener"] or features["suspicious_tld"] or features["is_ip"]):
        indicators.append("Popup or alert behavior detected in page scripts")
        score -= 10
    if features["brand_logo_signals"] and not features["has_login_form"]:
        indicators.append("Brand-related content on page may be used for impersonation")
        score -= 5

    age_days = whois_data.get("age_days")
    if age_days is not None:
        if age_days >= 365:
            score += 15
        elif age_days >= 90:
            score += 5
        else:
            indicators.append("Newly registered domain — high risk for phishing")
            score -= 15

    if sb_data and sb_data.get("matched"):
        types = ", ".join(sb_data.get("threat_types", []))
        indicators.append(f"Google Safe Browsing matched threat types: {types}")
        score -= 40

    if vt_data:
        malicious = vt_data.get("malicious", 0)
        suspicious = vt_data.get("suspicious", 0)
        if malicious > 5:
            indicators.append(f"VirusTotal flagged the URL as malicious ({malicious} engines)")
            score -= 40
        elif suspicious > 0:
            indicators.append(f"VirusTotal flagged the URL as suspicious ({suspicious} engines)")
            score -= 20

    if features["final_domain"] != domain.lower() and features["final_domain"]:
        indicators.append("Final landing domain differs from requested domain")
        score -= 10

    score = max(0, min(100, score))
    return score, indicators


def _classify_score(score: int) -> tuple[str, str]:
    if score >= 80:
        return "SAFE", "LOW"
    if score >= 50:
        return "SUSPICIOUS", "MEDIUM"
    return "PHISHING LIKELY", "CRITICAL"


def _build_result(url: str, domain: str, features: dict, page_data: dict, whois_data: dict, sb_data: dict | None, vt_data: dict | None, score: int, indicators: list) -> dict:
    status, threat_level = _classify_score(score)
    return {
        "url": url,
        "domain": domain,
        "trust_score": score,
        "status": status,
        "threat_level": threat_level,
        "risk_indicators": indicators,
        "features": features,
        "has_valid_https": features["is_https"],
        "ssl_valid": features["ssl_valid"],
        "whois_age_days": whois_data.get("age_days"),
        "whois_available": whois_data.get("whois_available", False),
        "google_safe_browsing": sb_data,
        "virustotal": vt_data,
        "http_status": page_data.get("http_status"),
        "final_url": page_data.get("final_url"),
        "redirects": page_data.get("redirects"),
        "content_indicators": [
            x for x in [
                *(page_data.get("content") and ["Page content fetched"] or []),
                *(page_data.get("fetch_error") and [f"Fetch error: {page_data.get('fetch_error')}"] or []),
                *(page_data.get("ssl_error") and [f"SSL error: {page_data.get('ssl_error')}"] or []),
            ] if x
        ],
        "ai_explanation": _generate_url_explanation(score, indicators, domain),
    }


def _generate_url_explanation(score: int, indicators: list, domain: str) -> str:
    if score >= 80:
        return f"{domain} appears safe with a strong trust score of {score}/100. Most URL and page indicators are normal."
    if score >= 50:
        return f"{domain} appears suspicious with a score of {score}/100. Review these indicators carefully: {indicators[0] if indicators else 'potential issues present'}."
    return f"{domain} is likely a phishing or malicious URL with a low score of {score}/100. Avoid visiting it and do not enter credentials."


async def _virustotal_scan(url: str) -> dict | None:
    """Query VirusTotal v3 API."""
    try:
        import base64
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
        headers = {"x-apikey": VIRUSTOTAL_API_KEY}
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"https://www.virustotal.com/api/v3/urls/{url_id}",
                headers=headers,
            )
            if resp.status_code == 200:
                data = resp.json()
                stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                return {
                    "malicious": stats.get("malicious", 0),
                    "suspicious": stats.get("suspicious", 0),
                    "harmless": stats.get("harmless", 0),
                    "undetected": stats.get("undetected", 0),
                }
    except Exception:
        pass
    return None


async def check_password_breach(password: str) -> dict:
    """
    Check password against HaveIBeenPwned using k-anonymity (SHA1 prefix).
    No full password is sent to the API — only the first 5 chars of SHA1 hash.
    """
    sha1 = hashlib.sha1(password.encode("utf-8")).hexdigest().upper()
    prefix, suffix = sha1[:5], sha1[5:]

    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.get(
                f"https://api.pwnedpasswords.com/range/{prefix}",
                headers={"User-Agent": "SafeNet-AI-PasswordChecker"},
            )
            if resp.status_code == 200:
                for line in resp.text.splitlines():
                    hash_suffix, count = line.split(":")
                    if hash_suffix == suffix:
                        return {"breached": True, "breach_count": int(count)}
                return {"breached": False, "breach_count": 0}
    except Exception:
        pass

    return {"breached": False, "breach_count": 0, "error": "Could not check breach database"}
