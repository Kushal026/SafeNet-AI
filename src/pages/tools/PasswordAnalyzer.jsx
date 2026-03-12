import { useState } from 'react';
import { Lock, Eye, EyeOff, AlertTriangle, CheckCircle, Loader, Shield, Activity, Key } from 'lucide-react';

const API_BASE = '/api';

const STRENGTH_CONFIG = {
    'Very Weak': { color: '#ff2d55', bg: 'rgba(255,45,85,0.15)', border: 'rgba(255,45,85,0.4)', label: 'VERY WEAK' },
    'Weak':      { color: '#ff9500', bg: 'rgba(255,149,0,0.15)', border: 'rgba(255,149,0,0.4)', label: 'WEAK' },
    'Moderate':  { color: '#ffd60a', bg: 'rgba(255,214,10,0.15)', border: 'rgba(255,214,10,0.4)', label: 'MODERATE' },
    'Strong':    { color: '#00d4ff', bg: 'rgba(0,212,255,0.15)', border: 'rgba(0,212,255,0.4)', label: 'STRONG' },
    'Very Strong': { color: '#00ff88', bg: 'rgba(0,255,136,0.15)', border: 'rgba(0,255,136,0.4)', label: 'VERY STRONG' },
};

function AnalyzingAnimation() {
    return (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 1.5rem' }}>
                {/* Rotating rings */}
                {[0,1,2].map(i => (
                    <div key={i} style={{
                        position: 'absolute', inset: `${i * 15}px`,
                        borderRadius: '50%',
                        border: `2px solid rgba(0,255,136,${0.3 - i * 0.08})`,
                        borderTopColor: 'transparent',
                        animation: `spin ${2 - i * 0.4}s linear infinite`,
                    }} />
                ))}
                {/* Center lock */}
                <div style={{ 
                    position: 'absolute', top: '50%', left: '50%', 
                    transform: 'translate(-50%,-50%)',
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: 'rgba(0,255,136,0.1)',
                    border: '2px solid rgba(0,255,136,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Key size={22} style={{ color: '#00ff88', filter: 'drop-shadow(0 0 8px rgba(0,255,136,0.5))' }} />
                </div>
            </div>
            <div style={{ 
                color: '#00ff88', 
                fontFamily: 'Orbitron, sans-serif', 
                fontSize: '1rem', 
                marginBottom: '0.75rem',
                letterSpacing: '0.1em',
                textShadow: '0 0 10px rgba(0,255,136,0.5)'
            }}>
                ANALYZING PASSWORD
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[0,1,2,3,4].map(i => (
                    <div key={i} style={{ 
                        width: '10px', height: '10px', borderRadius: '50%', 
                        background: '#00ff88',
                        animation: `pulse 1s ease-in-out ${i * 0.15}s infinite`,
                        boxShadow: '0 0 10px rgba(0,255,136,0.5)'
                    }} />
                ))}
            </div>
            <div style={{ 
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(0,255,136,0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(0,255,136,0.2)',
                display: 'inline-block'
            }}>
                <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'rgba(203,213,225,0.6)',
                    fontFamily: 'JetBrains Mono, monospace'
                }}>
                    Checking: entropy • dictionary • patterns • breach status
                </div>
            </div>
        </div>
    );
}

