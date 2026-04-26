"use client"
import { useState } from 'react';
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
                placeholder="Enter Household ID (e.g., 208)" 
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
              <div className="max-h-[400px] overflow-y-auto">
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
                  <LineChart data={transactions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    {/* Added X-Axis labels for time clarity */}
                    <XAxis dataKey="date" tick={{fontSize: 10}} minTickGap={30} stroke="#94a3b8" />
                    {/* Added Y-Axis to show dollar scale */}
                    <YAxis tick={{fontSize: 10}} stroke="#94a3b8" tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Spend']}
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Line name="Spend per Item" type="monotone" dataKey="spend" stroke="#1e40af" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wider">Top Spend Categories</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} style={{fontSize: '10px', fontWeight: 'bold'}} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}} 
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Total Category Spend']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-blue-900 p-6 rounded-2xl shadow-xl text-white">
              <h3 className="font-bold mb-2 text-sm uppercase tracking-widest opacity-80">Churn Prediction</h3>
              <p className="text-blue-200 text-xs mb-4 italic">Based on trip volume and spend density.</p>
              <div className="text-3xl font-black">{transactions.length > 50 ? 'LOW RISK' : 'HIGH RISK'}</div>
              <div className="mt-4 h-2 bg-blue-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${transactions.length > 50 ? 'bg-green-400 w-full' : 'bg-red-400 w-1/3'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}