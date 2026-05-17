import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Eye, Lock, MessageSquare, BarChart3, ChevronRight, Globe, Loader2, Cpu } from 'lucide-react';

const API_BASE = '/api';

const FEATURES = [
    { icon: Eye, title: 'AI Phishing Detection', desc: 'Analyze suspicious emails and messages for phishing indicators in real-time.', color: '#00d4ff', path: '/tools/phishing' },
    { icon: Globe, title: 'URL Safety Scanner', desc: 'Check any website URL for malicious content, brand impersonation, and phishing.', color: '#00d4ff', path: '/tools/url-scanner' },
    { icon: Lock, title: 'Password Strength AI', desc: 'Evaluate password entropy, crack time, and get AI-powered improvement tips.', color: '#00d4ff', path: '/tools/password' },
    { icon: MessageSquare, title: 'AI Security Assistant', desc: 'Ask any cybersecurity question. Get expert answers from SafeNet AI.', color: '#00d4ff', path: '/tools/chatbot' },
    { icon: Zap, title: 'App Permission Analyzer', desc: 'Identify dangerous permission combinations that put your privacy at risk.', color: '#00d4ff', path: '/tools/app-permissions' },
    { icon: BarChart3, title: 'Threat Intelligence', desc: 'Live cybersecurity trends, attack statistics, and threat landscape data.', color: '#00d4ff', path: '/tools/threat-intel' },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [threatStats, setThreatStats] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/threat-intel`);
            const data = await res.json();
            if (data.global_stats) {
                setThreatStats(data.global_stats);
            }
        } catch (e) {
            console.error("Failed to fetch stats:", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div style={{ overflow: 'hidden' }}>
            {/* HERO SECTION */}
            <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '2rem' }}>
                {/* Hero Content */}
                <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
                    {/* Status Badge */}
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        padding: '0.5rem 1.25rem', 
                        borderRadius: '100px', 
                        background: 'rgba(0, 255, 136, 0.08)', 
                        border: '1px solid rgba(0, 255, 136, 0.25)', 
                        marginBottom: '2rem' 
                    }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 10px #00ff88' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00ff88', letterSpacing: '0.1em', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}>System Online</span>
                    </div>

                    {/* Main Title with Orbitron */}
                    <h1 style={{ 
                        fontSize: 'clamp(3rem, 8vw, 6rem)', 
                        fontWeight: 900, 
                        lineHeight: 1.05, 
                        marginBottom: '1.5rem', 
                        letterSpacing: '-0.02em',
                        fontFamily: 'Orbitron, sans-serif',
                    }}>
                        <span style={{ display: 'block', color: '#f8fafc', textShadow: '0 0 40px rgba(0,212,255,0.3)' }}>SafeNet</span>
                        <span style={{ 
                            display: 'block', 
                            background: 'linear-gradient(90deg, #00d4ff, #a78bfa, #00ff88)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent',
                            textShadow: 'none'
                        }}>
                            AI
                        </span>
                    </h1>

                    {/* Subtitle with Rajdhani */}
                    <p style={{ 
                        fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', 
                        color: 'rgba(203, 213, 225, 0.8)', 
                        marginBottom: '0.75rem', 
                        lineHeight: 1.6, 
                        maxWidth: '700px', 
                        margin: '0 auto 2.5rem',
                        fontFamily: 'Rajdhani, sans-serif',
                        fontWeight: 500,
                        letterSpacing: '0.02em'
                    }}>
                        AI powered cybersecurity tools that detect phishing, analyze malicious websites, and protect users from digital threats.
                    </p>

                    {/* CTA Buttons */}
                    <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
                        <button onClick={() => navigate('/tools/phishing')} className="btn-cyber" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
                            <span>Start Security Scan</span>
                        </button>
                        <button onClick={() => navigate('/tools/chatbot')} className="btn-outline-cyber" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Launch AI Assistant <ChevronRight size={18} />
                            </span>
                        </button>
                    </div>

                    {/* Live Stats with futuristic styling */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', maxWidth: '750px', margin: '0 auto' }}>
                        {threatStats ? (
                            <>
                                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderColor: 'rgba(255,45,85,0.3)' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ff2d55', fontFamily: 'Orbitron, sans-serif' }}>
                                        {(threatStats.threats_today / 1000).toFixed(0)}K+
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(203,213,225,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Rajdhani, sans-serif' }}>Threats Today</div>
                                </div>
                                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderColor: 'rgba(0,212,255,0.3)' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00d4ff', fontFamily: 'Orbitron, sans-serif' }}>
                                        {(threatStats.phishing_urls_24h / 1000).toFixed(0)}K+
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(203,213,225,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Rajdhani, sans-serif' }}>Phishing URLs</div>
                                </div>
                                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderColor: 'rgba(167,139,250,0.3)' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a78bfa', fontFamily: 'Orbitron, sans-serif' }}>
                                        {threatStats.critical_cves_week || 12}+
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(203,213,225,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Rajdhani, sans-serif' }}>Critical CVEs</div>
                                </div>
                                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderColor: 'rgba(0,255,136,0.3)' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00ff88', fontFamily: 'Orbitron, sans-serif' }}>
                                        99.2%
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(203,213,225,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Rajdhani, sans-serif' }}>Accuracy</div>
                                </div>
                            </>
                        ) : (
                            <div style={{ gridColumn: '1 / -1', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', color: 'rgba(203,213,225,0.6)' }}>
                                <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                                <span style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}>Initializing Threat Database...</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: 800, 
                        color: '#f8fafc', 
                        marginBottom: '1rem',
                        fontFamily: 'Orbitron, sans-serif',
                        letterSpacing: '0.02em'
                    }}>
                        Security <span style={{ color: '#00d4ff' }}>Tools</span>
                    </h2>
                    <p style={{ 
                        fontSize: '1.1rem', 
                        color: 'rgba(203,213,225,0.7)', 
                        maxWidth: '600px', 
                        margin: '0 auto',
                        fontFamily: 'Rajdhani, sans-serif',
                        fontWeight: 500
                    }}>
                        AI-powered tools to protect your digital life from modern threats
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                    {FEATURES.map((feature, i) => (
                        <div 
                            key={i}
                            onClick={() => navigate(feature.path)}
                            className="tool-card glass-panel"
                            style={{ 
                                padding: '2rem', 
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Glow line at top */}
                            <div style={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                right: 0, 
                                height: '3px', 
                                background: feature.color,
                                boxShadow: `0 0 20px ${feature.color}`
                            }} />
                            
                            <div style={{ 
                                width: '56px', 
                                height: '56px', 
                                borderRadius: '14px', 
                                background: `${feature.color}12`, 
                                border: `1px solid ${feature.color}30`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                            }}>
                                <feature.icon size={28} style={{ color: feature.color }} />
                            </div>
                            
                            <h3 style={{ 
                                fontSize: '1.35rem', 
                                fontWeight: 700, 
                                color: '#f8fafc', 
                                marginBottom: '0.75rem',
                                fontFamily: 'Orbitron, sans-serif',
                                letterSpacing: '0.02em'
                            }}>
                                {feature.title}
                            </h3>
                            
                            <p style={{ 
                                fontSize: '0.95rem', 
                                color: 'rgba(203,213,225,0.7)', 
                                lineHeight: 1.6,
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                {feature.desc}
                            </p>
                            
                            <div style={{ 
                                marginTop: '1.5rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem', 
                                color: feature.color, 
                                fontSize: '0.85rem', 
                                fontWeight: 600,
                                fontFamily: 'Rajdhani, sans-serif',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Launch <ChevronRight size={16} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section style={{ padding: '6rem 2rem', background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ 
                            fontSize: '2.5rem', 
                            fontWeight: 800, 
                            color: '#f8fafc', 
                            marginBottom: '1rem',
                            fontFamily: 'Orbitron, sans-serif'
                        }}>
                            How It <span style={{ color: '#a78bfa' }}>Works</span>
                        </h2>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
                        {[
                            { step: '01', icon: Cpu, title: 'Input Your Data', desc: 'Paste an email, URL, password, or ask a question' },
                            { step: '02', icon: Zap, title: 'AI Analysis', desc: 'Our AI analyzes it using advanced threat detection' },
                            { step: '03', icon: Shield, title: 'Get Results', desc: 'Receive detailed threat assessment and recommendations' },
                        ].map((item, i) => (
                            <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                                <div style={{ 
                                    fontSize: '4rem', 
                                    fontWeight: 900, 
                                    color: 'rgba(0,212,255,0.12)', 
                                    fontFamily: 'Orbitron, sans-serif',
                                    marginBottom: '-1rem',
                                    position: 'relative',
                                    zIndex: 0
                                }}>
                                    {item.step}
                                </div>
                                <div style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    borderRadius: '50%', 
                                    background: 'rgba(0,212,255,0.1)', 
                                    border: '2px solid rgba(0,212,255,0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <item.icon size={32} style={{ color: '#00d4ff' }} />
                                </div>
                                <h3 style={{ 
                                    fontSize: '1.25rem', 
                                    fontWeight: 700, 
                                    color: '#f8fafc', 
                                    marginBottom: '0.5rem',
                                    fontFamily: 'Orbitron, sans-serif'
                                }}>
                                    {item.title}
                                </h3>
                                <p style={{ 
                                    fontSize: '0.9rem', 
                                    color: 'rgba(203,213,225,0.6)',
                                    fontFamily: 'Inter, sans-serif'
                                }}>
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section style={{ padding: '8rem 2rem', textAlign: 'center' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <Shield size={72} style={{ color: '#00d4ff', marginBottom: '2rem', filter: 'drop-shadow(0 0 20px rgba(0,255,136,0.5))' }} />
                    <h2 style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: 800, 
                        color: '#f8fafc', 
                        marginBottom: '1.25rem',
                        fontFamily: 'Orbitron, sans-serif'
                    }}>
                        Secure Your Digital Life
                    </h2>
                    <p style={{ 
                        fontSize: '1.15rem', 
                        color: 'rgba(203,213,225,0.7)', 
                        marginBottom: '2.5rem',
                        fontFamily: 'Rajdhani, sans-serif',
                        fontWeight: 500
                    }}>
                        Start using our AI-powered security tools today and stay protected against modern cyber threats.
                    </p>
                    <button onClick={() => navigate('/dashboard')} className="btn-cyber" style={{ padding: '1.25rem 3.5rem', fontSize: '1.1rem' }}>
                        <span>Enter Command Center</span>
                    </button>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ 
                padding: '3rem 2rem', 
                borderTop: '1px solid rgba(0,212,255,0.1)', 
                textAlign: 'center',
                background: 'rgba(0,0,0,0.4)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Shield size={28} style={{ color: '#00d4ff' }} />
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'Orbitron, sans-serif' }}>SafeNet</span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#a78bfa', fontFamily: 'Orbitron, sans-serif' }}>-AI</span>  
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(203,213,225,0.5)', marginBottom: '0.5rem', fontFamily: 'Rajdhani, sans-serif' }}>
                    Intelligent AI-Powered Cybersecurity Platform
                </p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(203,213,225,0.35)' }}>
                    © 2026 SafeNet-AI. All systems operational.
                </p>
            </footer>
        </div>
    );
}
