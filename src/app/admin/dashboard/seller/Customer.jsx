'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function Customers() {
  const [data, setData] = useState({ customers: [], stats: {} });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const { axios } = useAppContext();

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/seller/customers?search=${search}&sortBy=${sortBy}`);
        const result = response.data;
        console.log("Fetched customers:", result);
        console.log("Fetched stats:", result.stats);

        setData(result);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [search, sortBy]);

  // Using the stats directly from your API response
  const apiStats = data.stats || {
    totalRevenue: 0,
    avgOrders: "0.0",
    avgSpent: "0.00"
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Customer Directory</h2>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-slate-600 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-slate-600 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="name">Name (A-Z)</option>
              <option value="totalOrders">Total Orders</option>
              <option value="totalSpent">Total Spent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 font-bold text-slate-700 uppercase tracking-wider">Customer</th>
                <th className="py-4 px-6 font-bold text-slate-700 uppercase tracking-wider">Contact</th>
                <th className="py-4 px-6 font-bold text-slate-700 uppercase tracking-wider text-center">Orders</th>
                <th className="py-4 px-6 font-bold text-slate-700 uppercase tracking-wider text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr><td colSpan="4" className="py-10 text-center text-slate-400">Loading...</td></tr>
              ) : data.customers.map((customer) => (
                <tr key={customer._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="py-4 px-6 text-slate-900 font-semibold">{customer.name}</td>
                  <td className="py-4 px-6 text-slate-500">{customer.email}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700 px-3 py-1 rounded-full text-xs font-bold transition-colors">
                      {customer.totalOrders}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right text-slate-900 font-mono font-medium">
                    Ksh{(customer.totalSpent || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && data.customers.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 text-lg">No results found for "{search}"</p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
        <StatCard title="Avg Orders" value={apiStats.avgOrders} />
        <StatCard title="Avg Customer Value" value={`Ksh ${apiStats.avgSpent}`} />
        <StatCard title="Total Revenue" value={`Ksh ${Number(apiStats.totalRevenue).toLocaleString()}`} color="text-green-600" />
      </div>
    </div>
  );
}

function StatCard({ title, value, color = "text-slate-900" }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">{title}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}