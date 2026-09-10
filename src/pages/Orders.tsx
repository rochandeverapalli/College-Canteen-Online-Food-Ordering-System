import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Search,
  Phone,
  User,
  ChevronRight,
  Flame,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Order } from '../types';
import { useCart } from '../context/CartContext';
import { subscribeToAllOrders, getFoodItems } from '../firebase/firestore';

export const Orders: React.FC = () => {
  const { addItem } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'my' | 'all'>('my');

  // Stored customer phone or manual phone filter
  const [phoneSearch, setPhoneSearch] = useState(() => {
    return localStorage.getItem('canteen_last_customer_phone') || '';
  });

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders((data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Filter orders
  const myFilteredOrders = orders.filter((o) => {
    if (!phoneSearch.trim()) {
      // If no phone entered, check if the order matches the last order ID placed on this device
      const lastId = localStorage.getItem('canteen_last_order_id');
      if (lastId && o.orderId === lastId) return true;
      return false;
    }
    const cleanSearch = phoneSearch.replace(/\D/g, '');
    const cleanOrderPhone = (o.customerPhone || o.phone || '').replace(/\D/g, '');
    return cleanOrderPhone.includes(cleanSearch) || (o.customerName || '').toLowerCase().includes(phoneSearch.toLowerCase());
  });

  const displayedOrders = tab === 'my' ? myFilteredOrders : orders;

  const handleReorder = async (order: Order) => {
    const allFoods = await getFoodItems();
    let countAdded = 0;
    order.items.forEach((item) => {
      const match = allFoods.find((f) => f.id === item.foodId);
      if (match && match.available) {
        addItem(match, item.quantity);
        countAdded++;
      }
    });
    alert(`Added ${countAdded} item(s) to your cart.`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>Orders & Token Status</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
              Live Feed
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80 mt-1">
            Track your sequential order number or search by your mobile number.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-purple-950/50 p-1 rounded-2xl border border-purple-500/20">
          <button
            onClick={() => setTab('my')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'my'
                ? 'bg-gradient-to-r from-purple-600 to-teal-400 text-white shadow-md'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            My Orders ({myFilteredOrders.length})
          </button>
          <button
            onClick={() => setTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-teal-400 text-white shadow-md'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            Counter Board ({orders.length})
          </button>
        </div>
      </div>

      {/* Mobile Search input */}
      <div className="glass-card rounded-2xl p-4 border border-purple-500/20 mb-6 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by your Mobile Number (e.g. 9876543210) or Name..."
            value={phoneSearch}
            onChange={(e) => {
              setPhoneSearch(e.target.value);
              if (tab !== 'my') setTab('my');
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-white text-xs placeholder-purple-300/40 focus:outline-none focus:border-teal-400"
          />
        </div>
        {phoneSearch && (
          <button
            onClick={() => setPhoneSearch('')}
            className="text-xs text-purple-300 hover:text-teal-300 font-semibold px-2 py-1"
          >
            Clear Filter
          </button>
        )}
      </div>

      {loading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
          <p className="text-xs text-purple-300">Fetching live orders...</p>
        </div>
      )}

      {!loading && displayedOrders.length === 0 && (
        <div className="glass-card rounded-3xl border border-purple-500/20 p-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-900/40 border border-purple-500/30 text-teal-300 flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-base font-bold text-white">
            {phoneSearch ? 'No orders found for this number' : 'No active orders tracked on this device'}
          </h3>
          <p className="text-xs text-purple-300/70 mt-1 mb-6">
            {phoneSearch
              ? 'Please verify your mobile number or view the counter board.'
              : 'Place an order from the canteen menu to receive your instant token.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => setTab('all')}
              className="px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-teal-300 text-xs font-semibold hover:bg-purple-900"
            >
              View Live Counter Board
            </button>
            <Link
              to="/menu"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-teal-400 text-white font-bold text-xs shadow-md transition"
            >
              <span>Explore Today's Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {!loading && displayedOrders.length > 0 && (
        <div className="space-y-4">
          {displayedOrders.map((order) => {
            const isReady = order.orderStatus === 'ready';
            const isPreparing = order.orderStatus === 'preparing';
            const isPending = order.orderStatus === 'pending';

            const displayNum = order.orderNumber
              ? `#${order.orderNumber}`
              : order.tokenNumber
              ? `#${order.tokenNumber}`
              : '#1';

            return (
              <div
                key={order.orderId}
                className={`glass-card rounded-3xl border transition-all p-5 shadow-xl ${
                  isReady
                    ? 'border-teal-400 ring-2 ring-teal-400/20 bg-teal-950/20'
                    : 'border-purple-500/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/15">
                  <div className="flex items-center gap-3">
                    <div className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-br from-purple-900 to-teal-950 border border-teal-400/40 text-teal-300 font-mono font-black text-xl sm:text-2xl shadow-sm">
                      {displayNum}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {order.customerName}
                        </span>
                        <span
                          className={`text-xs font-bold capitalize px-2.5 py-0.5 rounded-full ${
                            isReady
                              ? 'bg-teal-400 text-[#090816] font-black animate-pulse'
                              : isPreparing
                              ? 'bg-purple-500/30 text-purple-200 border border-purple-500/40'
                              : order.orderStatus === 'completed'
                              ? 'bg-purple-950/40 text-purple-400'
                              : isPending
                              ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40'
                              : 'bg-rose-500/30 text-rose-200'
                          }`}
                        >
                          {order.orderStatus === 'ready' ? 'Ready for Pickup!' : order.orderStatus}
                        </span>
                      </div>
                      <span className="text-xs text-purple-300/70 block mt-0.5">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Phone: {order.customerPhone || order.phone || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-lg font-black text-white">
                      ₹{order.totalAmount}
                    </span>
                    <span className="block text-[11px] text-teal-300 font-medium">
                      {order.paymentMethod || 'Paid'}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="py-3 text-xs text-purple-200 space-y-1.5">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        <strong className="text-teal-300 mr-1.5">{it.quantity}×</strong>
                        {it.name}
                      </span>
                      <span className="text-purple-300">₹{it.subtotal}</span>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="pt-3 border-t border-purple-500/15 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-purple-300/70">
                    Est. prep: ~{order.estimatedTime || 10}m
                  </span>

                  <div className="flex items-center gap-2">
                    {order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
                      <Link
                        to={`/track/${order.orderId}`}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-teal-400 hover:from-purple-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                      >
                        <span>Live Track</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/20 text-purple-200 font-semibold text-xs transition flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-teal-400" />
                      <span>Order Again</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
