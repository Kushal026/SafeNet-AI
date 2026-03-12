import { useState } from 'react';
import { Eye, AlertTriangle, CheckCircle, Loader, Shield, Activity, Zap, ChevronDown } from 'lucide-react';

const API_BASE = '/api';

const THREAT_COLORS = {
    CRITICAL: { bg: 'rgba(255,45,85,0.15)', border: 'rgba(255,45,85,0.5)', text: '#ff2d55', glow: 'rgba(255,45,85,0.3)', label: 'CRITICAL' },
    HIGH:     { bg: 'rgba(255,149,0,0.15)',  border: 'rgba(255,149,0,0.5)',  text: '#ff9500', glow: 'rgba(255,149,0,0.3)', label: 'HIGH' },
    MEDIUM:   { bg: 'rgba(255,214,10,0.15)', border: 'rgba(255,214,10,0.5)', text: '#ffd60a', glow: 'rgba(255,214,10,0.3)', label: 'MEDIUM' },
    LOW:      { bg: 'rgba(0,212,255,0.15)',  border: 'rgba(0,212,255,0.5)',  text: '#00d4ff', glow: 'rgba(0,212,255,0.3)', label: 'LOW' },
    SAFE:     { bg: 'rgba(0,255,136,0.15)', border: 'rgba(0,255,136,0.5)',  text: '#00ff88', glow: 'rgba(0,255,136,0.3)', label: 'SAFE' },
};

function ScanningAnimation() {
    return (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 1.5rem' }}>
                {/* Outer ring */}
                <div style={{ 
                    position: 'absolute', inset: 0, 
                    borderRadius: '50%', 
                    border: '3px solid rgba(0,212,255,0.15)',
                    boxShadow: '0 0 20px rgba(0,212,255,0.2)'
                }} />
                {/* Rotating ring 1 */}
                <div style={{ 
                    position: 'absolute', inset: 0, 
                    borderRadius: '50%', 
                    border: '3px solid transparent',
                    borderTopColor: '#00d4ff',
                    borderRightColor: '#00d4ff',
                    animation: 'spin 1s linear infinite',
                    boxShadow: '0 0 15px rgba(0,212,255,0.5)'
                }} />
                {/* Rotating ring 2 */}
                <div style={{ 
                    position: 'absolute', inset: '12px', 
                    borderRadius: '50%', 
                    border: '3px solid transparent',
                    borderTopColor: '#a78bfa',
                    borderBottomColor: '#a78bfa',
                    animation: 'spin 1.5s linear infinite reverse',
                    boxShadow: '0 0 15px rgba(167,139,250,0.5)'
                }} />
                {/* Inner ring */}
                <div style={{ 
                    position: 'absolute', inset: '25px', 
                    borderRadius: '50%', 
                    border: '2px solid rgba(0,255,136,0.3)',
                    animation: 'pulse 2s ease-in-out infinite'
                }} />
                <Eye size={32} style={{ 
                    position: 'absolute', inset: 0, margin: 'auto', 
                    color: '#00d4ff', top: '50%', left: '50%', 
                    transform: 'translate(-50%,-50%)',
                    filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.8))'
                }} />
            </div>
            <div style={{ 
                color: '#00d4ff', 
                fontFamily: 'Orbitron, sans-serif', 
                fontSize: '1rem', 
                marginBottom: '0.75rem',
                letterSpacing: '0.1em',
                textShadow: '0 0 10px rgba(0,212,255,0.5)'
            }}>
                AI ANALYSIS IN PROGRESS
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[0,1,2,3,4].map(i => (
                    <div key={i} style={{ 
                        width: '10px', height: '10px', borderRadius: '50%', 
                        background: '#00d4ff',
                        animation: `pulse 1s ease-in-out ${i * 0.15}s infinite`,
                        boxShadow: '0 0 10px rgba(0,212,255,0.5)'
                    }} />
                ))}
            </div>
            <div style={{ 
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(0,212,255,0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(0,212,255,0.2)',
                display: 'inline-block'
            }}>
                <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'rgba(203,213,225,0.6)',
                    fontFamily: 'JetBrains Mono, monospace'
                }}>
                    Scanning for: urgency language • suspicious domains • fake branding • malicious links
                </div>
            </div>
        </div>
    );
}

function ResultCard({ result }) {
    const threat = THREAT_COLORS[result.threat_level] || THREAT_COLORS.SAFE;
    const [expanded, setExpanded] = useState(false);

    return (
        <div style={{ 
            animation: 'fadeInUp 0.5s ease-out',
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'rgba(5,8,22,0.8)',
            border: `1px solid ${threat.border}`,
            boxShadow: `0 0 40px ${threat.glow}`
        }}>
            {/* Threat Level Header */}
            <div style={{
                padding: '1.5rem 2rem', 
                background: threat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
                borderBottom: `1px solid ${threat.border}`
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: `${threat.text}15`,
                        border: `2px solid ${threat.text}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 0 30px ${threat.glow}`
                    }}>
                        {result.threat_level === 'SAFE' || result.threat_level === 'LOW'
                            ? <CheckCircle size={32} style={{ color: threat.text }} />
                            : <AlertTriangle size={32} style={{ color: threat.text }} />
                        }
                    </div>
                    <div>
                        <div style={{ 
                            fontSize: '0.7rem', 
                            color: threat.text, 
                            fontWeight: 700, 
                            letterSpacing: '0.2em', 
                            textTransform: 'uppercase',
                            fontFamily: 'Rajdhani, sans-serif'
                        }}>Threat Level</div>
                        <div style={{ 
                            fontSize: '2rem', 
                            fontWeight: 900, 
                            color: threat.text,
                            fontFamily: 'Orbitron, sans-serif',
                            textShadow: `0 0 20px ${threat.glow}`
                        }}>{threat.label}</div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                        fontSize: '0.7rem', 
                        color: 'rgba(203,213,225,0.5)', 
                        letterSpacing: '0.1em',
                        fontFamily: 'Rajdhani, sans-serif',
                        textTransform: 'uppercase'
                    }}>Risk Score</div>
                    <div style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: 900, 
                        color: threat.text,
                        fontFamily: 'Orbitron, sans-serif'
                    }}>{result.risk_score || 0}<span style={{ fontSize: '1rem', opacity: 0.6 }}>/100</span></div>
                </div>
            </div>

            {/* Results Body */}
            <div style={{ padding: '2rem' }}>
                {/* AI Explanation */}
                {result.ai_explanation && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            marginBottom: '0.75rem',
                            color: '#00d4ff',
                            fontFamily: 'Rajdhani, sans-serif',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}>
                            <Zap size={16} />
                            AI Analysis
                        </div>
                        <div style={{ 
                            padding: '1rem 1.25rem',
                            background: 'rgba(0,212,255,0.05)',
                            borderRadius: '10px',
                            border: '1px solid rgba(0,212,255,0.15)',
                            color: 'rgba(203,213,225,0.9)',
                            fontSize: '0.95rem',
                            lineHeight: 1.7
                        }}>
                            {result.ai_explanation}
                        </div>
                    </div>
                )}

                {/* Suspicious Elements */}
                {result.suspicious_elements && result.suspicious_elements.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            marginBottom: '0.75rem',
                            color: '#ff9500',
                            fontFamily: 'Rajdhani, sans-serif',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}>
                            <AlertTriangle size={16} />
                            Detected Threats
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {result.suspicious_elements.map((elem, i) => (
                                <div key={i} style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(255,149,0,0.1)',
                                    border: '1px solid rgba(255,149,0,0.3)',
                                    borderRadius: '6px',
                                    color: '#ff9500',
                                    fontSize: '0.85rem',
                                    fontFamily: 'JetBrains Mono, monospace'
                                }}>
                                    {elem}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Security Advice */}
                {result.security_advice && result.security_advice.length > 0 && (
                    <div>
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            marginBottom: '0.75rem',
                            color: '#00ff88',
                            fontFamily: 'Rajdhani, sans-serif',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}>
                            <Shield size={16} />
                            Security Recommendations
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {result.security_advice.map((advice, i) => (
                                <div key={i} style={{
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(0,255,136,0.05)',
                                    border: '1px solid rgba(0,255,136,0.15)',
                                    borderRadius: '8px',
                                    color: 'rgba(203,213,225,0.85)',
                                    fontSize: '0.9rem',
                                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem'
                                }}>
                                    <CheckCircle size={16} style={{ color: '#00ff88', flexShrink: 0, marginTop: '2px' }} />
                                    {advice}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PhishingDetector() {
    const [emailText, setEmailText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const analyzeEmail = async () => {
        if (!emailText.trim()) {
            setError('Please enter an email to analyze');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);
        
        try {
            const res = await fetch(`${API_BASE}/phishing-detect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: emailText })
            });
            const data = await res.json();
            setResult(data);
        } catch (e) {
            setError('Failed to analyze email. Please check if the backend is running.');
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                <div style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
                    padding: '0.5rem 1rem', borderRadius: '100px', 
                    background: 'rgba(0,212,255,0.08)', 
                    border: '1px solid rgba(0,212,255,0.2)', 
                    marginBottom: '1rem' 
                }}>
                    <Activity size={14} style={{ color: '#00d4ff' }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#00d4ff', letterSpacing: '0.1em', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}>
                        AI-Powered Detection
                    </span>
                </div>
                
                <h1 style={{ 
                    fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc', 
                    marginBottom: '0.75rem', fontFamily: 'Orbitron, sans-serif',
                    letterSpacing: '0.02em'
                }}>
                    <span style={{ color: '#00d4ff' }}>Phishing</span> Detector
                </h1>
                <p style={{ 
                    color: 'rgba(203,213,225,0.6)', 
                    fontSize: '1.1rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 500
                }}>
                    Paste an email to detect phishing attempts, fake domains, and social engineering tactics
                </p>
            </div>

            {/* Input Area */}
            <div className="glass-panel" style={{ 
                padding: '1.5rem', 
                marginBottom: '1.5rem',
                border: '1px solid rgba(0,212,255,0.15)'
            }}>
                <textarea
                    value={emailText}
                    onChange={(e) => setEmailText(e.target.value)}
                    placeholder="Paste email content here..."
                    style={{
                        width: '100%',
                        minHeight: '180px',
                        padding: '1rem',
                        borderRadius: '10px',
                        background: 'rgba(2,4,8,0.6)',
                        border: '1px solid rgba(0,212,255,0.2)',
                        color: '#e2e8f0',
                        fontSize: '0.95rem',
                        fontFamily: 'Inter, sans-serif',
                        resize: 'vertical'
                    }}
                />
                
                {error && (
                    <div style={{ 
                        padding: '0.75rem 1rem', 
                        background: 'rgba(255,45,85,0.1)', 
                        border: '1px solid rgba(255,45,85,0.3)',
                        borderRadius: '8px',
                        color: '#ff2d55',
                        marginTop: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <button 
                        onClick={analyzeEmail}
                        disabled={loading}
                        className="btn-cyber"
                        style={{ flex: '1 1 auto', minWidth: '200px' }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {loading ? <Loader size={18} className="animate-spin" /> : <Eye size={18} />}
                            {loading ? 'Analyzing...' : 'Analyze Email'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <ScanningAnimation />
            ) : result ? (
                <ResultCard result={result} />
            ) : (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem 2rem',
                    background: 'rgba(5,8,22,0.4)',
                    borderRadius: '16px',
                    border: '1px dashed rgba(0,212,255,0.2)'
                }}>
                    <Shield size={48} style={{ color: 'rgba(0,212,255,0.3)', marginBottom: '1rem' }} />
                    <div style={{ 
                        color: 'rgba(203,213,225,0.5)', 
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: '1.1rem',
                        fontWeight: 500
                    }}>
                        Enter an email above to start AI analysis
                    </div>
                </div>
            )}
        </div>
    );
}
