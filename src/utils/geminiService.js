// ============================================================
// GEMINI AI SERVICE — SafeNet-AI
// Central file for all Google Gemini API interactions
// ============================================================
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAz-ONjvzCdqQDoHhLqG0yuGYdVcA-Kum0';
const genAI = new GoogleGenerativeAI(API_KEY);

// Shared model instance (gemini-2.0-flash is fast & free-tier friendly)
const getModel = () => genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// ─── Generic single-turn text generation ───────────────────
export async function geminiAnalyze(prompt) {
    const model = getModel();
    const result = await model.generateContent(prompt);
    return result.response.text();
}

// ─── Multi-turn chat (ChatBot) ──────────────────────────────
const CHAT_SYSTEM_INSTRUCTION = `You are SafeNet AI Assistant, an expert cybersecurity advisor embedded in a security platform. 
Be concise, practical, and always relate advice to real threats. Use markdown bold (**text**) for key terms.
Use bullet points starting with • for lists. Keep responses under 250 words unless complexity demands more.
Always stay on cybersecurity topics only.`;

export async function geminiChat(history, userMessage) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
    });

    // Convert our message history format to Gemini format
    const geminiHistory = history
        .filter(m => m.role !== 'ai' || history.indexOf(m) > 0) // skip initial greeting from history
        .map(m => ({
            role: m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.text }],
        }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(userMessage);
    return result.response.text();
}

// ─── Threat Intelligence — Live news feed ──────────────────
export async function fetchThreatNews() {
    const today = new Date().toISOString().split('T')[0];
    const prompt = `You are a cybersecurity threat intelligence feed. Generate a JSON array of exactly 6 recent (as of ${today}) notable cybersecurity incidents and threat intelligence items.

Each item must have these exact fields:
- "time": relative time string (e.g. "2 hours ago", "6 hours ago", "1 day ago")
- "type": attack type (e.g. "Ransomware", "Data Breach", "Phishing Campaign", "Zero-Day Exploit", "DDoS Attack", "Supply Chain Attack", "APT Activity", "Malware Campaign")
- "target": victim organization/sector description
- "severity": one of "critical", "high", "medium"
- "impact": short impact description (e.g. "~$4.2M ransom", "2.8M records", "72hr outage")
- "detail": one sentence describing the incident

Make the incidents realistic, varied in geography and sector, and plausible for today's threat landscape.
Return ONLY the raw JSON array, no markdown, no explanation.`;

    const text = await geminiAnalyze(prompt);
    // Strip any potential markdown code fences
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
}

// ─── Live KPI stats for Threat Intelligence dashboard ───────
export async function fetchThreatKPIs() {
    const today = new Date().toISOString().split('T')[0];
    const prompt = `Generate realistic cybersecurity threat statistics for ${today} as a JSON object with these exact fields:
- "attacksToday": number (realistic daily global attacks, 40000-80000 range)
- "attacksChange": string like "+14%" or "-3%"
- "phishingSites": number (10000-20000 range)  
- "phishingChange": string like "+9%"
- "malwareSamples": number (15000-25000 range)
- "malwareChange": string like "-2%"
- "ransomwareIncidents": number (1800-3500 range)
- "ransomwareChange": string like "+18%"
- "dataBreaches": number (weekly, 25-60 range)
- "breachesChange": string like "+7%"

Return ONLY the raw JSON object, no markdown.`;

    const text = await geminiAnalyze(prompt);
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
}

// ─── Phishing Email — AI Insight ───────────────────────────
export async function analyzePhishingAI(emailText, localScore) {
    const prompt = `You are a cybersecurity expert analyzing a potentially malicious email. The automated scanner gave it a risk score of ${localScore}/100.

Email content:
"""
${emailText.slice(0, 1500)}
"""

Provide a concise AI security analysis (3-4 sentences max) explaining:
1. The most suspicious element you identified
2. What attack technique this likely represents (e.g. spear phishing, credential harvesting)
3. One specific action the user should take

Use plain text with **bold** for key terms. Be direct and avoid repeating what the automated scan already found.`;

    return await geminiAnalyze(prompt);
}

// ─── URL Scanner — AI Deep Analysis ────────────────────────
export async function scanURLAI(url, localTrustScore) {
    const prompt = `You are a cybersecurity URL analyst. Analyze this URL and provide a brief expert assessment:

URL: ${url}
Automated trust score: ${localTrustScore}/100

In 3-4 sentences, explain:
1. What specific risk patterns you observe in this URL (domain structure, TLD, path, parameters)
2. What type of attack this URL pattern is commonly associated with
3. Your overall verdict and one action the user should take

Use **bold** for key technical terms. Be specific about the URL structure, not generic.`;

    return await geminiAnalyze(prompt);
}

// ─── Password Analyzer — AI Tips ───────────────────────────
export async function analyzePasswordAI(password, stats) {
    // IMPORTANT: We never log/store the actual password - only structural stats
    const prompt = `As a cybersecurity expert, provide personalized password advice based ONLY on these structural stats (the actual password is never shared for privacy):

- Length: ${stats.length} characters
- Has uppercase: ${stats.hasUpper}
- Has lowercase: ${stats.hasLower}  
- Has numbers: ${stats.hasDigit}
- Has special chars: ${stats.hasSpecial}
- Contains common patterns: ${stats.isCommon}
- Has repeating characters: ${stats.hasRepeating}
- Has sequential patterns: ${stats.hasSequential}
- Strength label: ${stats.strengthLabel}
- Entropy: ${stats.entropy} bits

Give 3 specific, actionable tips to improve or praise this password's security. Format as a short paragraph then 3 bullet points with •. Use **bold** for key terms. Total response under 120 words.`;

    return await geminiAnalyze(prompt);
}

// ─── App Permission Analyzer — AI Risk Narrative ───────────
export async function analyzePermissionsAI(appName, permissions, privacyScore) {
    const prompt = `You are a mobile security expert. Analyze the privacy risk of the app "${appName}" requesting these permissions: ${permissions.join(', ')}.

The automated scanner gave it a privacy score of ${privacyScore}/100.

Provide a 3-4 sentence expert analysis covering:
1. The most concerning permission combination and why it's dangerous
2. What malicious behavior this permission set could enable
3. Whether a legitimate app of this type typically needs these permissions

Be specific to the app name and permissions listed. Use **bold** for key terms.`;

    return await geminiAnalyze(prompt);
}

// ─── Cyber Risk Score — AI Action Plan ─────────────────────
export async function getCyberRiskInsight(score, grade, improvements) {
    const improvementList = improvements.slice(0, 5).join('; ');
    const prompt = `You are a cybersecurity advisor. A user just completed a personal security assessment and scored ${score}/100 (${grade} grade).

Their top areas to improve: ${improvementList || 'None — excellent security!'}

Write a personalized 4-5 sentence action plan:
1. Acknowledge their score with appropriate urgency level
2. Identify their single most critical vulnerability to fix first
3. Give one advanced tip appropriate to their security level (${grade})
4. End with an encouraging, forward-looking statement

Keep it conversational, specific, and under 150 words. Use **bold** for key terms.`;

    return await geminiAnalyze(prompt);
}
