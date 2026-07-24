import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';
import { ShoppingBag, ArrowRight } from 'lucide-react';

/**
 * ORDER HISTORY PAGE
 *
 * Shows the logged-in user all their previous orders with
 * status tracking (Pending → Processing → Shipped → Delivered).
 */
function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await api.get('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setOrders(response.data.orders || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (!localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔐 Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your order history.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full rounded-lg bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-3 font-semibold text-white transition hover:from-amber-700 hover:to-orange-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">📦 My Orders</h1>
          <p className="text-gray-600">View your order history and track your purchases</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-300 border-t-amber-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading your orders...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-2xl bg-red-100 border-2 border-red-300 p-6 text-center">
            <p className="text-red-700 font-semibold mb-4">❌ {error}</p>
            <button
              onClick={fetchOrders}
              className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-amber-300 bg-white/80 px-6 py-16 text-center">
            <div className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 ring-8 ring-amber-50 sm:h-32 sm:w-32">
              <ShoppingBag className="h-12 w-12 text-amber-600 sm:h-14 sm:w-14" strokeWidth={1.5} />
            </div>
            <h3 className="mt-7 text-2xl font-bold text-gray-900">No Orders Yet</h3>
            <p className="mt-2 max-w-md text-gray-600">
              You haven't placed any orders yet. Start shopping to see them here.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-3 font-semibold text-white transition hover:from-amber-700 hover:to-orange-600 active:scale-95"
            >
              Browse Books
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border-2 border-amber-200 bg-white p-6 shadow-md hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
              >
                {/* Order Header */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5 md:gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="text-lg font-bold text-gray-900">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-lg font-bold text-amber-600">
                      ৳{order.total_amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`font-semibold capitalize px-3 py-1 rounded-full inline-block ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Items</p>
                    <p className="text-lg font-bold text-gray-900">
                      {order.items?.length || 0} items
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border-t border-amber-100 pt-4 mt-4">
                  <p className="text-sm text-gray-500">Delivery Address</p>
                  <p className="text-gray-700 font-semibold">{order.customer_name}</p>
                  <p className="text-gray-600 break-words">{order.address}</p>
                </div>

                {/* Expanded Order Details */}
                {selectedOrder?.id === order.id && order.items && (
                  <div className="mt-6 border-t border-amber-100 pt-6">
                    {/* ===== Order Status Tracker ===== */}
                    <OrderStatusTracker status={order.status} />

                    <h4 className="font-bold text-gray-900 mb-4">📦 Items in this order:</h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg bg-amber-50 p-3"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-600">by {item.author}</p>
                            <p className="text-sm text-gray-500">
                              ৳{item.unit_price} × {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-amber-600">
                              ৳{item.total_item_price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Click Indicator */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-amber-600 font-semibold">
                    {selectedOrder?.id === order.id ? '▲ Hide Details' : '▼ View Details'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-12">
          <button
            onClick={() => navigate('/')}
            className="rounded-lg border-2 border-amber-600 px-6 py-3 font-semibold text-amber-600 transition hover:bg-amber-50"
          >
            ← Back to Bookstore
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * OrderStatusTracker
 * Visual progress bar showing the 4 delivery stages:
 * Pending → Processing → Shipped → Delivered
 * Completed stages are filled with a checkmark; the current stage
 * is highlighted with a ring. Cancelled orders show a red banner.
 */
function OrderStatusTracker({ status }) {
  const stages = [
    { key: 'pending', label: 'Pending', icon: '📋' },
    { key: 'processing', label: 'Processing', icon: '⚙️' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✅' },
  ];

  const isCancelled = status === 'cancelled';
  const currentIdx = stages.findIndex((s) => s.key === status);

  if (isCancelled) {
    return (
      <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-red-100 text-xl">❌</span>
          <div>
            <p className="font-bold text-red-700">Order Cancelled</p>
            <p className="text-sm text-red-500">This order was cancelled and will not be processed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
      <p className="mb-4 text-sm font-semibold text-stone-700">Order Progress</p>

      {/* Desktop: horizontal stepper */}
      <div className="hidden items-center sm:flex">
        {stages.map((stage, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isLast = idx === stages.length - 1;

          return (
            <div key={stage.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`grid h-11 w-11 place-items-center rounded-full border-2 text-lg transition-all ${
                    isDone
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isCurrent
                        ? 'border-amber-500 bg-amber-500 text-white shadow-lg ring-4 ring-amber-200'
                        : 'border-stone-200 bg-white text-stone-300'
                  }`}
                >
                  {isDone ? '✓' : stage.icon}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    isDone || isCurrent ? 'text-stone-800' : 'text-stone-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
              {!isLast && (
                <div className="mx-2 h-1 flex-1 rounded-full bg-stone-200">
                  <div
                    className={`h-full rounded-full transition-all ${
                      idx < currentIdx ? 'bg-emerald-500' : 'bg-transparent'
                    }`}
                    style={{ width: idx < currentIdx ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical stepper */}
      <div className="space-y-1 sm:hidden">
        {stages.map((stage, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isLast = idx === stages.length - 1;

          return (
            <div key={stage.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 text-sm transition-all ${
                    isDone
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isCurrent
                        ? 'border-amber-500 bg-amber-500 text-white ring-2 ring-amber-200'
                        : 'border-stone-200 bg-white text-stone-300'
                  }`}
                >
                  {isDone ? '✓' : stage.icon}
                </div>
                {!isLast && (
                  <div
                    className={`my-1 w-0.5 self-stretch rounded-full ${
                      idx < currentIdx ? 'bg-emerald-500' : 'bg-stone-200'
                    }`}
                    style={{ minHeight: '20px' }}
                  />
                )}
              </div>
              <div className="pb-3">
                <p
                  className={`text-sm font-semibold ${
                    isDone || isCurrent ? 'text-stone-800' : 'text-stone-400'
                  }`}
                >
                  {stage.label}
                </p>
                {isCurrent && <p className="text-xs text-amber-600">In progress…</p>}
                {isDone && <p className="text-xs text-emerald-600">Completed</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderHistory;