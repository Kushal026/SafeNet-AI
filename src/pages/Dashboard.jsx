import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Globe, Shield, Lock, MessageSquare, BarChart3, Activity, ChevronRight, AlertOctagon, Loader2, Radio, Cpu, Wifi, Zap } from 'lucide-react';

const API_BASE = '/api';

const TOOLS = [
    {
        id: 1, icon: Eye, title: 'Phishing Detector', desc: 'Analyze emails for phishing indicators and social engineering.',
        color: '#64b5f6', tag: 'Email', path: '/tools/phishing',
    },
    {
        id: 2, icon: Globe, title: 'URL Scanner', desc: 'Check URLs for malware and brand impersonation.',
        color: '#64b5f6', tag: 'Web', path: '/tools/url-scanner',
    },
    {
        id: 3, icon: Shield, title: 'App Permissions', desc: 'Detect risky permission combinations in apps.',
        color: '#64b5f6', tag: 'Mobile', path: '/tools/app-permissions',
    },
    {
        id: 4, icon: Lock, title: 'Password Analyzer', desc: 'Evaluate password strength and breach status.',
        color: '#64b5f6', tag: 'Auth', path: '/tools/password',
    },
    {
        id: 5, icon: MessageSquare, title: 'AI Assistant', desc: 'Ask cybersecurity questions to our AI.',
        color: '#64b5f6', tag: 'AI', path: '/tools/chatbot',
    },
    {
        id: 6, icon: Activity, title: 'Cyber Risk Score', desc: 'Assess your personal security posture.',
        color: '#64b5f6', tag: 'Risk', path: '/tools/risk-score',
    },
    {
        id: 7, icon: BarChart3, title: 'Threat Intel', desc: 'Monitor global cyber threats and trends.',
        color: '#64b5f6', tag: 'Intel', path: '/tools/threat-intel',
    },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [threatData, setThreatData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_BASE}/threat-intel`);
                const data = await res.json();
                setThreatData(data);
            } catch (e) {
                console.error("Failed to fetch threat data:", e);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const alerts = threatData?.live_alerts || [];
    const globalStats = threatData?.global_stats || {};

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Radio size={16} style={{ color: '#00ff88', animation: 'pulse 2s infinite' }} />
                    <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        letterSpacing: '0.15em', 
                        color: '#00ff88', 
                        textTransform: 'uppercase',
                        fontFamily: 'Rajdhani, sans-serif'
                    }}>Command Center Online</span>
                </div>
                <h1 style={{ 
                    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', 
                    fontWeight: 800, 
                    color: '#f8fafc', 
                    lineHeight: 1.2,
                    fontFamily: 'Orbitron, sans-serif',
                    letterSpacing: '0.02em'
                }}>
                    Security <span style={{ background: 'linear-gradient(90deg, #00d4ff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span>
                </h1>
                <p style={{ color: 'rgba(203,213,225,0.6)', marginTop: '0.5rem', fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem', fontWeight: 500 }}>
                    Select a module to begin security analysis
                </p>
            </div>

            {/* Status Bar */}
            <div className="glass-panel" style={{ 
                padding: '1rem 1.5rem', 
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                border: '1px solid rgba(0,255,136,0.15)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Wifi size={18} style={{ color: '#00ff88' }} />
                    <span style={{ color: '#f8fafc', fontWeight: 600, fontFamily: 'Rajdhani, sans-serif' }}>System Status:</span>
                    <span style={{ color: '#00ff88', fontFamily: 'Rajdhani, sans-serif', fontWeight: 500 }}>ALL SYSTEMS OPERATIONAL</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(203,213,225,0.6)', fontSize: '0.85rem', fontFamily: 'JetBrains Mono, monospace' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 10px rgba(0,255,136,0.5)' }} />
                    LIVE THREAT FEED
                </div>
            </div>

            {/* Live Stats Banner */}
            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(203,213,225,0.5)', marginBottom: '2rem' }}>
                    <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                </div>
            ) : globalStats.threats_today ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(255,45,85,0.3)', boxShadow: '0 0 20px rgba(255,45,85,0.1)' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ff2d55', fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(255,45,85,0.3)' }}>
                            {(globalStats.threats_today / 1000).toFixed(1)}K
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(203,213,225,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Rajdhani, sans-serif' }}>Threats Today</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(0,212,255,0.3)', boxShadow: '0 0 20px rgba(0,212,255,0.1)' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#00d4ff', fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0,212,255,0.3)' }}>
                            {(globalStats.phishing_urls_24h / 1000).toFixed(1)}K
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(203,213,225,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Rajdhani, sans-serif' }}>Phishing URLs</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(167,139,250,0.3)', boxShadow: '0 0 20px rgba(167,139,250,0.1)' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a78bfa', fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(167,139,250,0.3)' }}>
                            {globalStats.critical_cves_week || '12+'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(203,213,225,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Rajdhani, sans-serif' }}>Critical CVEs</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(0,255,136,0.3)', boxShadow: '0 0 20px rgba(0,255,136,0.1)' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#00ff88', fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0,255,136,0.3)' }}>
                            {globalStats.active_campaigns}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(203,213,225,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Rajdhani, sans-serif' }}>Active Campaigns</div>
                    </div>
                </div>
            ) : null}

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {/* Tool Cards Grid */}
                <div>
                    <h2 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 700, 
                        color: 'rgba(203,213,225,0.8)', 
                        marginBottom: '1rem',
                        fontFamily: 'Rajdhani, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Cpu size={18} style={{ color: '#00d4ff' }} />
                        Security Modules
                    </h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {TOOLS.map((tool) => (
                            <div
                                key={tool.id}
                                onClick={() => navigate(tool.path)}
                                className="tool-card"
                                style={{
                                    padding: '1.5rem', 
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    background: 'rgba(5,8,22,0.6)',
                                    backdropFilter: 'blur(16px)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = `${tool.color}40`;
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = `0 8px 30px ${tool.color}20, 0 0 0 1px ${tool.color}20`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {/* Glow effect */}
                                <div style={{ 
                                    position: 'absolute', 
                                    top: 0, 
                                    left: 0, 
                                    width: '100%', 
                                    height: '100%',
                                    background: `radial-gradient(circle at 50% 0%, ${tool.color}08 0%, transparent 70%)`,
                                    pointerEvents: 'none'
                                }} />
                                
                                {/* Accent line */}
                                <div style={{ 
                                    position: 'absolute', 
                                    top: 0, 
                                    left: 0, 
                                    width: '4px', 
                                    height: '100%', 
                                    background: tool.color,
                                    boxShadow: `0 0 20px ${tool.color}`
                                }} />
                                
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                                    <div style={{ 
                                        width: '52px', 
                                        height: '52px', 
                                        borderRadius: '14px', 
                                        background: `${tool.color}12`, 
                                        border: `1px solid ${tool.color}25`,
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        boxShadow: `0 0 20px ${tool.color}15`
                                    }}>
                                        <tool.icon size={26} style={{ color: tool.color }} />
                                    </div>
                                    <span style={{ 
                                        fontSize: '0.65rem', 
                                        fontWeight: 700, 
                                        padding: '0.35rem 0.75rem', 
                                        borderRadius: '6px', 
                                        background: `${tool.color}12`, 
                                        color: tool.color,
                                        fontFamily: 'Rajdhani, sans-serif',
                                        textTransform: 'uppercase', 
                                        letterSpacing: '0.05em' 
                                    }}>
                                        {tool.tag}
                                    </span>
                                </div>
                                
                                <h3 style={{ 
                                    fontSize: '1rem', 
                                    fontWeight: 700, 
                                    color: '#f8fafc', 
                                    marginBottom: '0.5rem',
                                    fontFamily: 'Orbitron, sans-serif',
                                    letterSpacing: '0.02em'
                                }}>
                                    {tool.title}
                                </h3>
                                
                                <p style={{ 
                                    fontSize: '0.85rem', 
                                    color: 'rgba(203,213,225,0.6)', 
                                    lineHeight: 1.5, 
                                    marginBottom: '1rem',
                                    fontFamily: 'Inter, sans-serif'
                                }}>
                                    {tool.desc}
                                </p>
                                
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.4rem', 
                                    color: tool.color, 
                                    fontSize: '0.8rem', 
                                    fontWeight: 600,
                                    fontFamily: 'Rajdhani, sans-serif',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    <Zap size={14} /> Initialize <ChevronRight size={16} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Live Alerts Section */}
            {alerts.length > 0 && (
                <div style={{ marginTop: '2.5rem' }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        marginBottom: '1rem',
                        fontFamily: 'Rajdhani, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}>
                        <AlertOctagon size={18} style={{ color: '#ff2d55' }} />
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Live Threat Feed</h2>
                    </div>
                    
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {alerts.slice(0, 4).map((alert, i) => (
                            <div 
                                key={i} 
                                className="glass-panel"
                                style={{ 
                                    padding: '1rem 1.25rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1rem',
                                    borderColor: alert.severity === 'CRITICAL' ? 'rgba(255,45,85,0.3)' : 'rgba(255,149,0,0.2)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ 
                                    width: '10px', 
                                    height: '10px', 
                                    borderRadius: '50%',
                                    background: alert.severity === 'CRITICAL' ? '#ff2d55' : 
                                                alert.severity === 'HIGH' ? '#ff9500' : 
                                                alert.severity === 'MEDIUM' ? '#ffd60a' : '#00d4ff',
                                    boxShadow: `0 0 15px ${alert.severity === 'CRITICAL' ? '#ff2d55' : alert.severity === 'HIGH' ? '#ff9500' : '#ffd60a'}`,
                                    flexShrink: 0,
                                    animation: alert.severity === 'CRITICAL' ? 'pulse 2s infinite' : 'none'
                                }} />
                                
                                <div style={{ flex: 1 }}>
                                    <div style={{ 
                                        fontSize: '0.95rem', 
                                        fontWeight: 600, 
                                        color: '#f8fafc', 
                                        marginBottom: '0.2rem',
                                        fontFamily: 'Inter, sans-serif'
                                    }}>
                                        {alert.title}
                                    </div>
                                    <div style={{ 
                                        fontSize: '0.75rem', 
                                        color: 'rgba(203,213,225,0.5)',
                                        fontFamily: 'JetBrains Mono, monospace'
                                    }}>
                                        {alert.source} • {alert.region} • {alert.time}
                                    </div>
                                </div>
                                
                                <span style={{ 
                                    fontSize: '0.65rem', 
                                    fontWeight: 700, 
                                    padding: '0.25rem 0.6rem', 
                                    borderRadius: '4px', 
                                    background: alert.severity === 'CRITICAL' ? 'rgba(255,45,85,0.15)' : 
                                                alert.severity === 'HIGH' ? 'rgba(255,149,0,0.15)' : 
                                                'rgba(255,214,10,0.15)',
                                    color: alert.severity === 'CRITICAL' ? '#ff2d55' : 
                                           alert.severity === 'HIGH' ? '#ff9500' : '#ffd60a',
                                    fontFamily: 'Rajdhani, sans-serif',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    flexShrink: 0
                                }}>
                                    {alert.severity}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