function StrengthMeter({ strength, score }) {
    const config = STRENGTH_CONFIG[strength] || STRENGTH_CONFIG['Weak'];
    return (
        <div style={{ padding: '1.5rem', borderRadius: '12px', background: config.bg, border: `1px solid ${config.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(203,213,225,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Rajdhani, sans-serif' }}>Password Strength</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: config.color, fontFamily: 'Orbitron, sans-serif', textShadow: `0 0 15px ${config.color}` }}>{config.label}</span>
            </div>
            <div style={{ height: '12px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', overflow: 'hidden' }}>
                <div style={{
                    height: '100%', borderRadius: '6px', 
                    width: score >= 80 ? '100%' : score >= 60 ? '75%' : score >= 40 ? '50%' : score >= 20 ? '25%' : '10%',
                    background: `linear-gradient(90deg, ${config.color}, ${config.color}cc)`,
                    boxShadow: `0 0 20px ${config.color}`,
                    transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(203,213,225,0.4)' }}>Weak</span>
                <span style={{ fontSize: '0.85rem', color: config.color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{score}/100</span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(203,213,225,0.4)' }}>Strong</span>
            </div>
        </div>
    );
}

function CharAnalysis({ analysis }) {
    const items = [
        { label: 'Length', value: `${analysis.length} chars`, good: analysis.length >= 12 },
        { label: 'Uppercase', value: analysis.has_uppercase ? '✓' : '✗', good: analysis.has_uppercase },
        { label: 'Lowercase', value: analysis.has_lowercase ? '✓' : '✗', good: analysis.has_lowercase },
        { label: 'Numbers', value: analysis.has_digits ? '✓' : '✗', good: analysis.has_digits },
        { label: 'Symbols', value: analysis.has_special ? '✓' : '✗', good: analysis.has_special },
        { label: 'Unique Chars', value: analysis.unique_chars, good: analysis.unique_chars >= 8 },
    ];
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {items.map((item, i) => (
                <div key={i} style={{ 
                    padding: '1rem', 
                    borderRadius: '10px', 
                    background: item.good ? 'rgba(0,255,136,0.08)' : 'rgba(255,45,85,0.08)', 
                    border: `1px solid ${item.good ? 'rgba(0,255,136,0.25)' : 'rgba(255,45,85,0.25)'}`, 
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(203,213,225,0.5)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: item.good ? '#00ff88' : '#ff2d55', fontFamily: 'JetBrains Mono, monospace' }}>{item.value}</div>
                </div>
            ))}
        </div>
    );
}

function CrackTimeDisplay({ time }) {
    return (
        <div style={{ 
            padding: '1.5rem', 
            borderRadius: '12px', 
            background: 'rgba(255,214,10,0.08)', 
            border: '1px solid rgba(255,214,10,0.25)',
            textAlign: 'center'
        }}>
            <div style={{ 
                fontSize: '0.7rem', 
                color: 'rgba(203,213,225,0.5)', 
                marginBottom: '0.5rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em' 
            }}>
                Estimated Crack Time
            </div>
            <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 900, 
                color: '#ffd60a', 
                fontFamily: 'Orbitron, sans-serif',
                textShadow: '0 0 20px rgba(255,214,10,0.3)'
            }}>
                {time}
            </div>
        </div>
    );
}

export default function PasswordAnalyzer() {
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const analyze = async () => {
        if (!password) { setError('Please enter a password to analyze.'); return; }
        setLoading(true); setError(''); setResult(null);
        
        try {
            const res = await fetch(`${API_BASE}/password-analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            setResult(data);
        } catch {
            setError('Backend not connected. Please start the FastAPI server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                <div style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
                    padding: '0.5rem 1rem', borderRadius: '100px', 
                    background: 'rgba(0,255,136,0.08)', 
                    border: '1px solid rgba(0,255,136,0.2)', 
                    marginBottom: '1rem' 
                }}>
                    <Shield size={14} style={{ color: '#00ff88' }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#00ff88', letterSpacing: '0.1em', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}>
                        Security Analysis
                    </span>
                </div>
                
                <h1 style={{ 
                    fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc', 
                    marginBottom: '0.75rem', fontFamily: 'Orbitron, sans-serif',
                    letterSpacing: '0.02em'
                }}>
                    <span style={{ color: '#00ff88' }}>Password</span> Analyzer
                </h1>
                <p style={{ 
                    color: 'rgba(203,213,225,0.6)', 
                    fontSize: '1.1rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 500
                }}>
                    Evaluate password entropy, crack time, and check for data breaches
                </p>
            </div>

            {/* Input Area */}
            <div className="glass-panel" style={{ 
                padding: '1.5rem', 
                marginBottom: '1.5rem',
                border: '1px solid rgba(0,255,136,0.15)'
            }}>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && analyze()}
                        placeholder="Enter password to analyze..."
                        style={{
                            width: '100%',
                            padding: '1rem 3rem 1rem 1.25rem',
                            borderRadius: '10px',
                            background: 'rgba(2,4,8,0.6)',
                            border: '1px solid rgba(0,255,136,0.3)',
                            color: '#e2e8f0',
                            fontSize: '1rem',
                            fontFamily: 'JetBrains Mono, monospace'
                        }}
                    />
                    <button 
                        onClick={() => setShowPw(!showPw)} 
                        style={{ 
                            position: 'absolute', right: '1rem', top: '50%', 
                            transform: 'translateY(-50%)', 
                            background: 'none', border: 'none', 
                            cursor: 'pointer', 
                            color: showPw ? '#00ff88' : '#64748b',
                            padding: '0.25rem'
                        }}>
                        {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                
                <div style={{ 
                    fontSize: '0.72rem', 
                    color: 'rgba(203,213,225,0.4)', 
                    marginBottom: '1rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem' 
                }}>
                    <Lock size={12} />
                    Your password is never stored. Only k-anonymity hash is sent for breach check.
                </div>
                
                <button 
                    onClick={analyze}
                    disabled={loading || !password}
                    className="btn-cyber"
                    style={{ 
                        background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                        padding: '1rem 2rem',
                        width: '100%'
                    }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        {loading ? <Loader size={18} className="animate-spin" /> : <Lock size={18} />}
                        {loading ? 'Analyzing...' : 'Analyze Password'}
                    </span>
                </button>
                
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
                <AnalyzingAnimation />
            ) : result ? (
                <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                    {/* Strength Meter */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <StrengthMeter strength={result.strength} score={result.score} />
                    </div>

                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ 
                            padding: '1.25rem', 
                            borderRadius: '12px', 
                            background: 'rgba(167,139,250,0.08)', 
                            border: '1px solid rgba(167,139,250,0.25)',
                            textAlign: 'center'
                        }}>
                            <div style={{ 
                                fontSize: '0.7rem', 
                                color: 'rgba(203,213,225,0.5)', 
                                marginBottom: '0.5rem', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.1em' 
                            }}>
                                Entropy
                            </div>
                            <div style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: 900, 
                                color: '#a78bfa', 
                                fontFamily: 'Orbitron, sans-serif'
                            }}>
                                {result.entropy}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(203,213,225,0.4)' }}>bits</div>
                        </div>
                        
                        <CrackTimeDisplay time={result.crack_time} />
                        
                        <div style={{ 
                            padding: '1.25rem', 
                            borderRadius: '12px', 
                            background: 'rgba(0,212,255,0.08)', 
                            border: '1px solid rgba(0,212,255,0.25)',
                            textAlign: 'center'
                        }}>
                            <div style={{ 
                                fontSize: '0.7rem', 
                                color: 'rgba(203,213,225,0.5)', 
                                marginBottom: '0.5rem', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.1em' 
                            }}>
                                Unique Characters
                            </div>
                            <div style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: 900, 
                                color: '#00d4ff', 
                                fontFamily: 'Orbitron, sans-serif'
                            }}>
                                {result.character_analysis?.unique_chars || 0}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(203,213,225,0.4)' }}>characters</div>
                        </div>
                    </div>

                    {/* Breach Check */}
                    {result.breach_check && (
                        <div style={{ 
                            padding: '1.25rem', 
                            borderRadius: '12px', 
                            marginBottom: '1.5rem', 
                            background: result.breach_check.breached ? 'rgba(255,45,85,0.1)' : 'rgba(0,255,136,0.08)', 
                            border: `1px solid ${result.breach_check.breached ? 'rgba(255,45,85,0.3)' : 'rgba(0,255,136,0.25)'}` 
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '56px', height: '56px', borderRadius: '50%',
                                    background: result.breach_check.breached ? 'rgba(255,45,85,0.15)' : 'rgba(0,255,136,0.15)',
                                    border: `2px solid ${result.breach_check.breached ? '#ff2d55' : '#00ff88'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {result.breach_check.breached 
                                        ? <AlertTriangle size={26} style={{ color: '#ff2d55' }} />
                                        : <CheckCircle size={26} style={{ color: '#00ff88' }} />
                                    }
                                </div>
                                <div>
                                    <div style={{ 
                                        fontWeight: 700, 
                                        color: result.breach_check.breached ? '#ff2d55' : '#00ff88', 
                                        fontSize: '1rem',
                                        fontFamily: 'Rajdhani, sans-serif'
                                    }}>
                                        {result.breach_check.breached 
                                            ? `⚠ Password BREACHED! Found ${result.breach_check.breach_count?.toLocaleString()} times`
                                            : '✓ Password not found in known data breaches'
                                        }
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(203,213,225,0.5)', marginTop: '0.25rem' }}>
                                        Checked via HaveIBeenPwned (k-anonymity)
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Character Analysis */}
                    <div style={{ 
                        padding: '1.5rem', 
                        borderRadius: '12px', 
                        background: 'rgba(13,17,23,0.7)', 
                        border: '1px solid rgba(0,212,255,0.12)', 
                        marginBottom: '1.5rem' 
                    }}>
                        <div style={{ 
                            fontSize: '0.8rem', 
                            fontWeight: 700, 
                            color: '#00d4ff', 
                            marginBottom: '1rem', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.1em',
                            fontFamily: 'Rajdhani, sans-serif'
                        }}>
                            Character Analysis
                        </div>
                        <CharAnalysis analysis={result.character_analysis} />
                    </div>

                    {/* Warnings */}
                    {result.warnings?.length > 0 && (
                        <div style={{ 
                            padding: '1.25rem', 
                            borderRadius: '12px', 
                            background: 'rgba(255,149,0,0.08)', 
                            border: '1px solid rgba(255,149,0,0.25)', 
                            marginBottom: '1.5rem' 
                        }}>
                            <div style={{ 
                                fontSize: '0.8rem', 
                                fontWeight: 700, 
                                color: '#ff9500', 
                                marginBottom: '1rem', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.1em',
                                fontFamily: 'Rajdhani, sans-serif'
                            }}>
                                ⚠ Security Warnings
                            </div>
                            {result.warnings.map((w, i) => (
                                <div key={i} style={{ 
                                    display: 'flex', 
                                    gap: '0.75rem', 
                                    marginBottom: '0.5rem', 
                                    fontSize: '0.9rem', 
                                    color: '#e2e8f0' 
                                }}>
                                    <AlertTriangle size={16} style={{ color: '#ff9500', flexShrink: 0, marginTop: '2px' }} />
                                    {w}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Suggestions */}
                    <div style={{ 
                        padding: '1.25rem', 
                        borderRadius: '12px', 
                        background: 'rgba(0,212,255,0.06)', 
                        border: '1px solid rgba(0,212,255,0.15)' 
                    }}>
                        <div style={{ 
                            fontSize: '0.8rem', 
                            fontWeight: 700, 
                            color: '#00d4ff', 
                            marginBottom: '1rem', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.1em',
                            fontFamily: 'Rajdhani, sans-serif'
                        }}>
                            💡 Improvement Tips
                        </div>
                        {result.suggestions?.map((s, i) => (
                            <div key={i} style={{ 
                                display: 'flex', 
                                gap: '0.75rem', 
                                marginBottom: '0.5rem', 
                                fontSize: '0.9rem', 
                                color: '#e2e8f0' 
                            }}>
                                <CheckCircle size={16} style={{ color: '#00ff88', flexShrink: 0, marginTop: '2px' }} />
                                {s}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem 2rem',
                    background: 'rgba(5,8,22,0.4)',
                    borderRadius: '16px',
                    border: '1px dashed rgba(0,255,136,0.2)'
                }}>
                    <Lock size={48} style={{ color: 'rgba(0,255,136,0.3)', marginBottom: '1rem' }} />
                    <div style={{ 
                        color: 'rgba(203,213,225,0.5)', 
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: '1.1rem',
                        fontWeight: 500
                    }}>
                        Enter a password above to start analysis
                    </div>
                </div>
            )}
        </div>
    );
}
