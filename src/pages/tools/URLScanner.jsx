import { useState } from 'react';
import { Globe, AlertTriangle, CheckCircle, Loader, Shield, Activity, Zap, ExternalLink } from 'lucide-react';

const API_BASE = '/api';

const STATUS_COLORS = {
    SAFE:       { bg: 'rgba(0,255,136,0.15)',  border: 'rgba(0,255,136,0.5)',  text: '#00ff88', glow: 'rgba(0,255,136,0.3)', label: 'SAFE' },
    SUSPICIOUS: { bg: 'rgba(255,214,10,0.15)', border: 'rgba(255,214,10,0.5)', text: '#ffd60a', glow: 'rgba(255,214,10,0.3)', label: 'SUSPICIOUS' },
    DANGEROUS:  { bg: 'rgba(255,149,0,0.15)',  border: 'rgba(255,149,0,0.5)',  text: '#ff9500', glow: 'rgba(255,149,0,0.3)', label: 'DANGEROUS' },
    MALICIOUS:  { bg: 'rgba(255,45,85,0.15)',  border: 'rgba(255,45,85,0.5)',  text: '#ff2d55', glow: 'rgba(255,45,85,0.3)', label: 'MALICIOUS' },
};

function RadarScan() {
    return (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 1.5rem' }}>
                {/* Outer rings */}
                {[0,1,2,3].map(i => (
                    <div key={i} style={{
                        position: 'absolute', borderRadius: '50%',
                        inset: `${i * 20}px`,
                        border: `1px solid rgba(0,212,255,${0.2 - i * 0.04})`,
                    }} />
                ))}
                {/* Sweeping arm */}
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, transparent 70%, rgba(0,212,255,0.5) 100%)',
                    animation: 'spin 2s linear infinite',
                    boxShadow: '0 0 40px rgba(0,212,255,0.3)'
                }} />
                {/* Second arm */}
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'conic-gradient(from 180deg, transparent 70%, rgba(167,139,250,0.4) 100%)',
                    animation: 'spin 3s linear infinite reverse',
                }} />
                <Globe size={36} style={{ 
                    position: 'absolute', top: '50%', left: '50%', 
                    transform: 'translate(-50%,-50%)', 
                    color: '#00d4ff',
                    filter: 'drop-shadow(0 0 10px rgba(0,212,255,0.8))'
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
                SCANNING URL
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
                    Checking: domain reputation • phishing patterns • HTTPS • domain age
                </div>
            </div>
        </div>
    );
}

function TrustGauge({ score }) {
    const color = score >= 80 ? '#00ff88' : score >= 60 ? '#ffd60a' : score >= 40 ? '#ff9500' : '#ff2d55';
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="55" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                    <circle cx="70" cy="70" r="55" fill="none" stroke={color} strokeWidth="12"
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        strokeLinecap="round" transform="rotate(-90 70 70)"
                        style={{ 
                            transition: 'stroke-dashoffset 1.5s ease',
                            filter: `drop-shadow(0 0 12px ${color})`
                        }}
                    />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: 900, 
                        color, 
                        fontFamily: 'Orbitron, sans-serif',
                        textShadow: `0 0 20px ${color}`
                    }}>{score}</div>
                    <div style={{ 
                        fontSize: '0.7rem', 
                        color: 'rgba(203,213,225,0.5)', 
                        textTransform: 'uppercase',
                        fontFamily: 'Rajdhani, sans-serif',
                        letterSpacing: '0.1em'
                    }}>Trust Score</div>
                </div>
            </div>
        </div>
    );
}

