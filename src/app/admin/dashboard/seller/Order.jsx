'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function Orders() {

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { axios } = useAppContext();

  // 1. Fetch Real Orders from Backend
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Note: We'll do the filtering in JS for now to match your logic, 
      // but usually, you'd pass these as query params to the API.
      const response = await axios.get('/api/order/all-orders');
      const data = response.data;
      if (data.success) {
        setOrders(data.orders);
      }
      console.log("Fetched orders:", data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Handle Status Change via API
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`/api/order/update/${orderId}`, {
        status: newStatus
      });
      
      const data = response.data;

      if (data.success) {
        // Update local state so UI changes immediately
        setOrders(prev => 
          prev.map(order => order._id === orderId ? { ...order, status: newStatus } : order)
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // 3. Client-side Filter Logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(search.toLowerCase()) ||
      order.userId?.name?.toLowerCase().includes(search.toLowerCase());
    
    // In your schema, the field is 'status', not 'orderStatus'
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    
    // In your schema, the field is 'isPaid' (boolean), logic adjusted below
    const paymentStatusString = order.isPaid ? 'paid' : 'pending';
    const matchesPayment = paymentFilter === 'all' || paymentStatusString === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Helper for Status Badge Colors
  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'pending' || s === 'order placed') return 'bg-yellow-100 text-yellow-800';
    if (s === 'shipped') return 'bg-blue-100 text-blue-800';
    if (s === 'delivered') return 'bg-green-100 text-green-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Admin Orders</h2>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Order ID or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Order Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Order Placed">Order Placed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Status</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Order ID</th>
                <th className="text-left py-3 px-4 font-semibold">Customer</th>
                <th className="text-center py-3 px-4 font-semibold">Items</th>
                <th className="text-right py-3 px-4 font-semibold">Total</th>
                <th className="text-center py-3 px-4 font-semibold">Payment</th>
                <th className="text-center py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10">Loading orders...</td></tr>
              ) : filteredOrders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-slate-50 transition">
                  <td className="py-3 px-4 text-xs font-mono text-slate-500">{order._id}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-900">{order.userId?.name || 'Guest'}</p>
                    <p className="text-xs text-slate-500">{order.userId?.email}</p>
                  </td>
                  <td className="py-3 px-4 text-center">{order.items?.length || 0}</td>
                  <td className="py-3 px-4 text-right font-semibold">Ksh{order.totalAmount?.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`px-2 py-1 rounded border text-xs outline-none ${getStatusColor(order.status)}`}
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
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