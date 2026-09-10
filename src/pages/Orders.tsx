import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Flame,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { subscribeToStudentOrders, getFoodItems } from '../firebase/firestore';

export const Orders: React.FC = () => {
  const { currentUser } = useAuth();
  const { addItem } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToStudentOrders(currentUser.uid, (data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const activeOrders = orders.filter((o) =>
    ['pending', 'accepted', 'preparing', 'ready'].includes(o.orderStatus)
  );

  const completedOrders = orders.filter((o) =>
    ['completed', 'cancelled', 'rejected'].includes(o.orderStatus)
  );

  const displayedOrders = tab === 'active' ? activeOrders : completedOrders;

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            My Canteen Orders
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            View live tokens and past canteen meal receipts
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-stone-100 p-1 rounded-2xl">
          <button
            onClick={() => setTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === 'active'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Active Tokens ({activeOrders.length})
          </button>
          <button
            onClick={() => setTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === 'completed'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Past History ({completedOrders.length})
          </button>
        </div>
      </div>

      {loading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs text-stone-500">Loading your orders...</p>
        </div>
      )}

      {!loading && displayedOrders.length === 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-base font-bold text-stone-900">
            No {tab} orders found
          </h3>
          <p className="text-xs text-stone-500 mt-1 mb-6">
            {tab === 'active'
              ? 'You do not have any active meals currently cooking in the canteen.'
              : 'You have not completed any orders yet.'}
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition"
          >
            <span>Explore Today's Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {!loading && displayedOrders.length > 0 && (
        <div className="space-y-4">
          {displayedOrders.map((order) => {
            const isReady = order.orderStatus === 'ready';
            const isPreparing = order.orderStatus === 'preparing';

            return (
              <div
                key={order.orderId}
                className={`bg-white rounded-3xl border transition-all p-5 shadow-2xs hover:shadow-md ${
                  isReady
                    ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                    : 'border-stone-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-mono font-black text-lg sm:text-xl">
                      #{order.tokenNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold capitalize px-2.5 py-0.5 rounded-full ${
                            isReady
                              ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                              : isPreparing
                              ? 'bg-amber-100 text-amber-800'
                              : order.orderStatus === 'completed'
                              ? 'bg-stone-100 text-stone-700'
                              : order.orderStatus === 'cancelled' || order.orderStatus === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.orderStatus === 'ready' ? 'Ready for Pickup!' : order.orderStatus}
                        </span>
                        <span className="text-xs font-semibold text-stone-400">
                          • {new Date(order.createdAt).toLocaleDateString()} at{' '}
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-base font-black text-stone-900">
                      ₹{order.totalAmount}
                    </span>
                    <span className="block text-[11px] text-stone-400 font-medium capitalize">
                      {order.paymentStatus} (Online)
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="py-3 text-xs text-stone-600 space-y-1">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        <strong className="text-stone-900 mr-1.5">{it.quantity}×</strong>
                        {it.name}
                      </span>
                      <span className="text-stone-500">₹{it.subtotal}</span>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-stone-400">
                    Est. prep: ~{order.estimatedTime || 10}m
                  </span>

                  <div className="flex items-center gap-2">
                    {order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
                      <Link
                        to={`/track/${order.orderId}`}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                      >
                        <span>Track Live Status</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Reorder</span>
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
