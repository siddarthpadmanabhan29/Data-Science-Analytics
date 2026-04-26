"use client"
import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
  const [hshd, setHshd] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState('');

  const handleSearch = async () => {
    if (!hshd) {
      alert("Please enter a Household ID first.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`https://8451-kroger-retail-fsgqc8byhwaga4dc.westus3-01.azurewebsites.net/api/transactions/household/${hshd}`);
      if (!response.ok) throw new Error(`Azure API responded with status: ${response.status}`);
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      console.error(err);
      alert("CONNECTION FAILED: Azure API is not responding.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = () => {
    setProfileStatus('Saving...');
    setTimeout(() => {
      setProfileStatus('Profile Updated Successfully! ✅');
      setTimeout(() => setProfileStatus(''), 3000);
    }, 1000);
  };

  const totalSpend = transactions.reduce((sum, txn: any) => sum + txn.spend, 0);
  const totalBaskets = new Set(transactions.map((t: any) => t.basketNum)).size;
  const avgBasket = totalBaskets > 0 ? totalSpend / totalBaskets : 0;

  const weeklySpend = useMemo(() => {
    const map: { [key: string]: number } = {};
    transactions.forEach((txn: any) => {
      const d = new Date(txn.date);
      const weekNum = Math.ceil(d.getDate() / 7);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')} W${weekNum}`;
      map[key] = (map[key] || 0) + txn.spend;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, total]) => ({ week, total }));
  }, [transactions]);

  const churnScore = useMemo(() => {
    if (transactions.length === 0) return 0;
    const dates = transactions.map((t: any) => new Date(t.date).getTime()).filter(Boolean);
    const daysSinceLast = dates.length ? Math.floor((Date.now() - Math.max(...dates)) / 86400000) : 30;
    const recency = Math.max(0, Math.min(1, (30 - daysSinceLast) / 30));
    const frequency = Math.min(1, totalBaskets / 20);
    const spend = Math.min(1, totalSpend / 500);
    return Math.round((recency * 0.4 + frequency * 0.35 + spend * 0.25) * 100);
  }, [transactions, totalBaskets, totalSpend]);

  const churnLabel = churnScore >= 65 ? 'Low Risk' : churnScore >= 35 ? 'Medium Risk' : 'High Risk';
  const churnColor = churnScore >= 65 ? '#22c55e' : churnScore >= 35 ? '#eab308' : '#ef4444';
  const churnBg = churnScore >= 65 ? 'rgba(34,197,94,0.15)' : churnScore >= 35 ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)';

  const commodityMap: { [key: string]: number } = {};
  transactions.forEach((txn: any) => {
    const name = txn.product?.commodity || "Unknown";
    commodityMap[name] = (commodityMap[name] || 0) + txn.spend;
  });

  const chartData = Object.entries(commodityMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const COLORS = ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];

  return (
    <main style={{ minHeight: '100vh', background: '#0f1117', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#e2e8f0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .card { background: #161b27; border: 1px solid #1e2535; border-radius: 16px; }
        .card-inner { background: #1a2030; border: 1px solid #222d42; border-radius: 12px; }
        input, button { font-family: inherit; }
        input { background: #1a2030; border: 1px solid #222d42; border-radius: 10px; color: #e2e8f0; padding: 10px 14px; font-size: 14px; outline: none; width: 100%; transition: border-color 0.2s; }
        input:focus { border-color: #3b82f6; }
        input::placeholder { color: #4a5568; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 4px; }
        table { border-collapse: collapse; width: 100%; }
        tr:hover td { background: rgba(59,130,246,0.04); }
        .stat-pill { background: #161b27; border: 1px solid #1e2535; border-radius: 12px; padding: 14px 20px; }
        .mono { font-family: 'DM Mono', monospace; }
        .label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #4a5568; font-weight: 500; margin-bottom: 4px; }
        .sync-btn { background: transparent; border: 1px solid #1e2535; border-radius: 8px; color: #64748b; font-size: 12px; font-weight: 500; padding: 7px 14px; cursor: pointer; transition: all 0.15s; }
        .sync-btn:hover { border-color: #3b82f6; color: #93c5fd; background: rgba(59,130,246,0.07); }
        .pull-btn { background: #1d4ed8; border: none; border-radius: 10px; color: #fff; font-weight: 600; font-size: 14px; padding: 10px 24px; cursor: pointer; letter-spacing: 0.02em; white-space: nowrap; transition: background 0.15s; }
        .pull-btn:hover { background: #2563eb; }
        .update-btn { background: #e2e8f0; border: none; border-radius: 10px; color: #0f1117; font-weight: 600; font-size: 13px; padding: 10px 20px; cursor: pointer; width: 100%; transition: background 0.15s; }
        .update-btn:hover { background: #fff; }
        .section-label { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #3b82f6; font-weight: 600; margin-bottom: 16px; }
        th { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: #374151; font-weight: 500; padding: 10px 16px; border-bottom: 1px solid #1e2535; }
        td { font-size: 13px; padding: 11px 16px; border-bottom: 1px solid #161b27; color: #94a3b8; }
        td:first-child { font-family: 'DM Mono', monospace; font-size: 12px; color: #64748b; }
        td:last-child { color: #22c55e; font-family: 'DM Mono', monospace; font-weight: 500; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 600, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              84.51°&nbsp;<span style={{ color: '#3b82f6' }}>Retail Insights</span>
            </div>
            <div style={{ fontSize: 12, color: '#4a5568', marginTop: 2 }}>Household transaction intelligence</div>
          </div>

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Spend', value: `$${totalSpend.toFixed(2)}`, color: '#22c55e' },
              { label: 'Trips', value: totalBaskets, color: '#60a5fa' },
              { label: 'Avg Trip', value: `$${avgBasket.toFixed(2)}`, color: '#818cf8' },
            ].map((s: any) => (
              <div key={s.label} className="stat-pill">
                <div className="label">{s.label}</div>
                <div className="mono" style={{ fontSize: 20, fontWeight: 500, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Profile + Sync row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 20, alignItems: 'stretch' }}>
          {/* Profile */}
          <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input placeholder="Username" style={{ flex: 1, minWidth: 120 }} />
            <input type="password" placeholder="Password" style={{ flex: 1, minWidth: 120 }} />
            <input type="email" placeholder="Email" style={{ flex: 1, minWidth: 160 }} />
            <button className="update-btn" onClick={handleUpdateProfile} style={{ minWidth: 150, flex: '0 0 auto' }}>
              {profileStatus || 'Update Profile'}
            </button>
          </div>

          {/* Sync */}
          <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            <div className="label" style={{ marginBottom: 6 }}>Data sync</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {["Transactions", "Households", "Products"].map((type) => (
                <button key={type} className="sync-btn"
                  onClick={async () => { alert(`Syncing ${type} from Azure Storage...`); if (hshd) await handleSearch(); }}>
                  ↻ {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="card" style={{ padding: '14px 20px', display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
          <input
            type="number"
            value={hshd}
            onChange={(e) => setHshd(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter Household ID"
            style={{ fontSize: 15, flex: 1 }}
          />
          <button className="pull-btn" onClick={handleSearch}>
            {loading ? '⟳ Loading…' : 'Pull Data'}
          </button>
        </div>

        {/* ── Main grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, alignItems: 'start' }}>

          {/* LEFT: transaction table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e2535', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Transaction Data</span>
              {transactions.length > 0 && (
                <span style={{ fontSize: 11, color: '#4a5568', background: '#1a2030', border: '1px solid #1e2535', borderRadius: 6, padding: '3px 10px' }}>
                  {transactions.length} rows
                </span>
              )}
            </div>
            <div style={{ maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Basket</th>
                    <th style={{ textAlign: 'left' }}>Date</th>
                    <th style={{ textAlign: 'left' }}>Commodity</th>
                    <th style={{ textAlign: 'right' }}>Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '40px 16px', color: '#374151' }}>
                        Enter a Household ID and pull data to begin
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn: any, i) => (
                      <tr key={i}>
                        <td>{txn.basketNum}</td>
                        <td style={{ color: '#64748b' }}>{txn.date}</td>
                        <td style={{ color: '#94a3b8' }}>{txn.product?.commodity}</td>
                        <td style={{ textAlign: 'right' }}>${txn.spend.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: charts column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Engagement Trend */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <div className="section-label">Engagement Trend</div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklySpend} margin={{ top: 4, right: 4, left: -24, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2535" />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 9, fill: '#374151', angle: -45, textAnchor: 'end' }}
                      minTickGap={20}
                      stroke="#1e2535"
                      height={50}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: '#374151' }}
                      stroke="#1e2535"
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Weekly Spend']}
                      contentStyle={{ background: '#1a2030', border: '1px solid #222d42', borderRadius: 10, fontSize: 12, color: '#e2e8f0' }}
                      cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 2' }}
                    />
                    <Line
                      name="Weekly Spend"
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: '#3b82f6', stroke: '#0f1117', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Spend Categories */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <div className="section-label">Top Spend Categories</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {chartData.length === 0 ? (
                  <div style={{ color: '#374151', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No data yet</div>
                ) : (() => {
                  const total = chartData.reduce((s, c) => s + c.value, 0);
                  const max = chartData[0]?.value || 1;
                  return chartData.map((cat, i) => (
                    <div key={cat.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                        <span style={{ color: '#94a3b8', fontWeight: 500 }}>{cat.name}</span>
                        <span style={{ color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
                          {total > 0 ? Math.round((cat.value / total) * 100) : 0}%&nbsp;&nbsp;${cat.value.toFixed(2)}
                        </span>
                      </div>
                      <div style={{ background: '#1a2030', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${(cat.value / max) * 100}%`,
                          background: COLORS[i],
                          borderRadius: 4,
                          transition: 'width 0.6s ease'
                        }} />
                      </div>
                    </div>
                  ));
                })()}
              </div>
              {chartData.length > 0 && (
                <div style={{ marginTop: 12, textAlign: 'right', fontSize: 11, color: '#374151' }}>
                  Total: <span style={{ color: '#94a3b8', fontFamily: 'DM Mono, monospace' }}>${chartData.reduce((s, c) => s + c.value, 0).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Churn Prediction */}
            <div style={{
              background: '#0d1520',
              border: '1px solid #1e2c42',
              borderRadius: 16,
              padding: '20px 22px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: 0, right: 0, width: 120, height: 120,
                background: `radial-gradient(circle at top right, ${churnBg}, transparent 70%)`,
                pointerEvents: 'none'
              }} />
              <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3b82f6', fontWeight: 600, marginBottom: 4 }}>Churn Prediction</div>
              <div style={{ fontSize: 11, color: '#374151', marginBottom: 16 }}>Recency · Frequency · Spend</div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 48, fontWeight: 600, color: churnColor, fontFamily: 'DM Mono, monospace', lineHeight: 1 }}>{churnScore}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: churnColor }}>{churnLabel}</div>
              </div>

              {/* Score bar */}
              <div style={{ background: '#1a2535', borderRadius: 6, height: 6, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ height: '100%', width: `${churnScore}%`, background: churnColor, borderRadius: 6, transition: 'width 1s ease' }} />
              </div>

              {/* Factor breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { label: 'Trips', value: totalBaskets },
                  { label: 'Total spend', value: `$${totalSpend.toFixed(2)}` },
                  { label: 'Avg trip', value: `$${avgBasket.toFixed(2)}` },
                ].map((f) => (
                  <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#374151' }}>{f.label}</span>
                    <span style={{ color: '#64748b', fontFamily: 'DM Mono, monospace' }}>{f.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}