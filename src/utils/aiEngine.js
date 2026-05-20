// AI Engine - Simulated AI responses for all cybersecurity tools
// In production, replace these with real API calls to Gemini/OpenAI

// ============================================================
// PHISHING EMAIL ANALYZER
// ============================================================
export function analyzePhishingEmail(content) {
    const text = content.toLowerCase();

    const suspiciousKeywords = ['urgent', 'immediately', 'verify', 'suspended', 'click here', 'login', 'confirm', 'account', 'bank', 'paypal', 'amazon', 'security alert', 'limited time', 'act now', 'password', 'credit card', 'social security', 'irs', 'refund', 'prize', 'winner', 'congratulations'];
    const fakeDomains = ['paypa1.com', 'amaz0n.com', 'g00gle.com', 'microsooft.com', 'apple-id.com', 'secure-login', 'account-verify', '-login.'];
    const urgencyPatterns = ['must', 'immediately', 'within 24', 'expire', 'deadline', 'last chance', 'final notice'];
    const maliciousLinks = ['bit.ly', 'tinyurl', 'goo.gl', 'ow.ly', 'http://', '.xyz', '.tk', '.ml', 'verify-account', 'secure-update'];

    let riskScore = 0;
    const findings = [];

    const foundKeywords = suspiciousKeywords.filter(k => text.includes(k));
    if (foundKeywords.length > 0) {
        riskScore += Math.min(foundKeywords.length * 8, 30);
        findings.push({ type: 'Suspicious Keywords', detail: foundKeywords.slice(0, 5).join(', '), severity: 'high' });
    }

    const foundDomains = fakeDomains.filter(d => text.includes(d));
    if (foundDomains.length > 0) {
        riskScore += 35;
        findings.push({ type: 'Fake Domain Pattern', detail: foundDomains.join(', '), severity: 'critical' });
    }

    const foundUrgency = urgencyPatterns.filter(p => text.includes(p));
    if (foundUrgency.length > 0) {
        riskScore += Math.min(foundUrgency.length * 7, 20);
        findings.push({ type: 'Urgency Pattern', detail: foundUrgency.join(', '), severity: 'medium' });
    }

    const foundLinks = maliciousLinks.filter(l => text.includes(l));
    if (foundLinks.length > 0) {
        riskScore += Math.min(foundLinks.length * 12, 30);
        findings.push({ type: 'Suspicious Links', detail: foundLinks.join(', '), severity: 'critical' });
    }

    // Grammar check
    const grammarErrors = (text.match(/dear (costumer|custumer|sir\/madam|user)/g) || []).length;
    if (grammarErrors > 0) {
        riskScore += 15;
        findings.push({ type: 'Grammar Errors', detail: 'Common phishing grammar patterns detected', severity: 'medium' });
    }

    // Generic greeting
    if (text.includes('dear valued customer') || text.includes('dear user') || text.includes('dear account holder')) {
        riskScore += 10;
        findings.push({ type: 'Generic Greeting', detail: 'Phishing emails often use impersonal greetings', severity: 'low' });
    }

    riskScore = Math.min(riskScore, 100);

    let threatLevel, threadColor, advice;
    if (riskScore >= 75) {
        threatLevel = 'CRITICAL';
        threadColor = 'critical';
        advice = 'DO NOT click any links. This is almost certainly a phishing email. Report it as spam immediately and delete it. Never provide personal information.';
    } else if (riskScore >= 50) {
        threatLevel = 'HIGH';
        threadColor = 'high';
        advice = 'High risk of phishing. Do not click links or provide information. Contact the company directly through official channels to verify.';
    } else if (riskScore >= 25) {
        threatLevel = 'MEDIUM';
        threadColor = 'medium';
        advice = 'Proceed with caution. Verify the sender independently before taking any action. Look up the company\'s official contact information.';
    } else if (riskScore >= 10) {
        threatLevel = 'LOW';
        threadColor = 'low';
        advice = 'Low risk detected. This email appears mostly legitimate but always verify unexpected requests before acting.';
    } else {
        threatLevel = 'SAFE';
        threadColor = 'safe';
        advice = 'This email appears safe. No significant phishing indicators detected. Always stay vigilant.';
    }

    return {
        riskScore,
        threatLevel,
        threatColor: threadColor,
        findings: findings.length > 0 ? findings : [{ type: 'Clean Content', detail: 'No obvious phishing patterns detected', severity: 'safe' }],
        advice,
        summary: `Analyzed ${content.split(' ').length} words and identified ${findings.length} indicators.`
    };
}

