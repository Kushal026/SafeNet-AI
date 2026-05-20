import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Globe, Lock, MessageSquare, Activity, ChevronRight, Loader2, Cpu, Zap } from 'lucide-react';
import { get } from '../utils/api';

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
            ];

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [backendStatus, setBackendStatus] = useState('unknown');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const health = await get('/health');
                setBackendStatus(health?.status || 'unknown');
            } catch (e) {
                console.error("Failed to fetch backend health:", e);
                setBackendStatus('unreachable');
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                
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

            {/* Live Alerts removed */}
        </div>
    );
}
