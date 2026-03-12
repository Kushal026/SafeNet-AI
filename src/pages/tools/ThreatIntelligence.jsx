import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertOctagon, RefreshCw, Loader } from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const API_BASE = '/api';

const SEVERITY_COLORS = { CRITICAL: '#ff2d55', HIGH: '#ff9500', MEDIUM: '#ffd60a', LOW: '#00d4ff' };

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginBottom: '0.375rem' }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', color: p.color, fontSize: '0.78rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                    <span>{p.name}</span><span>{p.value?.toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
};

export default function ThreatIntelligence() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true); setError('');
        try {
            const res = await fetch(`${API_BASE}/threat-intel`);
            setData(await res.json());
        } catch {
            setError('Backend not connected. Start the FastAPI server to see live threat intelligence.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.625rem', borderRadius: '10px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)' }}>
                        <BarChart3 size={22} style={{ color: '#a78bfa' }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9' }}>Cyber Threat Intelligence</h1>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(148,163,184,0.6)' }}>Real-time global cybersecurity analytics and threat data</p>
                    </div>
                </div>
                <button onClick={fetchData} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                    <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
                </button>
            </div>

            {error && <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.3)', color: '#ff2d55', fontSize: '0.85rem', marginBottom: '1.5rem' }}>⚠ {error}</div>}

            {loading && !data && (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <Loader size={40} style={{ color: '#a78bfa', animation: 'spin 1s linear infinite', margin: '0 auto', display: 'block' }} />
                </div>
            )}

            {data && (
                <>
                    {/* Global Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'Threats Today', value: data.global_stats.threats_today?.toLocaleString(), color: '#ff2d55' },
                            { label: 'Phishing URLs (24h)', value: data.global_stats.phishing_urls_24h?.toLocaleString(), color: '#ff9500' },
                            { label: 'Malware Samples (24h)', value: data.global_stats.malware_samples_24h?.toLocaleString(), color: '#a78bfa' },
                            { label: 'Active Campaigns', value: data.global_stats.active_campaigns, color: '#ffd60a' },
                        ].map((stat, i) => (
                            <div key={i} style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(13,17,23,0.7)', border: `1px solid ${stat.color}20`, backdropFilter: 'blur(16px)', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: stat.color, fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.25rem' }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Attack Trends Chart */}
                    <div style={{ padding: '1.5rem', borderRadius: '14px', background: 'rgba(13,17,23,0.7)', border: '1px solid rgba(0,212,255,0.12)', backdropFilter: 'blur(16px)', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <TrendingUp size={16} style={{ color: '#00d4ff' }} />
                            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#e2e8f0' }}>Attack Trends (Last 14 Days)</span>
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={data.attack_trends} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradPhishing" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff2d55" stopOpacity={0.3}/><stop offset="95%" stopColor="#ff2d55" stopOpacity={0}/></linearGradient>
                                    <linearGradient id="gradMalware" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff9500" stopOpacity={0.3}/><stop offset="95%" stopColor="#ff9500" stopOpacity={0}/></linearGradient>
                                    <linearGradient id="gradRansom" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3}/><stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#94a3b8' }} />
                                <Area type="monotone" dataKey="phishing" stroke="#ff2d55" strokeWidth={2} fill="url(#gradPhishing)" name="Phishing" />
                                <Area type="monotone" dataKey="malware" stroke="#ff9500" strokeWidth={2} fill="url(#gradMalware)" name="Malware" />
                                <Area type="monotone" dataKey="ransomware" stroke="#a78bfa" strokeWidth={2} fill="url(#gradRansom)" name="Ransomware" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        {/* Threat Types Pie */}
                        <div style={{ padding: '1.5rem', borderRadius: '14px', background: 'rgba(13,17,23,0.7)', border: '1px solid rgba(0,212,255,0.12)' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#e2e8f0', marginBottom: '1rem' }}>Threat Distribution</div>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={data.threat_types} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={{ stroke: 'rgba(148,163,184,0.3)' }} fontSize={10}>
                                        {data.threat_types.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Industry Targets Bar */}
                        <div style={{ padding: '1.5rem', borderRadius: '14px', background: 'rgba(13,17,23,0.7)', border: '1px solid rgba(0,212,255,0.12)' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#e2e8f0', marginBottom: '1rem' }}>Top Targeted Industries</div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={data.industry_targets} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="industry" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="attacks" name="Attacks" radius={[0, 4, 4, 0]}>
                                        {data.industry_targets.map((_, i) => <Cell key={i} fill={['#ff2d55','#ff9500','#ffd60a','#a78bfa','#00d4ff','#00ff88'][i % 6]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Live Alerts */}
                    <div style={{ padding: '1.5rem', borderRadius: '14px', background: 'rgba(13,17,23,0.7)', border: '1px solid rgba(0,212,255,0.12)', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <AlertOctagon size={16} style={{ color: '#ff2d55' }} />
                            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#e2e8f0' }}>Live Threat Alerts</span>
                            <div style={{ marginLeft: 'auto', fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '20px', background: 'rgba(255,45,85,0.15)', color: '#ff2d55', fontWeight: 700 }}>LIVE</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                            {data.live_alerts?.map((alert, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem', borderRadius: '8px', background: `${SEVERITY_COLORS[alert.severity]}08`, border: `1px solid ${SEVERITY_COLORS[alert.severity]}20` }}>
                                    <div style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: `${SEVERITY_COLORS[alert.severity]}20`, fontSize: '0.62rem', fontWeight: 800, color: SEVERITY_COLORS[alert.severity], letterSpacing: '0.05em', flexShrink: 0 }}>{alert.severity}</div>
                                    <div style={{ flex: 1, fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.4 }}>{alert.title}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.4)', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>{alert.time}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Malware Families */}
                    <div style={{ padding: '1.5rem', borderRadius: '14px', background: 'rgba(13,17,23,0.7)', border: '1px solid rgba(0,212,255,0.12)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#e2e8f0', marginBottom: '1rem' }}>Top Active Malware Families</div>
                        {data.malware_families?.map((m, i) => {
                            const maxDetections = Math.max(...data.malware_families.map(x => x.detections));
                            const pct = (m.detections / maxDetections) * 100;
                            const colors = ['#ff2d55','#ff9500','#ffd60a','#7c3aed','#00d4ff','#00ff88'];
                            return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.75rem' }}>
                                    <div style={{ width: '120px', fontSize: '0.78rem', color: '#e2e8f0', flexShrink: 0 }}>
                                        <div style={{ fontWeight: 600 }}>{m.name}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'rgba(148,163,184,0.5)' }}>{m.type}</div>
                                    </div>
                                    <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, borderRadius: '4px', background: colors[i % 6], boxShadow: `0 0 8px ${colors[i % 6]}80`, transition: 'width 1.5s ease' }} />
                                    </div>
                                    <span style={{ fontSize: '0.72rem', color: colors[i % 6], fontFamily: 'JetBrains Mono, monospace', width: '60px', textAlign: 'right', flexShrink: 0 }}>{m.detections.toLocaleString()}</span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
