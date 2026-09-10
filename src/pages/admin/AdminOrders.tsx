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
  Phone,
  User,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Banknote,
  QrCode,
  Bell,
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

  // Metrics calculation
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter((o) => o.orderStatus === 'pending').length;
  const preparingCount = orders.filter((o) => ['accepted', 'preparing'].includes(o.orderStatus)).length;
  const readyCount = orders.filter((o) => o.orderStatus === 'ready').length;
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'rejected')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

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

    // Search filter (Order Number or Name or Phone)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const orderNumStr = String(order.orderNumber || order.tokenNumber || '').toLowerCase();
      const matchNum = orderNumStr.includes(q);
      const matchName = (order.customerName || '').toLowerCase().includes(q);
      const matchPhone = (order.customerPhone || order.phone || '').toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchPhone) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header with live count & search */}
      <div className="glass-card rounded-3xl border border-purple-500/20 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Live Canteen Kitchen & Orders Feed
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold">
              Real-Time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-purple-300/80 mt-1">
            Overall master access: monitor every student’s name, contact, sequential order number, and meal preparation.
          </p>
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order #, Name or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-purple-950/40 border border-purple-500/30 rounded-2xl text-white placeholder-purple-300/40 focus:outline-none focus:border-teal-400 transition-all"
          />
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-purple-500/20">
          <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider block">
            Total Orders
          </span>
          <span className="text-2xl font-black text-white mt-1 block">
            {totalOrdersCount}
          </span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20">
          <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider block">
            Pending Orders
          </span>
          <span className="text-2xl font-black text-amber-300 mt-1 block">
            {pendingCount}
          </span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/20">
          <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider block">
            In Kitchen
          </span>
          <span className="text-2xl font-black text-indigo-300 mt-1 block">
            {preparingCount}
          </span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-teal-500/30 bg-teal-950/20">
          <span className="text-[11px] font-semibold text-teal-300 uppercase tracking-wider block">
            Ready at Counter
          </span>
          <span className="text-2xl font-black text-teal-300 mt-1 block">
            {readyCount}
          </span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-purple-500/30 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider block">
            Total Revenue
          </span>
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-purple-200 mt-1 block">
            ₹{totalRevenue}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'active', label: 'Active Queue' },
          { key: 'all', label: 'All Orders' },
          { key: 'pending', label: 'Pending' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'preparing', label: 'Cooking / Preparing' },
          { key: 'ready', label: 'Ready for Pickup' },
          { key: 'completed', label: 'Completed' },
          { key: 'rejected', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              filterStatus === tab.key
                ? 'bg-gradient-to-r from-purple-600 to-teal-400 text-white shadow-lg shadow-purple-600/30'
                : 'glass-card text-purple-300/80 hover:text-white hover:border-purple-400/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
          <p className="text-xs text-purple-300">Syncing live canteen database...</p>
        </div>
      )}

      {!loading && filteredOrders.length === 0 && (
        <div className="glass-card rounded-3xl border border-purple-500/20 p-12 text-center max-w-md mx-auto">
          <Clock className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No orders found</h3>
          <p className="text-xs text-purple-300/70 mt-1">
            {searchQuery
              ? `No orders match your query "${searchQuery}".`
              : 'There are currently no orders in this queue.'}
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

            const displayNum = order.orderNumber
              ? `#${order.orderNumber}`
              : order.tokenNumber
              ? `#${order.tokenNumber}`
              : '#1';

            return (
              <div
                key={order.orderId}
                className={`glass-card rounded-3xl border transition-all p-5 shadow-xl flex flex-col justify-between ${
                  isReady
                    ? 'border-teal-400 ring-2 ring-teal-400/30 bg-teal-950/20'
                    : isPreparing
                    ? 'border-purple-400 ring-1 ring-purple-400/30'
                    : isPending
                    ? 'border-amber-400/60'
                    : 'border-purple-500/20'
                }`}
              >
                <div>
                  {/* Top Header: Order Number & Customer Name */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-950 to-teal-950 border border-teal-400/40 shadow-sm flex items-center justify-center">
                        <span className="font-mono font-black text-2xl text-teal-300">
                          {displayNum}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-purple-300" />
                          <span className="text-sm font-bold text-white block">
                            {order.customerName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-teal-300/90 mt-0.5">
                          <Phone className="w-3 h-3 text-purple-400" />
                          <span>{order.customerPhone || order.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold capitalize px-2.5 py-1 rounded-full ${
                        isReady
                          ? 'bg-teal-400 text-[#090816] font-black animate-pulse'
                          : isPreparing
                          ? 'bg-purple-500/30 text-purple-200 border border-purple-500/40'
                          : isPending
                          ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40'
                          : isCompleted
                          ? 'bg-purple-950/40 text-purple-400 border border-purple-500/20'
                          : 'bg-rose-500/30 text-rose-200 border border-rose-500/40'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Timestamp & Payment info */}
                  <div className="flex items-center justify-between text-[11px] text-purple-300/70 pb-2.5 border-b border-purple-500/15">
                    <span>
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="font-semibold text-teal-300 bg-teal-950/50 border border-teal-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      {order.paymentMethod ? (
                        <span>{order.paymentMethod}</span>
                      ) : (
                        <QrCode className="w-3 h-3" />
                      )}
                      <span>• ₹{order.totalAmount}</span>
                    </span>
                  </div>

                  {/* Special Kitchen Notes if any */}
                  {order.notes && (
                    <div className="my-2 p-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-[11px] text-amber-300">
                      <span className="font-bold">Note:</span> {order.notes}
                    </div>
                  )}

                  {/* Items List */}
                  <div className="py-3 space-y-2 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-purple-100">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-teal-300 bg-purple-900/60 border border-purple-500/20 px-1.5 py-0.5 rounded">
                            {item.quantity}×
                          </span>
                          <span className="font-medium text-white">{item.name}</span>
                        </div>
                        <span className="font-semibold text-purple-300">₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kitchen Action Buttons */}
                <div className="pt-3 border-t border-purple-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <button
                        onClick={() => handleStatusUpdate(order.orderId, 'accepted')}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition active:scale-98"
                      >
                        Accept Order
                      </button>
                    )}

                    {isAccepted && (
                      <button
                        onClick={() => handleStatusUpdate(order.orderId, 'preparing')}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Start Cooking</span>
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => handleStatusUpdate(order.orderId, 'ready')}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/30 transition flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <Bell className="w-4 h-4" />
                        <span>Order Ready (Call Token)</span>
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => handleStatusUpdate(order.orderId, 'completed')}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-teal-400 hover:from-purple-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Handed to Student</span>
                      </button>
                    )}

                    {/* Reject Button (Only for pending / accepted) */}
                    {(isPending || isAccepted) && (
                      <button
                        onClick={() => setRejectModalOrder(order)}
                        className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-rose-950/50 border border-purple-500/20 hover:border-rose-500/40 text-purple-300 hover:text-rose-400 transition"
                        title="Reject / Cancel"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card max-w-sm w-full p-6 rounded-3xl border border-rose-500/40 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Ban className="w-5 h-5 text-rose-400" />
              <span>Cancel Order {rejectModalOrder.orderNumber ? `#${rejectModalOrder.orderNumber}` : rejectModalOrder.tokenNumber}?</span>
            </h3>
            <p className="text-xs text-purple-200">
              Customer: <span className="font-bold text-white">{rejectModalOrder.customerName}</span> ({rejectModalOrder.customerPhone || 'No Phone'})
            </p>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Cancellation Reason
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-purple-950/60 border border-purple-500/30 rounded-xl text-white outline-none"
              >
                <option value="Item currently out of stock">Item currently out of stock</option>
                <option value="Kitchen closing down for the day">Kitchen closing down for the day</option>
                <option value="Payment verification issue">Payment verification issue</option>
                <option value="Requested by student">Requested by student</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRejectModalOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-purple-950/40 text-purple-300 text-xs font-semibold hover:bg-purple-900"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
