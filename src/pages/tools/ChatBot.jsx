import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader, Shield, RefreshCw, Bot, Sparkles } from 'lucide-react';

const API_BASE = '/api';

const QUICK_PROMPTS = [
    { text: 'Is this email phishing?', icon: '🎣' },
    { text: 'Is public WiFi safe?', icon: '📶' },
    { text: 'Create strong password', icon: '🔐' },
    { text: 'What is 2FA?', icon: '🔒' },
    { text: 'Phone malware signs?', icon: '📱' },
    { text: 'Do I need a VPN?', icon: '🌐' },
];

function MarkdownText({ text }) {
    const lines = text.split('\n');
    return (
        <div style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#e2e8f0' }}>
            {lines.map((line, i) => {
                const parts = line.split(/\*\*(.*?)\*\*/g);
                const rendered = parts.map((part, j) => 
                    j % 2 === 1 ? <strong key={j} style={{ color: '#f1f5f9', fontWeight: 700 }}>{part}</strong> : part
                );
                
                if (line.startsWith('# ')) return <h3 key={i} style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', margin: '1rem 0 0.5rem', fontFamily: 'Orbitron, sans-serif' }}>{line.slice(2)}</h3>;
                if (line.startsWith('## ')) return <h4 key={i} style={{ fontSize: '0.95rem', fontWeight: 700, color: '#00d4ff', margin: '0.75rem 0 0.25rem', fontFamily: 'Rajdhani, sans-serif' }}>{line.slice(3)}</h4>;
                if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem', paddingLeft: '0.25rem' }}><span style={{ color: '#00ff88', flexShrink: 0 }}>▸</span><span>{rendered.slice(1)}</span></div>;
                if (line.startsWith('✅')) return <div key={i} style={{ marginBottom: '0.35rem', color: '#00ff88' }}>{rendered}</div>;
                if (line.startsWith('⚠')) return <div key={i} style={{ marginBottom: '0.35rem', color: '#ff9500' }}>{rendered}</div>;
                if (line.startsWith('❌')) return <div key={i} style={{ marginBottom: '0.35rem', color: '#ff2d55' }}>{rendered}</div>;
                if (line.trim() === '') return <div key={i} style={{ height: '0.75rem' }} />;
                return <div key={i} style={{ marginBottom: '0.2rem' }}>{rendered}</div>;
            })}
        </div>
    );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(100,181,246,0.15)', border: '1px solid rgba(100,181,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Bot size={16} style={{ color: '#64b5f6' }} />
      </div>
      <div style={{ padding: '0.875rem 1.25rem', borderRadius: '16px 16px 16px 4px', background: 'rgba(22,27,34,0.8)', border: '1px solid rgba(100,181,246,0.2)', display: 'flex', gap: '6px', alignItems: 'center' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ 
            width: '8px', height: '8px', borderRadius: '50%', 
            background: '#64b5f6',
            animation: `pulse 1.2s ease-in-out ${i * 0.15}s infinite`
          }} />
        ))}
      </div>
    </div>
  );
}

