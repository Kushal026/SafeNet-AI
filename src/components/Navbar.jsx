import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, Zap } from 'lucide-react';

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const links = [
        { label: 'Home', path: '/' },
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'AI Chat', path: '/tools/chatbot' },
    ];

    const handleLinkClick = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    return (
        <nav style={{ background: 'rgba(2,4,8,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,212,255,0.12)', position: 'sticky', top: 0, zIndex: 100 }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: '64px', justifyContent: 'space-between' }}>
                 {/* Logo */}
                 <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                     <div style={{ position: 'relative', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <div style={{ position: 'absolute', inset: 0, borderRadius: '8px', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', opacity: 0.2 }} />
                         <Shield size={22} style={{ color: '#00d4ff', position: 'relative', zIndex: 1 }} />
                     </div>
                     <div>
                         <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc' }}>SafeNet</span>
                         <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#a78bfa' }}>-AI</span>
                     </div>
                 </Link>

                {/* Desktop Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-links">
                    {links.map(l => (
                        <Link key={l.path} to={l.path} style={{
                            padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
                            color: location.pathname === l.path ? '#00d4ff' : 'rgba(148,163,184,0.8)',
                            background: location.pathname === l.path ? 'rgba(0,212,255,0.08)' : 'transparent',
                            transition: 'all 0.2s'
                        }}>{l.label}</Link>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem', borderRadius: '6px', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.3s' }}
                    >
                        <Zap size={14} />
                        <span>Security Scan</span>
                    </button>
                    <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }} className="mobile-menu-btn">
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div style={{ background: 'rgba(13,17,23,0.98)', borderTop: '1px solid rgba(0,212,255,0.1)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {links.map(l => (
                        <button key={l.path} onClick={() => handleLinkClick(l.path)} style={{
                            padding: '0.75rem 1rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.875rem',
                            color: location.pathname === l.path ? '#00d4ff' : '#94a3b8',
                            background: location.pathname === l.path ? 'rgba(0,212,255,0.08)' : 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                        }}>{l.label}</button>
                    ))}
                </div>
            )}
        </nav>
    );
}
