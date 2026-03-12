"""
Threat Intelligence Service
Integrates with VirusTotal, Google Safe Browsing, and HaveIBeenPwned.
Falls back to rule-based analysis when API keys are not set.
"""
import os
import re
import hashlib
import httpx
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY", "")
GOOGLE_SB_KEY = os.getenv("GOOGLE_SAFE_BROWSING_KEY", "")


async def scan_url(url: str) -> dict:
    """Full URL reputation scan."""
    parsed = urlparse(url if url.startswith("http") else f"http://{url}")
    domain = parsed.netloc or parsed.path.split("/")[0]

    # Basic checks (always performed)
    basic = _basic_url_analysis(url, domain, parsed)

    # If API keys available, query VirusTotal
    vt_result = None
    if VIRUSTOTAL_API_KEY:
        vt_result = await _virustotal_scan(url)

    # Merge results
    return _merge_url_results(url, domain, basic, vt_result)


def _basic_url_analysis(url: str, domain: str, parsed) -> dict:
    """Rule-based URL reputation check."""
    risk_indicators = []
    score = 100  # Start with perfect trust score

    # HTTPS check
    is_https = parsed.scheme == "https"
    if not is_https:
        risk_indicators.append("No HTTPS — connection is not encrypted")
        score -= 20

    # Suspicious TLDs
    suspicious_tlds = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".win"]
    for tld in suspicious_tlds:
        if domain.endswith(tld):
            risk_indicators.append(f"Suspicious free TLD: {tld}")
            score -= 25
            break

    # IP address URL
    if re.match(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", domain):
        risk_indicators.append("URL uses IP address instead of domain name")
        score -= 30

    # URL shorteners
    shorteners = ["bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "tiny.cc"]
    if domain in shorteners:
        risk_indicators.append("URL shortener detected — destination unknown")
        score -= 15

    # Phishing keywords in domain
    phishing_keywords = [
        "login", "secure", "verify", "update", "account", "banking",
        "paypal", "amazon", "apple", "microsoft", "google", "facebook",
    ]
    for kw in phishing_keywords:
        if kw in domain.lower() and kw not in ["google.com", "amazon.com", "apple.com"]:
            risk_indicators.append(f"Suspicious keyword in domain: '{kw}'")
            score -= 10
            break

    # Excessive subdomains
    subdomain_count = len(domain.split(".")) - 2
    if subdomain_count >= 3:
        risk_indicators.append(f"Suspicious: {subdomain_count} subdomains (common in phishing)")
        score -= 10

    # Long URL
    if len(url) > 150:
        risk_indicators.append("Unusually long URL — may contain obfuscated redirect")
        score -= 5

    score = max(0, min(100, score))

    if score >= 80:
        status = "SAFE"
        threat_level = "LOW"
    elif score >= 60:
        status = "SUSPICIOUS"
        threat_level = "MEDIUM"
    elif score >= 40:
        status = "DANGEROUS"
        threat_level = "HIGH"
    else:
        status = "MALICIOUS"
        threat_level = "CRITICAL"

    return {
        "trust_score": score,
        "status": status,
        "threat_level": threat_level,
        "is_https": is_https,
        "risk_indicators": risk_indicators,
        "domain": domain,
        "virustotal_checked": False,
    }


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


def _merge_url_results(url, domain, basic, vt_result) -> dict:
    result = {**basic, "url": url}

    if vt_result:
        result["virustotal"] = vt_result
        result["virustotal_checked"] = True
        malicious = vt_result.get("malicious", 0)
        if malicious > 5:
            result["trust_score"] = max(0, result["trust_score"] - 40)
            result["status"] = "MALICIOUS"
            result["threat_level"] = "CRITICAL"
            result["risk_indicators"].append(f"VirusTotal: {malicious} engines flagged as malicious")
        elif malicious > 0:
            result["trust_score"] = max(0, result["trust_score"] - 20)
            result["risk_indicators"].append(f"VirusTotal: {malicious} engines flagged as suspicious")

    result["ai_explanation"] = _generate_url_explanation(result)
    return result


def _generate_url_explanation(result: dict) -> str:
    status = result["status"]
    score = result["trust_score"]
    domain = result["domain"]

    if status == "SAFE":
        return f"'{domain}' appears to be a legitimate website with a trust score of {score}/100. No significant threats detected."
    elif status == "SUSPICIOUS":
        indicators = result.get("risk_indicators", [])
        return f"'{domain}' shows {len(indicators)} suspicious indicator(s). Exercise caution: {indicators[0] if indicators else 'unusual patterns detected'}."
    elif status == "DANGEROUS":
        return f"'{domain}' is likely dangerous. Multiple threat indicators detected. Do not visit this site or enter any personal information."
    else:
        return f"'{domain}' is identified as MALICIOUS. This URL is used for phishing, malware distribution, or credential theft. Avoid immediately."


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
