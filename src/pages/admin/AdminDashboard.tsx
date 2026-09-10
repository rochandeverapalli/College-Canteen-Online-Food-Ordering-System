import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  ChefHat,
  Flame,
  CheckCircle2,
  TrendingUp,
  Power,
  ArrowRight,
  RefreshCw,
  Bell,
  AlertCircle,
  Database,
  Sparkles,
  User,
  Phone,
} from 'lucide-react';
import { Order, CanteenSetting } from '../../types';
import {
  subscribeToAllOrders,
  subscribeToCanteenSettings,
  updateCanteenSettings,
  updateOrderStatus,
  seedCanteenDemoData,
} from '../../firebase/firestore';

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<CanteenSetting>({ acceptingOrders: true });
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const unsubOrders = subscribeToAllOrders((data) => {
      setOrders(data);
      setLoading(false);
    });

    const unsubSettings = subscribeToCanteenSettings((s) => {
      setSettings(s);
    });

    return () => {
      unsubOrders();
      unsubSettings();
    };
  }, []);

  const handleToggleAccepting = async () => {
    setToggling(true);
    try {
      await updateCanteenSettings({
        acceptingOrders: !settings.acceptingOrders,
      });
    } catch (e) {
      console.error('Error toggling canteen status:', e);
    } finally {
      setToggling(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    await seedCanteenDemoData();
    setSeeding(false);
  };

  // Metrics calculation
  const today = new Date().toDateString();
  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === today
  );

  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending');
  const preparingOrders = orders.filter((o) => o.orderStatus === 'preparing');
  const readyOrders = orders.filter((o) => o.orderStatus === 'ready');
  const completedOrders = orders.filter((o) => o.orderStatus === 'completed');

  const todayRevenue = todayOrders
    .filter((o) => o.orderStatus !== 'rejected' && o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const activeQueue = orders
    .filter((o) => ['pending', 'accepted', 'preparing', 'ready'].includes(o.orderStatus))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-3xl border border-purple-500/20 p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Kitchen Operations Overview
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80 mt-1">
            Real-time live queue and canteen sales for today ({new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {orders.length < 5 && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-3.5 py-2 rounded-2xl bg-purple-900/60 hover:bg-purple-800 text-teal-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{seeding ? 'Seeding...' : 'Load 26+ Items'}</span>
            </button>
          )}

          {/* Toggle Canteen Open/Close */}
          <button
            onClick={handleToggleAccepting}
            disabled={toggling}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition shadow-md ${
              settings.acceptingOrders
                ? 'bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-teal-400/30'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{settings.acceptingOrders ? 'Counter Open (Accepting)' : 'Counter Paused'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Revenue */}
        <div className="glass-card rounded-3xl border border-purple-500/20 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              Today's Sales
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-white mt-2 block">
            ₹{todayRevenue}
          </span>
          <span className="text-[11px] text-purple-300/70 mt-1 block">
            {todayOrders.length} orders placed today
          </span>
        </div>

        {/* Pending Orders */}
        <div className="glass-card rounded-3xl border border-amber-500/30 bg-amber-950/10 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-amber-300 mt-2 block">
            {pendingOrders.length}
          </span>
          <span className="text-[11px] text-amber-200/70 mt-1 block">
            Needs counter acceptance
          </span>
        </div>

        {/* In Kitchen Preparing */}
        <div className="glass-card rounded-3xl border border-purple-500/30 bg-purple-950/10 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              In Kitchen
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-purple-200 mt-2 block">
            {preparingOrders.length}
          </span>
          <span className="text-[11px] text-purple-300/70 mt-1 block">
            Cooking right now
          </span>
        </div>

        {/* Ready for Pickup */}
        <div className="glass-card rounded-3xl border border-teal-500/30 bg-teal-950/15 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
              Ready for Callout
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-teal-300 mt-2 block">
            {readyOrders.length}
          </span>
          <span className="text-[11px] text-teal-200/70 mt-1 block">
            Awaiting student collection
          </span>
        </div>
      </div>

      {/* Active Kitchen Queue Section */}
      <div className="glass-card rounded-3xl border border-purple-500/20 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">
              Immediate Kitchen Priority Queue
            </h2>
            <p className="text-xs text-purple-300/70">
              Orders requiring immediate attention, prep, or counter handover
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-teal-300 hover:text-teal-200 flex items-center gap-1.5"
          >
            <span>View All Live Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 text-teal-400 animate-spin" />
            <span className="text-xs text-purple-300">Syncing live orders...</span>
          </div>
        )}

        {!loading && activeQueue.length === 0 && (
          <div className="py-12 text-center border border-dashed border-purple-500/20 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-teal-400/50 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">Kitchen Queue is Clear</h4>
            <p className="text-xs text-purple-300/70 mt-0.5">
              All placed meals have been prepared and collected.
            </p>
          </div>
        )}

        {!loading && activeQueue.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeQueue.map((order) => {
              const displayNum = order.orderNumber
                ? `#${order.orderNumber}`
                : order.tokenNumber
                ? `#${order.tokenNumber}`
                : '#1';

              return (
                <div
                  key={order.orderId}
                  className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xl text-teal-300 bg-purple-900/60 px-2.5 py-1 rounded-xl border border-teal-400/30">
                          {displayNum}
                        </span>
                        <div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-purple-300" />
                            <span className="text-xs font-bold text-white">
                              {order.customerName}
                            </span>
                          </div>
                          <span className="text-[10px] text-purple-300/70 font-mono">
                            {order.customerPhone || order.phone || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-black capitalize px-2 py-0.5 rounded-full ${
                          order.orderStatus === 'ready'
                            ? 'bg-teal-400 text-[#090816] animate-pulse'
                            : order.orderStatus === 'preparing'
                            ? 'bg-purple-500/30 text-purple-200'
                            : 'bg-amber-500/30 text-amber-200'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>

                    <div className="text-xs text-purple-200 space-y-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            <strong className="text-teal-300 mr-1">{it.quantity}×</strong>
                            {it.name}
                          </span>
                          <span className="text-purple-300/80">₹{it.subtotal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between">
                    <span className="text-xs font-black text-white">
                      ₹{order.totalAmount}
                    </span>
                    <Link
                      to="/admin/orders"
                      className="text-xs font-bold text-teal-300 hover:text-white flex items-center gap-1"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
