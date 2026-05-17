import { useState } from 'react';
import { Shield, Plus, X, Loader, AlertTriangle, CheckCircle, AppWindow, Activity, AlertOctagon } from 'lucide-react';

const API_BASE = '/api';

const COMMON_PERMISSIONS = [
    'Camera', 'Microphone', 'Location', 'Contacts', 'Storage',
    'Internet', 'Background', 'SMS', 'Accessibility', 'Overlay',
    'Device Admin', 'Read SMS', 'Call Log', 'Accounts', 'Biometric',
];

const RISK_COLORS = {
    CRITICAL: '#64b5f6',
    HIGH: '#64b5f6',
    MEDIUM: '#64b5f6',
    LOW: '#64b5f6',
    SAFE: '#64b5f6',
};

const SAMPLE_APPS = [
    { name: 'FlashLight Pro', perms: ['Camera', 'Microphone', 'Contacts', 'Internet', 'Location', 'Accessibility'] },
    { name: 'Weather App', perms: ['Location', 'Internet'] },
    { name: 'Random VPN App', perms: ['Internet', 'Read SMS', 'Contacts', 'Overlay', 'Device Admin', 'Background'] },
];

function AnalyzingAnimation() {
    return (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 1.5rem' }}>
                {/* Rotating rings */}
                {[0,1,2].map(i => (
                    <div key={i} style={{
                        position: 'absolute', inset: `${i * 15}px`,
                        borderRadius: '50%',
                        border: `2px solid rgba(255,179,71,${0.3 - i * 0.08})`,
                        borderBottomColor: 'transparent',
                        animation: `spin ${2 - i * 0.4}s linear infinite`,
                    }} />
                ))}
                {/* Center shield */}
                <div style={{ 
                    position: 'absolute', top: '50%', left: '50%', 
                    transform: 'translate(-50%,-50%)',
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: 'rgba(255,179,71,0.1)',
                    border: '2px solid rgba(255,179,71,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <AppWindow size={22} style={{ color: '#ffb347', filter: 'drop-shadow(0 0 8px rgba(255,179,71,0.5))' }} />
                </div>
            </div>
            <div style={{ 
                color: '#ffb347', 
                fontFamily: 'Orbitron, sans-serif', 
                fontSize: '1rem', 
                marginBottom: '0.75rem',
                letterSpacing: '0.1em',
                textShadow: '0 0 10px rgba(255,179,71,0.5)'
            }}>
                ANALYZING PERMISSIONS
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[0,1,2,3,4].map(i => (
                    <div key={i} style={{ 
                        width: '10px', height: '10px', borderRadius: '50%', 
                        background: '#ffb347',
                        animation: `pulse 1s ease-in-out ${i * 0.15}s infinite`,
                        boxShadow: '0 0 10px rgba(255,179,71,0.5)'
                    }} />
                ))}
            </div>
            <div style={{ 
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,179,71,0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(255,179,71,0.2)',
                display: 'inline-block'
            }}>
                <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'rgba(203,213,225,0.6)',
                    fontFamily: 'JetBrains Mono, monospace'
                }}>
                    Checking: dangerous combinations • privacy risks • permission abuse
                </div>
            </div>
        </div>
    );
}