export default function ChatBot() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '## Welcome to SafeNet Assistant! 🛡️\n\nYour AI cybersecurity advisor is ready to help. Ask me about:\n\n- **Phishing detection** - Is that email safe?\n- **Password security** - How strong is your password?\n- **Safe browsing** - Is this website trustworthy?\n- **Malware protection** - Is your device secure?\n- **Privacy tips** - How to stay safe online\n\nWhat would you like to know?',
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async (message) => {
        const msg = message || input.trim();
        if (!msg || loading) return;
        setInput('');
        const newMessages = [...messages, { role: 'user', content: msg }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/chat-assistant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msg,
                    history: newMessages.slice(-8).map(m => ({ role: m.role, content: m.content })),
                }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response || data.error || 'Sorry, I encountered an error.' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: '⚠ **Backend not connected.** Please start the FastAPI server on port 8000.' }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => setMessages([messages[0]]);

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                padding: '1.25rem',
                borderRadius: '16px',
                background: 'rgba(0,212,255,0.08)',
                border: '1px solid rgba(0,212,255,0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                        width: '56px', height: '56px', borderRadius: '14px', 
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(167,139,250,0.1))', 
                        border: '1px solid rgba(124,58,237,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(124,58,237,0.2)'
                    }}>
                        <Bot size={28} style={{ color: '#64b5f6' }} />
                    </div>
                    <div>
                        <h1 style={{ 
                            fontSize: '1.75rem', 
                            fontWeight: 900, 
                            color: '#f1f5f9',
                            fontFamily: 'Orbitron, sans-serif',
                            marginBottom: '0.25rem'
                        }}>
                            SafeNet <span style={{ color: '#a78bfa' }}>Assistant</span>
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '8px', height: '8px', borderRadius: '50%',
                                background: '#64b5f6',
                                boxShadow: '0 0 10px rgba(100,181,246,0.5)',
                                animation: 'pulse 2s infinite'
                            }} />
                            <span style={{ fontSize: '0.8rem', color: '#00ff88', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>
                                Online • AI Cybersecurity Expert
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={clearChat}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1rem',
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#64b5f6',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <RefreshCw size={14} /> 
                    Clear Chat
                </button>
            </div>

            {/* Quick Prompts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                        key={i}
                        onClick={() => send(prompt.text)}
                        disabled={loading}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '25px',
                            background: 'rgba(100,181,246,0.1)',
                            border: '1px solid rgba(100,181,246,0.25)',
                            color: '#64b5f6',
                            fontSize: '0.8rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontFamily: 'Rajdhani, sans-serif',
                            fontWeight: 600
                        }}
                    >
                        <span>{prompt.icon}</span> {prompt.text}
                    </button>
                ))}
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.25rem',
                borderRadius: '16px',
                background: 'rgba(13,17,23,0.7)',
                border: '1px solid rgba(100,181,246,0.12)',
                backdropFilter: 'blur(16px)',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            animation: 'fadeInUp 0.3s ease-out',
                            alignItems: 'flex-start'
                        }}
                    >
                        {msg.role === 'assistant' && (
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: 'rgba(100,181,246,0.15)',
                                border: '1px solid rgba(100,181,246,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '0.75rem',
                                flexShrink: 0,
                                marginTop: '0.25rem'
                            }}>
                                <Bot size={16} style={{ color: '#64b5f6' }} />
                            </div>
                        )}
                        <div style={{
                            maxWidth: '80%',
                            padding: '1rem 1.25rem',
                            borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: msg.role === 'user'
                                ? 'linear-gradient(135deg, rgba(100,181,246,0.25), rgba(0,212,255,0.15))'
                                : 'rgba(22,27,34,0.8)',
                border: msg.role === 'user'
                    ? '1px solid rgba(0,212,255,0.3)'
                    : '1px solid rgba(0,212,255,0.15)',
                            boxShadow: msg.role === 'user'
                                ? '0 4px 20px rgba(100,181,246,0.15)'
                                : 'none'
                        }}>
                            {msg.role === 'assistant' ? <MarkdownText text={msg.content} /> : (
                                <span style={{ fontSize: '0.9rem', color: '#f1f5f9', lineHeight: 1.6 }}>{msg.content}</span>
                            )}
                        </div>
                    </div>
                ))}

                {loading && <TypingIndicator />}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '16px',
                background: 'rgba(13,17,23,0.7)',
                border: '1px solid rgba(100,181,246,0.15)'
            }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                    placeholder="Ask about cybersecurity, phishing, passwords..."
                    style={{
                        flex: 1,
                        padding: '0.875rem 1.25rem',
                        borderRadius: '12px',
                        background: 'rgba(2,4,8,0.6)',
                        border: '1px solid rgba(100,181,246,0.3)',
                        color: '#e2e8f0',
                        fontSize: '0.95rem',
                        fontFamily: 'Rajdhani, sans-serif'
                    }}
                    disabled={loading}
                />
                <button
                    onClick={() => send()}
                    disabled={loading || !input.trim()}
                    className="btn-cyber"
                    style={{
                        padding: '0.875rem 1.5rem',
                        background: 'linear-gradient(135deg, #7c3aed, #64b5f6)'
                    }}
                >
                    {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </div>
        </div>
    );
}
