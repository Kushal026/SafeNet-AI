import { useState } from 'react';
import { Activity, ChevronRight, Loader, CheckCircle, XCircle, Shield, Target, RefreshCw } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

const API_BASE = '/api';

const QUESTIONS = [
    { id: 'uses_2fa',            text: 'Do you use two-factor authentication (2FA)?',             positive: true,  hint: 'e.g. SMS codes, Google Authenticator, YubiKey' },
    { id: 'reuses_passwords',    text: 'Do you reuse the same password on multiple sites?',        positive: false, hint: 'Using unique passwords per site is critical' },
    { id: 'updates_software',    text: 'Do you regularly update your software and OS?',            positive: true,  hint: 'Updates patch known security vulnerabilities' },
    { id: 'uses_public_wifi',    text: 'Do you frequently use unsecured public WiFi?',             positive: false, hint: 'Public WiFi can expose your traffic to attackers' },
    { id: 'backs_up_data',       text: 'Do you regularly back up your important data?',             positive: true,  hint: 'Backups protect against ransomware attacks' },
    { id: 'uses_vpn',            text: 'Do you use a VPN for browsing?',                           positive: true,  hint: 'VPNs encrypt your traffic on public networks' },
    { id: 'clicks_unknown_links',text: 'Do you sometimes click links from unknown senders?',       positive: false, hint: 'Phishing links are the #1 attack vector' },
    { id: 'uses_password_manager',text: 'Do you use a password manager?',                          positive: true,  hint: 'Password managers help you use strong, unique passwords' },
    { id: 'shares_personal_info', text: 'Do you share personal info on social media publicly?',    positive: false, hint: 'Over-sharing enables social engineering attacks' },
    { id: 'has_antivirus',        text: 'Do you have antivirus/endpoint protection enabled?',      positive: true,  hint: 'Antivirus catches known malware signatures' },
];

const RISK_CONFIG = {
    'HIGH RISK':     { color: '#64b5f6', bg: 'rgba(100,181,246,0.12)', min: 0, max: 100 },
    'MEDIUM RISK':   { color: '#64b5f6', bg: 'rgba(100,181,246,0.12)',  min: 0, max: 100 },
    'LOW RISK':      { color: '#64b5f6', bg: 'rgba(100,181,246,0.12)',  min: 0, max: 100 },
    'VERY LOW RISK': { color: '#64b5f6', bg: 'rgba(100,181,246,0.12)',  min: 0, max: 100 },
};

function ScanningAnimation() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 1.5rem' }}>
        {/* Rotating target rings */}
        {[0,1,2].map(i => (
          <div key={i} style={{
            position: 'absolute', inset: `${i * 20}px`,
            borderRadius: '50%',
            border: `2px solid rgba(100,181,246,${0.3 - i * 0.08})`,
            animation: `spin ${3 - i * 0.5}s linear infinite`,
          }} />
        ))}
        {/* Center target */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '50px', height: '50px', borderRadius: '50%',
          background: 'rgba(100,181,246,0.1)',
          border: '2px solid rgba(100,181,246,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Target size={22} style={{ color: '#64b5f6', filter: 'drop-shadow(0 0 8px rgba(100,181,246,0.5))' }} />
        </div>
      </div>
      <div style={{
        color: '#64b5f6',
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '1rem',
        marginBottom: '0.75rem',
        letterSpacing: '0.1em',
        textShadow: '0 0 10px rgba(100,181,246,0.5)'
      }}>
        CALCULATING RISK SCORE
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#64b5f6',
            animation: `pulse 1s ease-in-out ${i * 0.15}s infinite`,
            boxShadow: '0 0 10px rgba(100,181,246,0.5)'
          }} />
        ))}
      </div>
    </div>
  );
}