export default function AppPermissionAnalyzer() {
    const [appName, setAppName] = useState('');
    const [permissions, setPermissions] = useState([]);
    const [customPerm, setCustomPerm] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const togglePerm = (perm) => {
        setPermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
    };

    const addCustom = () => {
        if (customPerm.trim() && !permissions.includes(customPerm.trim())) {
            setPermissions(prev => [...prev, customPerm.trim()]);
            setCustomPerm('');
        }
    };

    const loadSample = (sample) => {
        setAppName(sample.name);
        setPermissions(sample.perms);
        setResult(null);
    };

    const analyze = async () => {
        if (!appName.trim()) { setError('Please enter the app name.'); return; }
        if (permissions.length === 0) { setError('Please select at least one permission.'); return; }
        setLoading(true); setError(''); setResult(null);
        try {
            const res = await fetch(`${API_BASE}/app-permission-risk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ app_name: appName, permissions }),
            });
            setResult(await res.json());
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
                    background: 'rgba(0,212,255,0.08)', 
                    border: '1px solid rgba(0,212,255,0.2)', 
                    marginBottom: '1rem' 
                }}>
                    <AlertOctagon size={14} style={{ color: '#ffb347' }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffb347', letterSpacing: '0.1em', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}>
                        Privacy Analysis
                    </span>
                </div>
                
                <h1 style={{ 
                    fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc', 
                    marginBottom: '0.75rem', fontFamily: 'Orbitron, sans-serif',
                    letterSpacing: '0.02em'
                }}>
                    <span style={{ color: '#ffb347' }}>App Permission</span> Analyzer
                </h1>
                <p style={{ 
                    color: 'rgba(203,213,225,0.6)', 
                    fontSize: '1.1rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 500
                }}>
                    Detect dangerous permission combinations and privacy risks
                </p>
            </div>

            {/* Sample Apps */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(203,213,225,0.5)', fontFamily: 'Rajdhani, sans-serif' }}>Load sample:</span>
                {SAMPLE_APPS.map((s, i) => (
                    <button 
                        key={i} 
                        onClick={() => loadSample(s)} 
                        style={{ 
                            padding: '0.4rem 1rem', 
                            borderRadius: '8px', 
                            background: 'rgba(255,179,71,0.08)', 
                            border: '1px solid rgba(255,179,71,0.25)', 
                            color: '#ffb347', 
                            fontSize: '0.8rem', 
                            cursor: 'pointer', 
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {s.name}
                    </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="glass-panel" style={{ 
                padding: '1.5rem', 
                marginBottom: '1.5rem'
            }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 700, 
                        color: 'rgba(203,213,225,0.6)', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.08em', 
                        display: 'block', 
                        marginBottom: '0.5rem',
                        fontFamily: 'Rajdhani, sans-serif'
                    }}>
                        App Name
                    </label>
                    <input 
                        className="input-cyber" 
                        value={appName} 
                        onChange={e => setAppName(e.target.value)} 
                        placeholder="e.g. FlashLight Pro, Free VPN, Cleaner App..." 
                        style={{
                            padding: '0.875rem 1.25rem'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 700, 
                        color: 'rgba(203,213,225,0.6)', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.08em', 
                        display: 'block', 
                        marginBottom: '0.75rem',
                        fontFamily: 'Rajdhani, sans-serif'
                    }}>
                        Permissions ({permissions.length} selected)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                        {COMMON_PERMISSIONS.map(perm => (
                            <button
                                key={perm}
                                onClick={() => togglePerm(perm)}
                                style={{
                                    padding: '0.5rem 1rem', 
                                    borderRadius: '25px', 
                                    cursor: 'pointer', 
                                    fontSize: '0.8rem', 
                                    fontWeight: 600, 
                                    transition: 'all 0.2s',
                                    background: permissions.includes(perm) ? 'rgba(255,179,71,0.2)' : 'rgba(255,255,255,0.04)',
                                    border: permissions.includes(perm) ? '1px solid rgba(255,179,71,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                    color: permissions.includes(perm) ? '#ffb347' : 'rgba(203,213,225,0.6)',
                                    boxShadow: permissions.includes(perm) ? '0 0 12px rgba(255,179,71,0.2)' : 'none',
                                }}
                            >
                                {perm}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <input 
                            className="input-cyber" 
                            value={customPerm} 
                            onChange={e => setCustomPerm(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && addCustom()} 
                            placeholder="Add custom permission..." 
                            style={{ flex: 1 }} 
                        />
                        <button 
                            onClick={addCustom} 
                            style={{ 
                                padding: '0.75rem 1.25rem', 
                                borderRadius: '10px', 
                                background: 'rgba(255,179,71,0.15)', 
                                border: '1px solid rgba(255,179,71,0.3)', 
                                color: '#ffb347', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    {permissions.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                            {permissions.map(p => (
                                <span 
                                    key={p} 
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.375rem', 
                                        padding: '0.375rem 0.75rem', 
                                        borderRadius: '6px', 
                                        background: 'rgba(255,179,71,0.12)', 
                                        border: '1px solid rgba(255,179,71,0.3)', 
                                        fontSize: '0.8rem', 
                                        color: '#ffb347',
                                        fontFamily: 'Rajdhani, sans-serif',
                                        fontWeight: 600
                                    }}
                                >
                                    {p}
                                    <button 
                                        onClick={() => togglePerm(p)} 
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            cursor: 'pointer', 
                                            color: '#ffb347', 
                                            padding: 0, 
                                            display: 'flex',
                                            opacity: 0.7
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <button 
                    onClick={analyze} 
                    disabled={loading}
                    className="btn-cyber"
                    style={{ 
                        background: 'linear-gradient(135deg, #ffb347, #ff5c8e)',
                        padding: '1rem 2rem',
                        width: '100%'
                    }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        {loading ? <Loader size={18} className="animate-spin" /> : <Shield size={18} />}
                        {loading ? 'Analyzing...' : 'Analyze Permission Risk'}
                    </span>
                </button>
            </div>

            {error && (
                <div style={{ 
                    padding: '0.875rem', 
                    borderRadius: '10px', 
                    background: 'rgba(255,45,85,0.1)', 
                    border: '1px solid rgba(255,45,85,0.3)', 
                    color: '#ff2d55', 
                    fontSize: '0.9rem', 
                    marginBottom: '1rem' 
                }}>
                    ⚠ {error}
                </div>
            )}

            {/* Results */}
            {loading ? (
                <div style={{ 
                    background: 'rgba(30, 41, 59, 0.3)',
                    borderRadius: '16px'
                }}>
                    <AnalyzingAnimation />
                </div>
            ) : result && (
                <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                    {/* Risk Score */}
                    <div style={{ 
                        padding: '1.5rem', 
                        borderRadius: '14px', 
                        background: `${RISK_COLORS[result.risk_level]}10`, 
                        border: `1px solid ${RISK_COLORS[result.risk_level]}40`, 
                        marginBottom: '1.5rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        flexWrap: 'wrap', 
                        gap: '1rem',
                        boxShadow: `0 0 30px ${RISK_COLORS[result.risk_level]}15`
                    }}>
                        <div>
                            <div style={{ 
                                fontSize: '0.7rem', 
                                color: RISK_COLORS[result.risk_level], 
                                fontWeight: 700, 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.1em', 
                                marginBottom: '0.25rem',
                                fontFamily: 'Rajdhani, sans-serif'
                            }}>
                                Privacy Risk Level
                            </div>
                            <div style={{ 
                                fontSize: '1.75rem', 
                                fontWeight: 900, 
                                color: RISK_COLORS[result.risk_level],
                                fontFamily: 'Orbitron, sans-serif'
                            }}>
                                {result.risk_level}
                            </div>
                            <div style={{ 
                                fontSize: '0.85rem', 
                                color: 'rgba(203,213,225,0.5)', 
                                marginTop: '0.25rem' 
                            }}>
                                {result.app_name} • {result.total_permissions} permissions
                            </div>
                        </div>
                        <div style={{ 
                            fontSize: '3.5rem', 
                            fontWeight: 900, 
                            color: RISK_COLORS[result.risk_level], 
                            fontFamily: 'Orbitron, sans-serif',
                            textShadow: `0 0 20px ${RISK_COLORS[result.risk_level]}`
                        }}>
                            {result.privacy_risk_score}<span style={{ fontSize: '1.25rem', color: 'rgba(203,213,225,0.3)' }}>/100</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ 
                        padding: '1.25rem', 
                        borderRadius: '12px', 
                        background: 'rgba(30, 41, 59, 0.4)', 
                        marginBottom: '1.5rem' 
                    }}>
                        <div style={{ 
                            fontSize: '0.75rem', 
                            color: 'rgba(203,213,225,0.5)', 
                            marginBottom: '0.5rem',
                            fontFamily: 'Rajdhani, sans-serif'
                        }}>
                            Risk Score
                        </div>
                        <div style={{ height: '10px', borderRadius: '5px', background: 'rgba(255,255,255,0.05)' }}>
                            <div style={{ 
                                height: '100%', 
                                borderRadius: '5px', 
                                width: `${result.privacy_risk_score}%`, 
                                background: `linear-gradient(90deg, #86efac, #fce38a, #ffb347, #ff5c8e)`, 
                                transition: 'width 1.5s ease', 
                                boxShadow: `0 0 15px ${RISK_COLORS[result.risk_level]}60` 
                            }} />
                        </div>
                    </div>

                    {/* Dangerous Combos */}
                    {result.dangerous_combinations?.length > 0 && (
                        <div style={{ 
                            padding: '1.25rem', 
                            borderRadius: '12px', 
                            background: 'rgba(255,45,85,0.08)', 
                            border: '1px solid rgba(255,45,85,0.25)', 
                            marginBottom: '1.5rem' 
                        }}>
                            <div style={{ 
                                fontSize: '0.8rem', 
                                fontWeight: 700, 
                                color: '#ff2d55', 
                                marginBottom: '1rem', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.1em',
                                fontFamily: 'Rajdhani, sans-serif',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <AlertOctagon size={16} /> Dangerous Combinations
                            </div>
                            {result.dangerous_combinations.map((combo, i) => (
                                <div 
                                    key={i} 
                                    style={{ 
                                        padding: '1rem', 
                                        borderRadius: '10px', 
                                        background: 'rgba(255,45,85,0.05)', 
                                        border: `1px solid ${RISK_COLORS[combo.risk_level]}30`, 
                                        marginBottom: '0.5rem' 
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 700, color: RISK_COLORS[combo.risk_level], fontSize: '0.9rem' }}>{combo.threat_name}</span>
                                        <span style={{ 
                                            fontSize: '0.7rem', 
                                            fontWeight: 700, 
                                            padding: '0.25rem 0.625rem', 
                                            borderRadius: '4px', 
                                            background: `${RISK_COLORS[combo.risk_level]}20`, 
                                            color: RISK_COLORS[combo.risk_level] 
                                        }}>
                                            {combo.risk_level}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>{combo.description}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(203,213,225,0.5)', marginTop: '0.5rem' }}>
                                        <span style={{ color: '#ffb347' }}>▸</span> Combo: {combo.combination.join(' + ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Individual Permission Risks */}
                    <div style={{ 
                        padding: '1.25rem', 
                        borderRadius: '12px', 
                        background: 'rgba(30, 41, 59, 0.4)', 
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
                            <Activity size={16} /> Permission Risk Breakdown
                        </div>
                        {result.individual_permission_risks?.map((item, i) => {
                            const riskPct = Math.min((item.risk / 40) * 100, 100);
                            const riskColor = item.risk >= 30 ? '#ff5c8e' : item.risk >= 20 ? '#ffb347' : item.risk >= 10 ? '#fce38a' : '#86efac';
                            return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                    <div style={{ width: '120px', fontSize: '0.85rem', color: '#e2e8f0', flexShrink: 0, fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>{item.permission}</div>
                                    <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>
                                        <div style={{ 
                                            height: '100%', 
                                            width: `${riskPct}%`, 
                                            borderRadius: '4px', 
                                            background: riskColor, 
                                            boxShadow: `0 0 8px ${riskColor}80`, 
                                            transition: 'width 1s ease' 
                                        }} />
                                    </div>
                                    <div style={{ width: '40px', fontSize: '0.8rem', color: riskColor, fontWeight: 700, textAlign: 'right' }}>{item.risk}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recommendations */}
                    {result.recommendations?.length > 0 && (
                        <div style={{ 
                            padding: '1.25rem', 
                            borderRadius: '12px', 
                            background: 'rgba(0,255,136,0.06)', 
                            border: '1px solid rgba(0,255,136,0.15)' 
                        }}>
                            <div style={{ 
                                fontSize: '0.8rem', 
                                fontWeight: 700, 
                                color: '#00ff88', 
                                marginBottom: '1rem', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.1em',
                                fontFamily: 'Rajdhani, sans-serif',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <CheckCircle size={16} /> Recommendations
                            </div>
                            {result.recommendations.map((rec, i) => (
                                <div key={i} style={{ 
                                    display: 'flex', 
                                    gap: '0.75rem', 
                                    marginBottom: '0.5rem', 
                                    fontSize: '0.9rem', 
                                    color: '#e2e8f0' 
                                }}>
                                    <CheckCircle size={16} style={{ color: '#00ff88', flexShrink: 0, marginTop: '2px' }} />
                                    {rec}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
