'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { axios } = useAppContext();


  // 1. Fetch data from your API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/order/dashboard-stats');
        const result = await response.data;
        if (result.success) {
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Show loading state
  if (loading) {
    return <div className="p-10 text-center animate-pulse text-slate-500">Loading Dashboard...</div>;
  }

  // Handle case where data fails to load
  if (!data) {
    return <div className="p-10 text-center text-red-500">Failed to load dashboard data.</div>;
  }

  const { stats, recentOrders } = data;

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h2>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Sales" 
          value={`Ksh${stats.totalSales.toFixed(2)}`} 
          color="border-green-500" 
          footer="From all orders" 
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          color="border-blue-500" 
          footer="All time" 
        />
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          color="border-purple-500" 
          footer="Active customers" 
        />
        <StatCard 
          title="Low Stock Items" 
          value={stats.lowStockProducts} 
          color="border-red-500" 
          footer="Less than 10 units" 
        />
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="text-left py-3 px-4 font-semibold uppercase tracking-wider text-xs">Order ID</th>
                <th className="text-left py-3 px-4 font-semibold uppercase tracking-wider text-xs">Customer</th>
                <th className="text-left py-3 px-4 font-semibold uppercase tracking-wider text-xs">Amount</th>
                <th className="text-left py-3 px-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th className="text-left py-3 px-4 font-semibold uppercase tracking-wider text-xs">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                    {order._id.slice(-8).toUpperCase()}...
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {order.userId?.name || 'Unknown User'}
                  </td>
                  <td className="py-3 px-4 text-slate-900 font-bold">
                    Ksh{order.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, color, footer }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <p className="text-slate-600 text-sm font-medium mb-2">{title}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-2">{footer}</p>
    </div>
  );
}

// Helper for Status Badge Styling
function getStatusBadge(status) {
  switch (status.toLowerCase()) {
    case 'delivered': return 'bg-green-100 text-green-700';
    case 'shipped': return 'bg-blue-100 text-blue-700';
    case 'order placed': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}