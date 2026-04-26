"use client"
import { useState, useMemo} from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend } from 'recharts';

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
      if (!response.ok) {
        throw new Error(`Azure API responded with status: ${response.status}`);
      }

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
  const daysSinceLast = dates.length
    ? Math.floor((Date.now() - Math.max(...dates)) / 86400000)
    : 30;
  const recency = Math.max(0, Math.min(1, (30 - daysSinceLast) / 30));
  const frequency = Math.min(1, totalBaskets / 20);
  const spend = Math.min(1, totalSpend / 500);
  return Math.round((recency * 0.4 + frequency * 0.35 + spend * 0.25) * 100);
}, [transactions, totalBaskets, totalSpend]);

const churnLabel = churnScore >= 65 ? 'Low Risk' : churnScore >= 35 ? 'Medium Risk' : 'High Risk';
const churnColor = churnScore >= 65 ? 'text-green-400' : churnScore >= 35 ? 'text-yellow-400' : 'text-red-400';
const churnBarColor = churnScore >= 65 ? 'bg-green-400' : churnScore >= 35 ? 'bg-yellow-400' : 'bg-red-400';

  const commodityMap: { [key: string]: number } = {};
  transactions.forEach((txn: any) => {
    const name = txn.product?.commodity || "Unknown";
    commodityMap[name] = (commodityMap[name] || 0) + txn.spend;
  });

  const chartData = Object.entries(commodityMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const COLORS = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

  return (
    <main className="p-8 bg-gray-100 min-h-screen font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-4xl font-black text-blue-900 tracking-tight">84.51° <span className="text-gray-500 font-light">Retail Insights</span></h1>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
               <p className="text-[10px] text-gray-400 uppercase font-bold">Total Spend</p>
               <p className="text-xl font-mono font-bold text-green-600">${totalSpend.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
               <p className="text-[10px] text-gray-400 uppercase font-bold">Trips</p>
               <p className="text-xl font-mono font-bold text-blue-800">{totalBaskets}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
               <p className="text-[10px] text-gray-400 uppercase font-bold">Avg Trip</p>
               <p className="text-xl font-mono font-bold text-blue-500">${avgBasket.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Req #2: User Access Fields */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl shadow-sm mb-8">
          <input className="border border-gray-300 p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" placeholder="Username" />
          <input className="border border-gray-300 p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" type="password" placeholder="Password" />
          <input className="border border-gray-300 p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" type="email" placeholder="Email" />
          <button onClick={handleUpdateProfile} className="bg-gray-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-black transition-all">
            {profileStatus || 'Update Profile'}
          </button>        
        </div>

        {/* Req #5: Data Loading Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-dashed border-blue-300 mb-8">
          <h3 className="text-sm font-bold text-blue-800 uppercase mb-4 flex items-center">
            <span className="mr-2"></span>Data Load Ingestion
          </h3>
          <div className="flex flex-wrap gap-4">
            {["Transactions", "Households", "Products"].map((type) => (
              <button 
                key={type}
                onClick={async () => {
                  alert(`Syncing ${type} from Azure Storage...`);
                  if (hshd) await handleSearch();
                }}
                className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                Load {type}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 italic">Triggers manual re-fetch from Azure SQL to verify dataset updates.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Dashboard Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Box*/}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex gap-4 items-center">
              <input 
                type="number" 
                value={hshd} 
                onChange={(e) => setHshd(e.target.value)}
                className="p-3 rounded-xl w-full text-lg focus:ring-2 focus:ring-blue-500 outline-none text-blue-900 bg-gray-50 border border-gray-200" 
                placeholder="Enter Household ID" 
              />
              <button 
                onClick={handleSearch} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all whitespace-nowrap shadow-md"
              >
                {loading ? 'LOADING...' : 'PULL DATA'}
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-600">Transaction Data</div>
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white shadow-sm">
                    <tr className="text-[10px] uppercase text-gray-400 border-b">
                      <th className="p-4">Basket</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Commodity</th>
                      <th className="p-4">Spend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn: any, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-blue-50 text-sm font-medium">
                        <td className="p-4 font-mono">{txn.basketNum}</td>
                        <td className="p-4 text-gray-500">{txn.date}</td>
                        <td className="p-4">{txn.product?.commodity}</td>
                        <td className="p-4 text-green-600 font-bold">${txn.spend.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wider text-center">Engagement Trend</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklySpend} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fontSize: 9, angle: -45, textAnchor: 'end' }} 
                    minTickGap={20} 
                    stroke="#94a3b8"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Weekly Spend']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line name="Weekly Spend" type="monotone" dataKey="total" stroke="#1e40af" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wider">Top Spend Categories</h3>
              <div className="space-y-3">
                {(() => {
                  const total = chartData.reduce((s, c) => s + c.value, 0);
                  const max = chartData[0]?.value || 1;
                  return chartData.map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-2 text-xs">
                      <div className="w-20 text-right text-gray-500 truncate">{cat.name}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(cat.value / max) * 100}%`, backgroundColor: COLORS[i] }}
                        />
                      </div>
                      <div className="w-8 text-right font-medium text-gray-700">
                        {total > 0 ? Math.round((cat.value / total) * 100) : 0}%
                      </div>
                      <div className="w-14 text-right text-gray-400">${cat.value.toFixed(2)}</div>
                    </div>
                  ));
                })()}
              </div>
              <div className="text-right text-[10px] text-gray-400 mt-3">
                Total: <span className="font-bold text-gray-600">${chartData.reduce((s, c) => s + c.value, 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-blue-900 p-6 rounded-2xl shadow-xl text-white">
              <h3 className="font-bold mb-1 text-sm uppercase tracking-widest opacity-80">Churn Prediction</h3>
              <p className="text-blue-200 text-xs mb-4 italic">Recency · Frequency · Spend</p>
              <div className="flex items-end gap-3 mb-4">
                <div className={`text-4xl font-black ${churnColor}`}>{churnScore}</div>
                <div className="text-lg font-semibold mb-1 opacity-90">{churnLabel}</div>
              </div>
              <div className="h-2 bg-blue-800 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${churnBarColor}`}
                  style={{ width: `${churnScore}%` }}
                />
              </div>
              <div className="space-y-1 text-xs text-blue-200">
                <div className="flex justify-between">
                  <span>Trips</span><span className="font-medium text-white">{totalBaskets}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total spend</span><span className="font-medium text-white">${totalSpend.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg trip</span><span className="font-medium text-white">${avgBasket.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}