export default function CyberRiskScore() {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const currentQ = QUESTIONS[step - 1];
    const progress = step === 0 ? 0 : (step / QUESTIONS.length) * 100;

    const answer = async (value) => {
        const newAnswers = { ...answers, [currentQ.id]: value };
        setAnswers(newAnswers);

        if (step < QUESTIONS.length) {
            setStep(s => s + 1);
        } else {
            setStep(11);
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/cyber-risk-score`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ answers: newAnswers }),
                });
                setResult(await res.json());
                setStep(12);
            } catch {
                setResult({ risk_score: 50, risk_level: 'MEDIUM RISK', summary: 'Backend not connected — sample result shown.', improvements: ['Start the FastAPI server to get real analysis.'] });
                setStep(12);
            } finally {
                setLoading(false);
            }
        }
    };

    const restart = () => { setStep(0); setAnswers({}); setResult(null); };

    const riskConfig = result ? (RISK_CONFIG[result.risk_level] || RISK_CONFIG['MEDIUM RISK']) : null;
    const gaugeData = result ? [{ name: 'risk', value: result.risk_score, fill: riskConfig.color }] : [];

    return (
        <div style={{ maxWidth: '750px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1rem', borderRadius: '100px',
                    background: 'rgba(100,181,246,0.08)',
                    border: '1px solid rgba(100,181,246,0.2)',
                    marginBottom: '1rem'
                }}>
                    <Shield size={14} style={{ color: '#64b5f6' }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64b5f6', letterSpacing: '0.1em', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}>
                        Self Assessment
                    </span>
                </div>
                
                <h1 style={{
                    fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc',
                    marginBottom: '0.75rem', fontFamily: 'Orbitron, sans-serif',
                    letterSpacing: '0.02em'
                }}>
                    <span style={{ color: '#64b5f6' }}>Cyber Risk</span> Score
                </h1>
                <p style={{ 
                    color: 'rgba(203,213,225,0.6)', 
                    fontSize: '1.1rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 500
                }}>
                    Answer 10 questions about your security habits
                </p>
            </div>

            {/* Intro */}
            {step === 0 && (
                <div className="glass-panel" style={{ 
                    padding: '2.5rem 2rem', 
                    border: '1px solid rgba(255,214,10,0.2)',
                    textAlign: 'center', 
                    animation: 'fadeInUp 0.5s ease-out' 
                }}>
                    <div style={{ 
                        width: '80px', height: '80px', 
                        borderRadius: '50%', 
                        background: 'rgba(255,214,10,0.1)',
                        border: '2px solid rgba(255,214,10,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        fontSize: '2.5rem',
                        boxShadow: '0 0 40px rgba(255,214,10,0.15)'
                    }}>
                        🛡️
                    </div>
                    <h2 style={{ 
                        fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', 
                        marginBottom: '0.75rem',
                        fontFamily: 'Orbitron, sans-serif'
                    }}>
                        How secure are you online?
                    </h2>
                    <p style={{ 
                        color: 'rgba(203,213,225,0.6)', 
                        lineHeight: 1.7, 
                        marginBottom: '2rem', 
                        maxWidth: '500px', 
                        margin: '0 auto 2rem',
                        fontSize: '1rem'
                    }}>
                        Answer 10 quick questions about your security habits. We'll calculate your personal Cyber Risk Score (0–100) and give you personalized recommendations.
                    </p>
                    <button
                    onClick={() => setStep(1)}
                    className="btn-cyber"
                    style={{
                        background: 'linear-gradient(135deg, #64b5f6, #64b5f6)',
                        padding: '1rem 2.5rem'
                    }}
                    >
                        Start Assessment →
                    </button>
                </div>
            )}

            {/* Questions */}
            {step >= 1 && step <= QUESTIONS.length && (
                <div style={{ animation: 'fadeInUp 0.35s ease-out' }}>
                    {/* Progress */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'rgba(203,213,225,0.6)', fontFamily: 'Rajdhani, sans-serif' }}>Question {step} of {QUESTIONS.length}</span>
                            <span style={{ fontSize: '0.8rem', color: '#ffd60a', fontFamily: 'JetBrains Mono, monospace' }}>{Math.round(progress)}%</span>
                        </div>
                        <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>
                            <div style={{ 
                                height: '100%', 
                                width: `${progress}%`, 
                                borderRadius: '3px', 
                                background: 'linear-gradient(90deg, #ffd60a, #ff9500)', 
                                transition: 'width 0.5s ease', 
                                boxShadow: '0 0 12px rgba(255,214,10,0.5)' 
                            }} />
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(255,214,10,0.15)' }}>
                        <div style={{ 
                            fontSize: '0.7rem', 
                            color: '#ffd60a', 
                            fontWeight: 700, 
                            letterSpacing: '0.15em', 
                            textTransform: 'uppercase', 
                            marginBottom: '1rem',
                            fontFamily: 'Rajdhani, sans-serif'
                        }}>
                            Question {step}
                        </div>
                        <h3 style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: 700, 
                            color: '#f1f5f9', 
                            marginBottom: '0.75rem', 
                            lineHeight: 1.4 
                        }}>
                            {currentQ.text}
                        </h3>
                        <p style={{ 
                            fontSize: '0.85rem', 
                            color: 'rgba(203,213,225,0.5)', 
                            marginBottom: '2rem' 
                        }}>
                            {currentQ.hint}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button
                                onClick={() => answer('yes')}
                                style={{ 
                                    padding: '1.25rem', 
                                    borderRadius: '14px', 
                                    background: 'rgba(0,255,136,0.08)', 
                                    border: '1px solid rgba(0,255,136,0.25)', 
                                    color: '#00ff88', 
                                    fontWeight: 700, 
                                    fontSize: '1.1rem', 
                                    cursor: 'pointer', 
                                    transition: 'all 0.2s', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '0.5rem' 
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,136,0.15)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,136,0.08)'; e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                <CheckCircle size={20} /> Yes
                            </button>
                            <button
                                onClick={() => answer('no')}
                                style={{ 
                                    padding: '1.25rem', 
                                    borderRadius: '14px', 
                                    background: 'rgba(255,45,85,0.08)', 
                                    border: '1px solid rgba(255,45,85,0.25)', 
                                    color: '#ff2d55', 
                                    fontWeight: 700, 
                                    fontSize: '1.1rem', 
                                    cursor: 'pointer', 
                                    transition: 'all 0.2s', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '0.5rem' 
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,45,85,0.15)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,45,85,0.08)'; e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                <XCircle size={20} /> No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div style={{
                    padding: '3rem',
                    background: 'rgba(5,8,22,0.6)',
                    borderRadius: '16px',
                    border: '1px solid rgba(100,181,246,0.15)'
                }}>
                    <ScanningAnimation />
                </div>
            )}

            {/* Results */}
            {step === 12 && result && (
                <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                    {/* Gauge */}
                    <div style={{ 
                        padding: '2.5rem', 
                        borderRadius: '16px', 
                        background: riskConfig.bg, 
                        border: `1px solid ${riskConfig.color}30`, 
                        marginBottom: '1.5rem', 
                        textAlign: 'center',
                        boxShadow: `0 0 40px ${riskConfig.color}15`
                    }}>
                        <div style={{ height: '180px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart cx="50%" cy="100%" innerRadius="60%" outerRadius="90%" barSize={14} data={gaugeData} startAngle={180} endAngle={0}>
                                    <RadialBar background={{ fill: 'rgba(255,255,255,0.04)' }} dataKey="value" cornerRadius={7} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ marginTop: '-65px' }}>
                            <div style={{ 
                                fontSize: '4rem', 
                                fontWeight: 900, 
                                color: riskConfig.color, 
                                fontFamily: 'Orbitron, sans-serif', 
                                lineHeight: 1,
                                textShadow: `0 0 30px ${riskConfig.color}`
                            }}>
                                {result.risk_score}
                            </div>
                            <div style={{ 
                                fontSize: '0.7rem', 
                                color: 'rgba(203,213,225,0.5)', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.1em',
                                fontFamily: 'Rajdhani, sans-serif'
                            }}>
                                Risk Score
                            </div>
                            <div style={{ 
                                fontSize: '1.25rem', 
                                fontWeight: 800, 
                                color: riskConfig.color, 
                                marginTop: '0.5rem',
                                fontFamily: 'Rajdhani, sans-serif'
                            }}>
                                {result.risk_level}
                            </div>
                        </div>
                        <p style={{ 
                            fontSize: '0.9rem', 
                            color: 'rgba(203,213,225,0.7)', 
                            marginTop: '1.5rem', 
                            maxWidth: '400px', 
                            margin: '1.5rem auto 0', 
                            lineHeight: 1.6 
                        }}>
                            {result.summary}
                        </p>
                    </div>

                    {/* Improvements */}
                    {result.improvements?.length > 0 && (
                        <div className="glass-panel" style={{ 
                            padding: '1.5rem', 
                            border: '1px solid rgba(0,212,255,0.15)',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ 
                                fontSize: '0.8rem', 
                                fontWeight: 700, 
                                color: '#00d4ff', 
                                marginBottom: '1rem', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.1em',
                                fontFamily: 'Rajdhani, sans-serif',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <Target size={16} /> Recommended Improvements
                            </div>
                            {result.improvements.map((item, i) => (
                                <div key={i} style={{ 
                                    display: 'flex', 
                                    gap: '0.75rem', 
                                    padding: '0.875rem 1rem', 
                                    borderRadius: '10px', 
                                    background: 'rgba(0,212,255,0.05)', 
                                    border: '1px solid rgba(0,212,255,0.1)', 
                                    marginBottom: '0.5rem', 
                                    alignItems: 'flex-start' 
                                }}>
                                    <ChevronRight size={18} style={{ color: '#00d4ff', marginTop: '2px', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6 }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={restart}
                        className="btn-cyber"
                        style={{
                            background: 'linear-gradient(135deg, #64b5f6, #64b5f6)',
                            padding: '1rem 2rem',
                            width: '100%'
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <RefreshCw size={18} /> Retake Assessment
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}
