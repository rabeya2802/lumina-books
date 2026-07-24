import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminBooks from './AdminBooks';
import AdminOrders from './AdminOrders';
import api from './services/api';

/**
 * UNIFIED ADMIN DASHBOARD
 * 
 * Shows:
 * 1. Book Management (Add, Edit, Delete)
 * 2. Order Management (View, Update Status)
 * 3. Store Statistics
 */
function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('books'); // 'books' or 'orders'
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    checkAdminAccess();
    loadStats();
  }, []);

  const checkAdminAccess = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      
      if (userData.role !== 'admin') {
        navigate('/');
        alert('❌ Admin access required');
      }
    } catch (err) {
      navigate('/login');
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get books count
      const booksResponse = await api.get('/api/books');
      const books = booksResponse.data.data || [];
      
      // Get orders stats (if admin can access)
      try {
        const ordersResponse = await api.get('/api/admin/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const orders = ordersResponse.data.data || [];
        const pendingCount = orders.filter(o => o.status === 'pending').length;
        const totalRev = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        
        setStats({
          totalBooks: books.length,
          totalOrders: orders.length,
          pendingOrders: pendingCount,
          totalRevenue: totalRev,
        });
      } catch (err) {
        // If can't get orders, just show books
        setStats(prev => ({
          ...prev,
          totalBooks: books.length,
        }));
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-black mb-2">🎛️ Admin Dashboard</h1>
          <p className="text-blue-100">Manage your bookstore</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg bg-white p-6 shadow-md border-l-4 border-blue-500">
            <div className="text-gray-500 text-sm font-semibold">📚 Total Books</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{stats.totalBooks}</div>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow-md border-l-4 border-orange-500">
            <div className="text-gray-500 text-sm font-semibold">📦 Total Orders</div>
            <div className="text-3xl font-bold text-orange-600 mt-2">{stats.totalOrders}</div>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow-md border-l-4 border-yellow-500">
            <div className="text-gray-500 text-sm font-semibold">⏳ Pending Orders</div>
            <div className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingOrders}</div>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow-md border-l-4 border-green-500">
            <div className="text-gray-500 text-sm font-semibold">💰 Total Revenue</div>
            <div className="text-3xl font-bold text-green-600 mt-2">৳{stats.totalRevenue.toFixed(0)}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-4 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('books')}
            className={`px-6 py-3 font-bold transition-all border-b-4 ${
              activeTab === 'books'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-blue-600'
            }`}
          >
            📚 Book Management
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-bold transition-all border-b-4 ${
              activeTab === 'orders'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-blue-600'
            }`}
          >
            📦 Order Management
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'books' && <AdminBooks />}
        {activeTab === 'orders' && <AdminOrders />}
      </div>
    </div>
  );
}

export default AdminDashboard;
