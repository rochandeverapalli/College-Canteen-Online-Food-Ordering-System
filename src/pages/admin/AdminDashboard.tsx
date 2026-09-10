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
    .filter((o) => o.paymentStatus === 'paid' && o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeQueue = orders
    .filter((o) => ['pending', 'accepted', 'preparing', 'ready'].includes(o.orderStatus))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Kitchen Operations Overview
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Real-time live queue and canteen sales for today ({new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Toggle: Accepting Online Orders */}
          <button
            onClick={handleToggleAccepting}
            disabled={toggling}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-sm transition ${
              settings.acceptingOrders
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>
              {toggling
                ? 'Updating...'
                : settings.acceptingOrders
                ? 'Accepting Orders: ON'
                : 'Accepting Orders: PAUSED'}
            </span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Today */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs">
          <span className="text-xs text-stone-400 font-semibold block">Today's Orders</span>
          <span className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 block">
            {todayOrders.length}
          </span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">Total logged</span>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-2xs">
          <span className="text-xs text-blue-700 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-900 mt-1 block">
            {pendingOrders.length}
          </span>
          <span className="text-[11px] text-blue-600 mt-0.5 block">Awaiting accept</span>
        </div>

        {/* Preparing */}
        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-2xs">
          <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
            <ChefHat className="w-3.5 h-3.5" />
            Cooking
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-900 mt-1 block">
            {preparingOrders.length}
          </span>
          <span className="text-[11px] text-amber-600 mt-0.5 block">In kitchen</span>
        </div>

        {/* Ready for Pickup */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-2xs">
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            Ready
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1 block">
            {readyOrders.length}
          </span>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">At counter</span>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs">
          <span className="text-xs text-stone-500 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
          <span className="text-2xl sm:text-3xl font-black text-stone-800 mt-1 block">
            {completedOrders.length}
          </span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">Handed over</span>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-amber-100 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Revenue
          </span>
          <span className="text-2xl sm:text-3xl font-black mt-1 block">
            ₹{todayRevenue}
          </span>
          <span className="text-[11px] text-amber-100 mt-0.5 block">Collected online</span>
        </div>
      </div>

      {/* Active Orders Queue Preview */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-base font-bold text-stone-900">
              Live Kitchen Counter Queue ({activeQueue.length} Active)
            </h3>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>Manage All in Kitchen Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeQueue.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-stone-300 stroke-1" />
            <p className="text-sm font-semibold">Kitchen queue is clear right now!</p>
            <p className="text-xs text-stone-400 mt-0.5">
              New student orders will appear here instantaneously with token numbers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeQueue.map((order) => (
              <div
                key={order.orderId}
                className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-black text-xl text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg">
                      #{order.tokenNumber}
                    </span>
                    <span
                      className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        order.orderStatus === 'ready'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'preparing'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-stone-900">
                    {order.customerName}{' '}
                    <span className="font-mono text-stone-500 font-normal">
                      ({order.rollNumber})
                    </span>
                  </p>

                  <div className="mt-2 space-y-1 text-xs text-stone-700">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{i.quantity}× {i.name}</span>
                        <span className="font-semibold text-stone-900">₹{i.subtotal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1-Click Status buttons */}
                <div className="pt-2 border-t border-stone-200 flex items-center gap-2">
                  {order.orderStatus === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.orderId, 'accepted')}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                    >
                      Accept Order
                    </button>
                  )}
                  {order.orderStatus === 'accepted' && (
                    <button
                      onClick={() => updateOrderStatus(order.orderId, 'preparing')}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
                    >
                      Start Cooking
                    </button>
                  )}
                  {order.orderStatus === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.orderId, 'ready')}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      Mark Ready!
                    </button>
                  )}
                  {order.orderStatus === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.orderId, 'completed')}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold"
                    >
                      Hand Over
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demo helper if no orders yet */}
      {orders.length === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-center space-y-3">
          <Database className="w-8 h-8 text-amber-600 mx-auto" />
          <h4 className="text-base font-bold text-stone-900">No Orders in Database</h4>
          <p className="text-xs text-stone-600 max-w-md mx-auto">
            Place an order from the student menu to test the real-time live kitchen queue and token tracker.
          </p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl"
          >
            {seeding ? 'Seeding Menu...' : 'Seed Sample Canteen Menu Items'}
          </button>
        </div>
      )}
    </div>
  );
};