// ============================================================
// URL SCANNER
// ============================================================
export function scanURL(url) {
    const u = url.toLowerCase().trim();

    let trustScore = 100;
    const issues = [];

    // Check HTTPS
    if (!u.startsWith('https://')) {
        trustScore -= 20;
        issues.push({ issue: 'No HTTPS', detail: 'Connection is not encrypted', severity: 'high' });
    }

    // Suspicious TLDs
    const badTlds = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.click', '.loan', '.pw', '.work'];
    if (badTlds.some(t => u.includes(t))) {
        trustScore -= 35;
        issues.push({ issue: 'Suspicious TLD', detail: 'Domain uses a high-risk top-level domain', severity: 'critical' });
    }

    // Brand impersonation
    const brands = ['paypal', 'amazon', 'google', 'microsoft', 'apple', 'facebook', 'netflix', 'bank', 'chase'];
    const brandFound = brands.find(b => u.includes(b));
    if (brandFound) {
        const domain = u.replace(/https?:\/\//, '').split('/')[0];
        const isLegit = ['paypal.com', 'amazon.com', 'google.com', 'microsoft.com', 'apple.com', 'facebook.com', 'netflix.com'].some(d => domain === d || domain.endsWith('.' + d));
        if (!isLegit) {
            trustScore -= 45;
            issues.push({ issue: 'Brand Impersonation', detail: `Possible fake "${brandFound}" site detected`, severity: 'critical' });
        }
    }

    // Phishing patterns in URL
    const phishPatterns = ['verify', 'secure', 'login-', 'signin', 'account-', 'update', 'confirm', 'banking'];
    const foundPatterns = phishPatterns.filter(p => u.includes(p));
    if (foundPatterns.length >= 2) {
        trustScore -= 25;
        issues.push({ issue: 'Phishing URL Pattern', detail: `Contains patterns: ${foundPatterns.join(', ')}`, severity: 'high' });
    }

    // URL shortener
    const shorteners = ['bit.ly', 'tinyurl', 'goo.gl', 'ow.ly', 't.co', 'is.gd', 'buff.ly'];
    if (shorteners.some(s => u.includes(s))) {
        trustScore -= 15;
        issues.push({ issue: 'URL Shortener', detail: 'Shortened URLs hide the real destination', severity: 'medium' });
    }

    // Excessive subdomains
    const domainParts = u.replace(/https?:\/\//, '').split('/')[0].split('.');
    if (domainParts.length > 4) {
        trustScore -= 20;
        issues.push({ issue: 'Excessive Subdomains', detail: 'Complex subdomain structure is suspicious', severity: 'medium' });
    }

    // IP address instead of domain
    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(u)) {
        trustScore -= 40;
        issues.push({ issue: 'IP Address URL', detail: 'URL uses raw IP instead of domain name', severity: 'critical' });
    }

    trustScore = Math.max(0, trustScore);

    let status, explanation;
    if (trustScore >= 80) {
        status = 'SAFE';
        explanation = 'This URL appears legitimate. HTTPS is active, domain looks authentic, and no phishing patterns detected.';
    } else if (trustScore >= 60) {
        status = 'LOW RISK';
        explanation = 'This URL has minor concerns. Proceed with caution and verify the site\'s authenticity before entering any personal information.';
    } else if (trustScore >= 35) {
        status = 'SUSPICIOUS';
        explanation = 'This URL shows multiple suspicious characteristics. It may be a phishing site. Avoid entering any personal information.';
    } else {
        status = 'MALICIOUS';
        explanation = 'WARNING: This URL shows strong indicators of a malicious or phishing website. Do NOT visit this URL or provide any information.';
    }

    return { trustScore, status, issues, explanation };
}

// ============================================================
// PASSWORD ANALYZER
// ============================================================
export function analyzePassword(password) {
    if (!password) return null;

    const len = password.length;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const charsetSize = (hasUpper ? 26 : 0) + (hasLower ? 26 : 0) + (hasDigit ? 10 : 0) + (hasSpecial ? 32 : 0);
    const entropy = Math.log2(Math.pow(charsetSize || 1, len));

    const commonPatterns = ['123456', 'password', 'qwerty', 'abc123', 'letmein', 'admin', 'welcome', 'monkey', 'dragon', '111111', 'iloveyou', '123123', 'sunshine', 'princess'];
    const isCommon = commonPatterns.some(p => password.toLowerCase().includes(p));
    const hasRepeating = /(.)\1{2,}/.test(password);
    const hasSequential = /(?:abc|bcd|cde|123|234|345|456|567|678|789)/i.test(password);

    let strengthScore = 0;
    const suggestions = [];

    // Length
    if (len >= 16) strengthScore += 30;
    else if (len >= 12) strengthScore += 20;
    else if (len >= 8) strengthScore += 10;
    else { strengthScore += 0; suggestions.push('Use at least 12 characters'); }

    // Character variety
    if (hasUpper) strengthScore += 15; else suggestions.push('Add uppercase letters (A-Z)');
    if (hasLower) strengthScore += 15; else suggestions.push('Add lowercase letters (a-z)');
    if (hasDigit) strengthScore += 15; else suggestions.push('Add numbers (0-9)');
    if (hasSpecial) strengthScore += 20; else suggestions.push('Add special characters (!@#$%...)');

    // Deductions
    if (isCommon) { strengthScore -= 30; suggestions.push('Avoid common passwords and dictionary words'); }
    if (hasRepeating) { strengthScore -= 10; suggestions.push('Avoid repeating characters'); }
    if (hasSequential) { strengthScore -= 10; suggestions.push('Avoid sequential patterns (123, abc)'); }

    strengthScore = Math.max(0, Math.min(100, strengthScore));

    let strengthLabel, strengthColor;
    if (strengthScore >= 80) { strengthLabel = 'Very Strong'; strengthColor = '#00ff88'; }
    else if (strengthScore >= 60) { strengthLabel = 'Strong'; strengthColor = '#39ff14'; }
    else if (strengthScore >= 40) { strengthLabel = 'Moderate'; strengthColor = '#ffd60a'; }
    else if (strengthScore >= 20) { strengthLabel = 'Weak'; strengthColor = '#ff9500'; }
    else { strengthLabel = 'Very Weak'; strengthColor = '#ff2d55'; }

    // Crack time estimation
    const possibleCombinations = Math.pow(charsetSize || 1, len);
    const guessesPerSecond = 1e12; // 1 trillion per second (GPU attack)
    const secondsToCrack = possibleCombinations / guessesPerSecond;

    let crackTime;
    if (secondsToCrack < 1) crackTime = 'Instantly';
    else if (secondsToCrack < 60) crackTime = `${Math.round(secondsToCrack)} seconds`;
    else if (secondsToCrack < 3600) crackTime = `${Math.round(secondsToCrack / 60)} minutes`;
    else if (secondsToCrack < 86400) crackTime = `${Math.round(secondsToCrack / 3600)} hours`;
    else if (secondsToCrack < 2592000) crackTime = `${Math.round(secondsToCrack / 86400)} days`;
    else if (secondsToCrack < 31536000) crackTime = `${Math.round(secondsToCrack / 2592000)} months`;
    else if (secondsToCrack < 3153600000) crackTime = `${Math.round(secondsToCrack / 31536000)} years`;
    else crackTime = `${(secondsToCrack / 3.154e10).toFixed(1)} centuries`;

    return {
        strengthScore,
        strengthLabel,
        strengthColor,
        entropy: Math.round(entropy),
        crackTime,
        charsetSize,
        hasUpper, hasLower, hasDigit, hasSpecial,
        isCommon, hasRepeating, hasSequential,
        suggestions: suggestions.length > 0 ? suggestions : ['Your password is excellent! Keep it unique per service.'],
    };
}

// ============================================================
// CYBER RISK QUIZ SCORER
// ============================================================
export function calculateCyberRiskScore(answers) {
    // answers: array of { question, answer, weight, goodAnswer }
    let totalWeight = 0;
    let earnedPoints = 0;

    answers.forEach(a => {
        totalWeight += a.weight;
        if (a.answer === a.goodAnswer) earnedPoints += a.weight;
        else if (a.partialCredit && a.answer === a.partialCredit.answer) earnedPoints += a.partialCredit.points;
    });

    const score = Math.round((earnedPoints / totalWeight) * 100);

    let grade, color, summary;
    if (score >= 85) { grade = 'Excellent'; color = '#00ff88'; summary = 'You have strong cybersecurity practices! Keep maintaining good habits.'; }
    else if (score >= 70) { grade = 'Good'; color = '#39ff14'; summary = 'You have decent security habits but a few areas need attention.'; }
    else if (score >= 50) { grade = 'Fair'; color = '#ffd60a'; summary = 'Your security posture has significant gaps. Action required.'; }
    else if (score >= 30) { grade = 'Poor'; color = '#ff9500'; summary = 'You are at significant risk. Multiple critical improvements needed.'; }
    else { grade = 'Critical'; color = '#ff2d55'; summary = 'Your digital security is critically vulnerable. Immediate action required.'; }

    const improvements = answers
        .filter(a => a.answer !== a.goodAnswer)
        .map(a => a.improvement);

    return { score, grade, color, summary, improvements };
}

// ============================================================
// AI CHAT RESPONSES
// ============================================================
export async function getAIChatResponse(question) {
    const q = question.toLowerCase();

    const responses = {
        phishing: {
            keywords: ['phishing', 'fake email', 'suspicious email', 'scam email'],
            response: "🎣 **Phishing Detection Tips:**\n\n• Check the sender's email domain carefully (e.g., 'paypa1.com' vs 'paypal.com')\n• Hover over links before clicking — the displayed URL may differ from the real one\n• Legitimate companies never ask for passwords via email\n• Look for urgency tactics like 'Act NOW or your account will be suspended'\n• Use our **Phishing Email Detector** tool to analyze suspicious emails instantly!"
        },
        wifi: {
            keywords: ['wifi', 'wi-fi', 'public wifi', 'hotspot', 'network'],
            response: "📶 **Public WiFi Safety:**\n\n• **Always use a VPN** when on public WiFi — it encrypts your traffic\n• Avoid accessing banking or sensitive apps on public networks\n• Look for HTTPS (🔒) in your browser's address bar\n• Disable 'Auto-connect to WiFi' on your phone\n• Verify the network name with staff — attackers create fake hotspots with similar names (Evil Twin Attack)\n\n🔴 Never enter passwords on public WiFi without a VPN!"
        },
        password: {
            keywords: ['password', 'passphrase', 'credentials', '2fa', 'two factor', 'authentication'],
            response: "🔑 **Password Security Best Practices:**\n\n• Use a **password manager** (Bitwarden, 1Password) — never reuse passwords\n• Create passwords 16+ characters long with mixed case, numbers and symbols\n• Enable **2-Factor Authentication (2FA)** on all accounts — use an app, not SMS if possible\n• Check if your email was breached at haveibeenpwned.com\n• Change passwords immediately after any data breach\n\nTry our **Password Strength Analyzer** for instant AI evaluation!"
        },
        vpn: {
            keywords: ['vpn', 'proxy', 'anonymous', 'privacy'],
            response: "🛡️ **VPN Guide:**\n\n• A VPN encrypts all your internet traffic through a secure tunnel\n• Choose reputable paid VPNs: ProtonVPN, ExpressVPN, Mullvad\n• Free VPNs often sell your data — avoid them\n• VPN protects you on public WiFi and hides your IP address\n• A VPN does NOT make you completely anonymous — combine with good browsing habits"
        },
        malware: {
            keywords: ['malware', 'virus', 'trojan', 'ransomware', 'infected', 'hacked'],
            response: "🦠 **Malware Protection:**\n\n• Keep your OS and apps updated — patches fix known vulnerabilities\n• Use reputable antivirus: Windows Defender, Malwarebytes\n• Never download software from unofficial sources\n• Be cautious of email attachments — even from known contacts\n• If infected: disconnect from internet → run antivirus scan → change passwords from a clean device\n• **Ransomware:** Never pay the ransom — backup your files regularly!"
        },
        social: {
            keywords: ['social engineering', 'scam', 'fraud', 'manipulation', 'pretexting'],
            response: "🎭 **Social Engineering Awareness:**\n\n• Attackers manipulate people psychologically, not just technology\n• Common tactics: Pretexting (fake authority), Baiting, Quid Pro Quo\n• **Vishing:** Phone scam pretending to be IT support, IRS, bank\n• Always verify identity independently through official channels\n• Never give passwords, OTPs, or personal info over phone/email"
        },
        general: {
            keywords: [],
            response: "🛡️ **SafeNet AI Assistant** at your service!\n\nI can help with:\n• 🎣 Phishing email detection\n• 🌐 Website safety checks\n• 🔑 Password security\n• 📶 Public WiFi safety\n• 🦠 Malware protection\n• 📊 Checking your personal Cyber Risk Score\n\nOr use our **7 AI Security Tools** in the dashboard for in-depth analysis. What specific cybersecurity question can I help with?"
        }
    };

    // Simulate async delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    for (const [key, data] of Object.entries(responses)) {
        if (key === 'general') continue;
        if (data.keywords.some(kw => q.includes(kw))) {
            return data.response;
        }
    }

    // Check for tool guidance
    if (q.includes('url') || q.includes('website') || q.includes('link')) {
        return "🌐 **Website Safety Check:**\n\nUse our **URL Scanner** tool to instantly check if a website is safe.\n\nGeneral tips:\n• Always check for HTTPS (🔒)\n• Verify the domain spelling carefully\n• Newly registered domains (< 1 year old) are higher risk\n• Tools like VirusTotal.com can cross-check URLs against 70+ antivirus engines";
    }

    if (q.includes('data breach') || q.includes('breach') || q.includes('leaked')) {
        return "💾 **Data Breach Response:**\n\n1. Visit **haveibeenpwned.com** to check if your email was compromised\n2. Immediately change passwords for affected services\n3. Enable 2FA on all accounts\n4. Monitor your bank and credit card statements\n5. Consider a credit freeze if financial data was leaked\n6. Be extra vigilant for targeted phishing attacks after a breach";
    }

    return responses.general.response;
}
