import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Shield, Loader, ChevronDown } from 'lucide-react';

const API_BASE = '/api';

const QUICK_QUESTIONS = [
    'How do I spot a phishing email?',
    'Is public WiFi safe?',
    'How to secure my accounts?',
];

function MarkdownText({ text }) {
    if (!text) return null;
    const lines = text.split('\n');
    return (
        <div style={{ fontSize: '0.82rem', lineHeight: 1.7, color: '#e2e8f0' }}>
            {lines.map((line, i) => {
                const parts = line.split(/\*\*(.*?)\*\*/g);
                const rendered = parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: '#f1f5f9' }}>{p}</strong> : p);
                if (line.startsWith('# ')) return <div key={i} style={{ fontWeight: 800, color: '#f1f5f9', marginBottom: '0.25rem' }}>{line.slice(2)}</div>;
                if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.15rem' }}><span style={{ color: '#00ff88' }}>•</span><span>{rendered.slice(1)}</span></div>;
                if (line.trim() === '') return <div key={i} style={{ height: '0.375rem' }} />;
                return <div key={i}>{rendered}</div>;
            })}
        </div>
    );
}

export default function FloatingAssistant({ isOpen, setIsOpen }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I\'m **SafeNet Assistant**. Ask me any cybersecurity question!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const send = async (msg) => {
        const message = msg || input.trim();
        if (!message || loading) return;
        setInput('');
        const newMessages = [...messages, { role: 'user', content: message }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/chat-assistant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history: newMessages.slice(-6) }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'Sorry, an error occurred.' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: '⚠ Backend not connected. Start the FastAPI server.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* FAB Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000,
                    width: '58px', height: '58px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 25px rgba(124,58,237,0.5), 0 4px 20px rgba(0,0,0,0.4)',
                    transition: 'all 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 35px rgba(124,58,237,0.7)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(124,58,237,0.5)'; }}
            >
                {isOpen ? <ChevronDown size={22} color="white" /> : <MessageSquare size={22} color="white" />}
                {/* Pulse ring */}
                {!isOpen && <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', border: '2px solid rgba(124,58,237,0.4)', animation: 'pulse-ring 2s infinite' }} />}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div style={{
                    position: 'fixed', bottom: '5.5rem', right: '2rem', zIndex: 999,
                    width: '360px', height: '520px',
                    borderRadius: '20px', overflow: 'hidden',
                    background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(124,58,237,0.3)',
                    boxShadow: '0 0 40px rgba(124,58,237,0.2), 0 20px 60px rgba(0,0,0,0.6)',
                    display: 'flex', flexDirection: 'column',
                    animation: 'fadeInUp 0.3s ease-out',
                }}>
                    {/* Header */}
                    <div style={{ padding: '1rem 1.25rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(167,139,250,0.1))', borderBottom: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(124,58,237,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Shield size={16} style={{ color: '#a78bfa' }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f1f5f9' }}>SafeNet Assistant</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ff88', animation: 'pulse 2s infinite' }} />
                                    <span style={{ fontSize: '0.68rem', color: '#00ff88' }}>Online</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem' }}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Quick Questions */}
                    <div style={{ padding: '0.625rem 0.875rem', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {QUICK_QUESTIONS.map((q, i) => (
                            <button key={i} onClick={() => send(q)} style={{ padding: '0.2rem 0.625rem', borderRadius: '20px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa', fontSize: '0.68rem', cursor: 'pointer' }}>
                                {q}
                            </button>
                        ))}
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '88%', padding: '0.625rem 0.875rem', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                    background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))' : 'rgba(22,27,34,0.8)',
                                    border: msg.role === 'user' ? '1px solid rgba(0,212,255,0.2)' : '1px solid rgba(124,58,237,0.15)',
                                }}>
                                    {msg.role === 'assistant' ? <MarkdownText text={msg.content} /> : <span style={{ fontSize: '0.82rem', color: '#f1f5f9' }}>{msg.content}</span>}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', gap: '6px', padding: '0.625rem 0.875rem' }}>
                                {[0,1,2].map(i => <div key={i} className="loading-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#a78bfa' }} />)}
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div style={{ padding: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '0.5rem' }}>
                        <input
                            className="input-cyber"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && send()}
                            placeholder="Ask about cybersecurity..."
                            style={{ flex: 1, padding: '0.625rem 0.75rem', fontSize: '0.82rem' }}
                        />
                        <button onClick={() => send()} disabled={loading || !input.trim()} style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', background: loading || !input.trim() ? 'rgba(124,58,237,0.1)' : 'linear-gradient(135deg, #7c3aed, #a78bfa)', border: 'none', color: 'white', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
                            {loading ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
