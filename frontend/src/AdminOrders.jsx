import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';

/**
 * ADMIN ORDERS DASHBOARD
 * 
 * PURPOSE:
 * Admin panel to view ALL orders from ALL customers
 * Update order status
 * Track business metrics
 * 
 * ADMIN FEATURES:
 * 1. View all orders (not just their own)
 * 2. Update order status (pending → processing → shipped → delivered)
 * 3. Cancel orders
 * 4. See customer details
 * 5. Track revenue
 */
function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, processing, shipped, delivered, cancelled

  useEffect(() => {
    // Check if admin
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (!token || !user) {
        navigate('/login');
        return;
      }

      // Try to fetch admin orders
      // If user isn't admin, backend returns 403 and we redirect
      await fetchAdminOrders(token);
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/');
        alert('❌ Access Denied: Admin privileges required');
      } else {
        setError('Failed to verify admin access');
      }
    }
  };

  const fetchAdminOrders = async (token) => {
    try {
      const response = await api.get(
        '/api/orders/admin/orders',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('📊 Admin orders fetched:', response.data);
      setOrders(response.data.orders || []);
      setError('');
    } catch (err) {
      console.error('❌ Error fetching admin orders:', err);
      
      if (err.response?.status === 403) {
        throw err; // Re-throw to be handled by checkAdminAccess
      }

      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem('token');

      const response = await api.put(
        `/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('✅ Order status updated:', response.data);

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      ));

      // Clear selected order
      setSelectedOrder(null);

      alert(`✅ Order #${orderId} status updated to ${newStatus}`);
    } catch (err) {
      console.error('❌ Error updating status:', err);
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePaymentStatusUpdate = async (orderId, paymentStatus) => {
    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem('token');
      await api.put(
        `/api/orders/${orderId}/payment-status`,
        { paymentStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setOrders((current) => current.map((order) => (
        order.id === orderId ? { ...order, payment_status: paymentStatus } : order
      )));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'delivered': 'bg-green-100 text-green-700',
      'shipped': 'bg-blue-100 text-blue-700',
      'processing': 'bg-yellow-100 text-yellow-700',
      'cancelled': 'bg-red-100 text-red-700',
      'pending': 'bg-gray-100 text-gray-700',
    };
    return colors[status] || colors['pending'];
  };

  const getPaymentStatusColor = (status) => ({
    verified: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-rose-100 text-rose-700',
    pending_verification: 'bg-amber-100 text-amber-700',
  }[status] || 'bg-stone-100 text-stone-700');

  const formatPaymentMethod = (method) => ({
    cash_on_delivery: 'Cash on Delivery', bkash: 'bKash', nagad: 'Nagad',
    rocket: 'Rocket (DBBL)', bank_transfer: 'Bank Transfer',
  }[method] || 'Not specified');

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  if (!localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔐 Admin Access Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access this page.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full rounded-lg bg-gradient-to-r from-red-600 to-pink-600 px-4 py-3 font-semibold text-white transition hover:from-red-700 hover:to-pink-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">⚙️ Admin Dashboard</h1>
          <p className="text-gray-600">Manage all customer orders</p>
        </div>

        {/* Statistics */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl bg-white p-6 shadow-md border-l-4 border-blue-500">
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-3xl font-black text-blue-600">{totalOrders}</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-md border-l-4 border-yellow-500">
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-3xl font-black text-yellow-600">{pendingOrders}</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-md border-l-4 border-green-500">
              <p className="text-gray-600 text-sm">Delivered</p>
              <p className="text-3xl font-black text-green-600">{deliveredOrders}</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-md border-l-4 border-purple-500">
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-3xl font-black text-purple-600">৳{totalRevenue}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-300 border-t-red-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading admin dashboard...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-2xl bg-red-100 border-2 border-red-300 p-6 text-center mb-8">
            <p className="text-red-700 font-semibold mb-4">❌ {error}</p>
            <button
              onClick={() => checkAdminAccess()}
              className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Filter Buttons */}
        {!loading && !error && (
          <div className="mb-8 flex flex-wrap gap-2">
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-lg px-4 py-2 font-semibold transition ${
                  filter === status
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border-2 border-red-200 bg-white p-6 shadow-md hover:shadow-lg transition"
              >
                {/* Order Header */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 md:gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order #</p>
                    <p className="text-xl font-bold text-gray-900">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-semibold text-gray-900">{order.customer_name}</p>
                    <p className="text-xs text-gray-600">{order.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="text-lg font-bold text-purple-600">৳{order.total_amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`font-semibold capitalize px-3 py-1 rounded-full inline-block text-sm ${
                      getStatusColor(order.status)
                    }`}>
                      {order.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-semibold text-gray-900">{formatPaymentMethod(order.payment_method)}</p>
                    {order.transaction_id && <p className="text-xs text-gray-600">Txn: {order.transaction_id}</p>}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className={`font-semibold px-3 py-1 rounded-full inline-block text-sm ${getPaymentStatusColor(order.payment_status)}`}>
                      {(order.payment_status || 'pending_verification').replaceAll('_', ' ')}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-red-100 pt-4 mt-4 flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="rounded-lg bg-blue-100 px-4 py-2 font-semibold text-blue-700 transition hover:bg-blue-200"
                  >
                    {selectedOrder?.id === order.id ? '▲ Hide' : '▼ Details'}
                  </button>

                  {order.payment_status !== 'verified' && (
                    <button
                      onClick={() => handlePaymentStatusUpdate(order.id, 'verified')}
                      disabled={updatingStatus}
                      className="rounded-lg bg-emerald-100 px-4 py-2 font-semibold text-emerald-700 transition hover:bg-emerald-200 disabled:opacity-50"
                    >
                      ✓ Verify Payment
                    </button>
                  )}
                  {order.payment_status !== 'rejected' && (
                    <button
                      onClick={() => handlePaymentStatusUpdate(order.id, 'rejected')}
                      disabled={updatingStatus}
                      className="rounded-lg bg-rose-100 px-4 py-2 font-semibold text-rose-700 transition hover:bg-rose-200 disabled:opacity-50"
                    >
                      ✕ Reject Payment
                    </button>
                  )}

                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'processing')}
                          disabled={updatingStatus}
                          className="rounded-lg bg-yellow-100 px-4 py-2 font-semibold text-yellow-700 transition hover:bg-yellow-200 disabled:opacity-50"
                        >
                          ⏳ Start Processing
                        </button>
                      )}

                      {order.status === 'processing' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'shipped')}
                          disabled={updatingStatus}
                          className="rounded-lg bg-blue-100 px-4 py-2 font-semibold text-blue-700 transition hover:bg-blue-200 disabled:opacity-50"
                        >
                          📦 Mark Shipped
                        </button>
                      )}

                      {order.status === 'shipped' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          disabled={updatingStatus}
                          className="rounded-lg bg-green-100 px-4 py-2 font-semibold text-green-700 transition hover:bg-green-200 disabled:opacity-50"
                        >
                          ✅ Mark Delivered
                        </button>
                      )}
                    </>
                  )}

                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                      disabled={updatingStatus}
                      className="rounded-lg bg-red-100 px-4 py-2 font-semibold text-red-700 transition hover:bg-red-200 disabled:opacity-50"
                    >
                      ❌ Cancel Order
                    </button>
                  )}
                </div>

                {/* Expanded Details */}
                {selectedOrder?.id === order.id && (
                  <div className="mt-6 border-t border-red-100 pt-6">
                    <h4 className="font-bold text-gray-900 mb-4">📍 Delivery Details</h4>
                    <p className="text-gray-700 mb-4 break-words">
                      <span className="font-semibold">Address:</span> {order.customer_name}, {order.address}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      {order.phone && <>Phone: {order.phone} · </>}
                      {order.division && `${order.upazila_city}, ${order.district}, ${order.division}`}
                    </p>

                    <h4 className="font-bold text-gray-900 mb-4">📦 Items ({order.item_count})</h4>
                    
                    {selectedOrder.id === order.id && selectedOrder.items && (
                      <div className="space-y-2">
                        {selectedOrder.items.map((item) => (
                          <div key={item.item_id} className="flex justify-between rounded-lg bg-red-50 p-3">
                            <div>
                              <p className="font-semibold text-gray-900">{item.title}</p>
                              <p className="text-xs text-gray-600">by {item.author}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-700">Qty: {item.quantity}</p>
                              <p className="font-bold text-red-600">৳{item.total_price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          const response = await api.get(
                            `/api/admin/orders/${order.id}`,
                            {
                              headers: {
                                'Authorization': `Bearer ${token}`,
                              },
                            }
                          );
                          setSelectedOrder(response.data.order);
                        } catch (err) {
                          console.error('Error fetching order details:', err);
                        }
                      }}
                      className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                    >
                      Load Items
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-red-300 bg-white/80 p-12 text-center">
            <p className="text-4xl mb-4">📭</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600">
              No orders with status "{filter}"
            </p>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-12">
          <button
            onClick={() => navigate('/')}
            className="rounded-lg border-2 border-red-600 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;
