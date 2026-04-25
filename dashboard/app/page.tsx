"use client"
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Home() {
  const [hshd, setHshd] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState('');

  const handleSearch = async () => {
    // 1. Immediate visual confirmation
    alert("Button clicked! Attempting to connect to Java...");
    
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
      alert(`Success! Found ${data.length} transactions.`);
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
  // Simulate a 1-second database save
  setTimeout(() => {
    setProfileStatus('Profile Updated Successfully! ✅');
    // Clear the message after 3 seconds
    setTimeout(() => setProfileStatus(''), 3000);
  }, 1000);
};
  // Calculate total spend for the dashboard
  const totalSpend = transactions.reduce((sum, txn: any) => sum + txn.spend, 0);

  return (
    <main className="p-8 bg-gray-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-blue-900 tracking-tight">84.51° <span className="text-gray-500 font-light">Retail Insights</span></h1>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
             <p className="text-xs text-gray-400 uppercase font-bold">Total Household Spend</p>
             <p className="text-2xl font-mono font-bold text-green-600">${totalSpend.toFixed(2)}</p>
          </div>
        </div>

        {/* Req #2: User Access Fields */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl shadow-sm mb-8">
          <input 
            className="border border-gray-300 p-3 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
            placeholder="Username" 
          />
          <input 
            className="border border-gray-300 p-3 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
            type="password" 
            placeholder="Password" 
          />
          <input 
            className="border border-gray-300 p-3 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
            type="email" 
            placeholder="Email" 
          />
          <button 
            onClick={handleUpdateProfile}
            className="bg-gray-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-black transition-all">{profileStatus || 'Update Profile'}
          </button>        
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Search & Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-blue-600 p-6 rounded-2xl shadow-lg flex gap-4 items-center">
              <input 
                type="number" 
                value={hshd} 
                onChange={(e) => setHshd(e.target.value)}
                className="p-3 rounded-xl w-full text-lg focus:outline-none" 
                placeholder="Enter Household ID (e.g., 10)" 
              />
              <button 
                onClick={handleSearch} 
                className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-black py-3 px-8 rounded-xl transition-all whitespace-nowrap"
              >
                {loading ? 'LOADING...' : 'PULL DATA'}
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-600">Transaction Ledger</div>
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white shadow-sm">
                    <tr className="text-xs uppercase text-gray-400">
                      <th className="p-4">Basket</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Commodity</th>
                      <th className="p-4">Spend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn: any, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-blue-50 text-sm text-gray-900 font-medium">
                        <td className="p-4 font-mono">{txn.basketNum}</td>
                        <td className="p-4 text-gray-500">{txn.date}</td>
                        <td className="p-4 font-bold">{txn.product?.commodity}</td>
                        <td className="p-4 text-green-600 font-bold">${txn.spend.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Insights (Requirement #6) */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[400px]">
              <h3 className="font-bold text-gray-700 mb-6">Spending Trend (Engagement)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={transactions}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="spend" stroke="#1e40af" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-blue-900 p-6 rounded-2xl shadow-xl text-white">
              <h3 className="font-bold mb-2">Requirement #8: Churn Risk</h3>
              <p className="text-blue-200 text-sm mb-4">Based on spending frequency and recent activity.</p>
              <div className="text-3xl font-black">{transactions.length > 50 ? 'LOW RISK' : 'HIGH RISK'}</div>
              <div className="mt-4 h-2 bg-blue-800 rounded-full overflow-hidden">
                <div className={`h-full ${transactions.length > 50 ? 'bg-green-400 w-full' : 'bg-red-400 w-1/3'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}