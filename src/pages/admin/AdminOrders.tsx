import React, { useEffect, useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  ChefHat,
  Flame,
  Check,
  Ban,
  XCircle,
  Filter,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import {
  subscribeToAllOrders,
  updateOrderStatus,
} from '../../firebase/firestore';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('Item currently out of stock');

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders((data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalOrder) return;
    try {
      await updateOrderStatus(rejectModalOrder.orderId, 'rejected', rejectReason);
      setRejectModalOrder(null);
    } catch (e) {
      console.error('Failed to reject order:', e);
    }
  };

  // Filtering
  const filteredOrders = orders.filter((order) => {
    // Status tab filter
    if (filterStatus === 'active') {
      if (!['pending', 'accepted', 'preparing', 'ready'].includes(order.orderStatus)) {
        return false;
      }
    } else if (filterStatus !== 'all') {
      if (order.orderStatus !== filterStatus) return false;
    }

    // Search filter (Token or Roll or Name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchToken = order.tokenNumber.toLowerCase().includes(q);
      const matchRoll = order.rollNumber.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      if (!matchToken && !matchRoll && !matchName) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Kitchen Order Queue & Processing
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Accept, prepare, and call out student tokens in real time
          </p>
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Token (e.g. C001) or Roll..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: 'active', label: 'Active Kitchen Queue' },
          { key: 'all', label: 'All Orders' },
          { key: 'pending', label: 'Pending' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'preparing', label: 'Preparing' },
          { key: 'ready', label: 'Ready for Pickup' },
          { key: 'completed', label: 'Completed' },
          { key: 'rejected', label: 'Rejected / Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
              filterStatus === tab.key
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-2">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs text-stone-500">Syncing live orders...</p>
        </div>
      )}

      {!loading && filteredOrders.length === 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto">
          <Clock className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-900">No orders match this filter</h3>
          <p className="text-xs text-stone-500 mt-1">
            {searchQuery
              ? `No orders matching "${searchQuery}".`
              : 'There are currently no orders in this category.'}
          </p>
        </div>
      )}

      {/* Orders Grid */}
      {!loading && filteredOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const isReady = order.orderStatus === 'ready';
            const isPreparing = order.orderStatus === 'preparing';
            const isPending = order.orderStatus === 'pending';
            const isAccepted = order.orderStatus === 'accepted';
            const isCompleted = order.orderStatus === 'completed';

            return (
              <div
                key={order.orderId}
                className={`bg-white rounded-3xl border transition-all p-5 shadow-sm flex flex-col justify-between ${
                  isReady
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : isPreparing
                    ? 'border-amber-400'
                    : 'border-stone-200'
                }`}
              >
                <div>
                  {/* Top Header Card */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-2xl text-amber-950 bg-amber-100 px-3 py-1 rounded-xl">
                        #{order.tokenNumber}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-stone-900 block">
                          {order.customerName}
                        </span>
                        <span className="text-[11px] font-mono text-stone-500">
                          {order.rollNumber}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold capitalize px-2.5 py-1 rounded-full ${
                        isReady
                          ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                          : isPreparing
                          ? 'bg-amber-100 text-amber-800'
                          : isPending
                          ? 'bg-blue-100 text-blue-800'
                          : isCompleted
                          ? 'bg-stone-100 text-stone-700'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Timestamp & Payment badge */}
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pb-2 border-b border-stone-100">
                    <span>
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Paid Online (₹{order.totalAmount})
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="py-3 space-y-1.5 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-stone-800">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-stone-950 bg-stone-100 px-1.5 py-0.5 rounded">
                            {item.quantity}×
                          </span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="font-semibold text-stone-600">₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Advancement Controls */}
                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <button
                        onClick={() => handleStatusUpdate(order.orderId, 'accepted')}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
                      >
                        Accept Order
                      </button>
                    )}

                    {isAccepted && (
                      <button
                        onClick={() => handleStatusUpdate(order.orderId, 'preparing')}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Start Cooking</span>
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => handleStatusUpdate(order.orderId, 'ready')}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <Flame className="w-4 h-4" />
                        <span>Mark Ready for Pickup!</span>
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => handleStatusUpdate(order.orderId, 'completed')}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Token Handed Over (Done)</span>
                      </button>
                    )}

                    {/* Reject button for pending / accepted */}
                    {(isPending || isAccepted) && (
                      <button
                        onClick={() => setRejectModalOrder(order)}
                        className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition"
                        title="Reject Order"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Order Reason Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900">
              Reject Order #{rejectModalOrder.tokenNumber}?
            </h3>
            <p className="text-xs text-stone-500">
              Please state why this order cannot be prepared by the kitchen:
            </p>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full text-xs p-2.5 border border-stone-200 rounded-xl bg-stone-50"
            >
              <option value="Item currently out of stock">Item currently out of stock</option>
              <option value="Kitchen overloaded with current counter rush">Kitchen overloaded with current counter rush</option>
              <option value="Canteen closing time reached">Canteen closing time reached</option>
              <option value="Special recipe ingredients unavailable">Special recipe ingredients unavailable</option>
            </select>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setRejectModalOrder(null)}
                className="flex-1 py-2 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