function ResultCard({ result }) {
    const statusInfo = STATUS_COLORS[result.status] || STATUS_COLORS.SUSPICIOUS;
    const score = result.trust_score || 50;

    return (
        <div style={{ 
            animation: 'fadeInUp 0.5s ease-out',
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'rgba(5,8,22,0.8)',
            border: `1px solid ${statusInfo.border}`,
            boxShadow: `0 0 40px ${statusInfo.glow}`
        }}>
            {/* Header */}
            <div style={{
                padding: '1.5rem 2rem', 
                background: statusInfo.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
                borderBottom: `1px solid ${statusInfo.border}`
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: `${statusInfo.text}15`,
                        border: `2px solid ${statusInfo.text}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 0 30px ${statusInfo.glow}`
                    }}>
                        {result.status === 'SAFE' 
                            ? <CheckCircle size={32} style={{ color: statusInfo.text }} />
                            : <AlertTriangle size={32} style={{ color: statusInfo.text }} />
                        }
                    </div>
                    <div>
                        <div style={{ 
                            fontSize: '0.7rem', 
                            color: statusInfo.text, 
                            fontWeight: 700, 
                            letterSpacing: '0.2em', 
                            textTransform: 'uppercase',
                            fontFamily: 'Rajdhani, sans-serif'
                        }}>URL Status</div>
                        <div style={{ 
                            fontSize: '1.75rem', 
                            fontWeight: 900, 
                            color: statusInfo.text,
                            fontFamily: 'Orbitron, sans-serif',
                            textShadow: `0 0 20px ${statusInfo.glow}`
                        }}>{statusInfo.label}</div>
                    </div>
                </div>
                <TrustGauge score={score} />
            </div>

            {/* Body */}
            <div style={{ padding: '2rem' }}>
                {/* URL Display */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        marginBottom: '0.5rem',
                        color: '#00d4ff',
                        fontFamily: 'Rajdhani, sans-serif',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}>
                        <Globe size={16} />
                        Analyzed URL
                    </div>
                    <div style={{
                        padding: '1rem 1.25rem',
                        background: 'rgba(0,212,255,0.05)',
                        borderRadius: '10px',
                        border: '1px solid rgba(0,212,255,0.15)',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.9rem',
                        color: 'rgba(203,213,225,0.9)',
                        wordBreak: 'break-all'
                    }}>
                        {result.url}
                    </div>
                </div>

                {/* AI Analysis */}
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

                {/* Risk Indicators */}
                {result.risk_indicators && result.risk_indicators.length > 0 && (
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
                            Risk Indicators
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {result.risk_indicators.map((indicator, i) => (
                                <div key={i} style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(255,149,0,0.1)',
                                    border: '1px solid rgba(255,149,0,0.3)',
                                    borderRadius: '6px',
                                    color: '#ff9500',
                                    fontSize: '0.85rem',
                                    fontFamily: 'JetBrains Mono, monospace'
                                }}>
                                    {indicator}
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

export default function URLScanner() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const scanUrl = async () => {
        if (!url.trim()) {
            setError('Please enter a URL to scan');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);
        
        try {
            const res = await fetch(`${API_BASE}/url-scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await res.json();
            setResult(data);
        } catch (e) {
            setError('Failed to scan URL. Please check if the backend is running.');
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
                    background: 'rgba(167,139,250,0.08)', 
                    border: '1px solid rgba(167,139,250,0.2)', 
                    marginBottom: '1rem' 
                }}>
                    <Activity size={14} style={{ color: '#a78bfa' }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}>
                        Real-time Scanning
                    </span>
                </div>
                
                <h1 style={{ 
                    fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc', 
                    marginBottom: '0.75rem', fontFamily: 'Orbitron, sans-serif',
                    letterSpacing: '0.02em'
                }}>
                    <span style={{ color: '#a78bfa' }}>URL</span> Scanner
                </h1>
                <p style={{ 
                    color: 'rgba(203,213,225,0.6)', 
                    fontSize: '1.1rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 500
                }}>
                    Enter a URL to check for malware, phishing, and reputation issues
                </p>
            </div>

            {/* Input Area */}
            <div className="glass-panel" style={{ 
                padding: '1.5rem', 
                marginBottom: '1.5rem',
                border: '1px solid rgba(167,139,250,0.15)'
            }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        style={{
                            flex: '1 1 auto',
                            minWidth: '200px',
                            padding: '1rem 1.25rem',
                            borderRadius: '10px',
                            background: 'rgba(2,4,8,0.6)',
                            border: '1px solid rgba(167,139,250,0.3)',
                            color: '#e2e8f0',
                            fontSize: '1rem',
                            fontFamily: 'JetBrains Mono, monospace'
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && scanUrl()}
                    />
                    
                    <button 
                        onClick={scanUrl}
                        disabled={loading}
                        className="btn-cyber"
                        style={{ 
                            background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                            padding: '1rem 2rem'
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {loading ? <Loader size={18} className="animate-spin" /> : <Globe size={18} />}
                            {loading ? 'Scanning...' : 'Scan URL'}
                        </span>
                    </button>
                </div>
                
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
            </div>

            {/* Results */}
            {loading ? (
                <RadarScan />
            ) : result ? (
                <ResultCard result={result} />
            ) : (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem 2rem',
                    background: 'rgba(5,8,22,0.4)',
                    borderRadius: '16px',
                    border: '1px dashed rgba(167,139,250,0.2)'
                }}>
                    <Shield size={48} style={{ color: 'rgba(167,139,250,0.3)', marginBottom: '1rem' }} />
                    <div style={{ 
                        color: 'rgba(203,213,225,0.5)', 
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: '1.1rem',
                        fontWeight: 500
                    }}>
                        Enter a URL above to start scanning
                    </div>
                </div>
            )}
        </div>
    );
}
