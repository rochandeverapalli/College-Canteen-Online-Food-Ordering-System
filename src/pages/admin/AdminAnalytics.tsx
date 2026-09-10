import React, { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Calendar,
  DollarSign,
  Award,
  Users,
} from 'lucide-react';
import { Order } from '../../types';
import { subscribeToAllOrders } from '../../firebase/firestore';

export const AdminAnalytics: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week'>('all');

  useEffect(() => {
    const unsub = subscribeToAllOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredOrders = useMemo(() => {
    if (dateRange === 'all') return orders;

    const now = new Date();
    const todayStr = now.toDateString();

    if (dateRange === 'today') {
      return orders.filter((o) => new Date(o.createdAt).toDateString() === todayStr);
    }

    if (dateRange === 'week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return orders.filter((o) => new Date(o.createdAt) >= sevenDaysAgo);
    }

    return orders;
  }, [orders, dateRange]);

  // Calculations
  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o.orderStatus !== 'rejected' && o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [filteredOrders]);

  const completedOrdersCount = useMemo(() => {
    return filteredOrders.filter((o) => o.orderStatus === 'completed').length;
  }, [filteredOrders]);

  const avgOrderValue = useMemo(() => {
    return filteredOrders.length > 0 ? Math.round(totalRevenue / filteredOrders.length) : 0;
  }, [filteredOrders, totalRevenue]);

  // Top ordered food items
  const topItems = useMemo(() => {
    const itemMap = new Map<string, { name: string; count: number; revenue: number }>();

    filteredOrders.forEach((o) => {
      if (o.orderStatus === 'cancelled' || o.orderStatus === 'rejected') return;
      o.items.forEach((it) => {
        const existing = itemMap.get(it.name) || { name: it.name, count: 0, revenue: 0 };
        existing.count += it.quantity;
        existing.revenue += it.subtotal;
        itemMap.set(it.name, existing);
      });
    });

    return Array.from(itemMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredOrders]);

  // Peak Ordering Hours (8 AM to 8 PM)
  const hourlyData = useMemo(() => {
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const counts: Record<number, number> = {};
    hours.forEach((h) => (counts[h] = 0));

    filteredOrders.forEach((o) => {
      const h = new Date(o.createdAt).getHours();
      if (counts[h] !== undefined) {
        counts[h]++;
      }
    });

    const maxVal = Math.max(...Object.values(counts), 1);

    return hours.map((h) => {
      const displayHour = h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`;
      const count = counts[h];
      const percent = (count / maxVal) * 100;
      return { hour: displayHour, count, percent };
    });
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-3xl border border-purple-500/20 p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Canteen Analytics & Financials
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80 mt-1">
            Real-time insights into canteen income, top ordered meals, and rush hours
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-purple-950/60 border border-purple-500/30 p-1 rounded-2xl">
          <button
            onClick={() => setDateRange('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              dateRange === 'today'
                ? 'bg-gradient-to-r from-purple-600 to-teal-400 text-white shadow-md'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              dateRange === 'week'
                ? 'bg-gradient-to-r from-purple-600 to-teal-400 text-white shadow-md'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              dateRange === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-teal-400 text-white shadow-md'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-3xl border border-purple-500/20 p-6 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-purple-300">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-white block">
            ₹{totalRevenue}
          </span>
          <span className="text-[11px] text-teal-300 font-semibold block">
            Online & counter payments
          </span>
        </div>

        <div className="glass-card rounded-3xl border border-purple-500/20 p-6 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-purple-300">
            <span className="text-xs font-bold uppercase tracking-wider">Orders Handled</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-white block">
            {filteredOrders.length}
          </span>
          <span className="text-[11px] text-purple-300/70 font-medium block">
            {completedOrdersCount} successfully collected
          </span>
        </div>

        <div className="glass-card rounded-3xl border border-purple-500/20 p-6 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-purple-300">
            <span className="text-xs font-bold uppercase tracking-wider">Average Order</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-white block">₹{avgOrderValue}</span>
          <span className="text-[11px] text-purple-300/70 font-medium block">
            Per customer transaction
          </span>
        </div>

        <div className="glass-card rounded-3xl border border-purple-500/20 p-6 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-purple-300">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Prep Speed</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-white block">~10m</span>
          <span className="text-[11px] text-purple-300/70 font-medium block">
            Kitchen turnaround time
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Peak Rush Hours Visual Chart */}
        <div className="lg:col-span-7 glass-card rounded-3xl border border-purple-500/20 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Hourly Student Order Traffic
              </h3>
              <p className="text-xs text-purple-300/70">
                Identify lunch rush vs snack break peaks across the canteen day
              </p>
            </div>
            <span className="text-[11px] font-bold text-teal-300 bg-teal-950/50 border border-teal-500/30 px-2.5 py-1 rounded-full">
              Kitchen Traffic
            </span>
          </div>

          {/* Bar chart visualization */}
          <div className="pt-6 pb-2">
            <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-48 border-b border-purple-500/20 pb-2">
              {hourlyData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none z-10 border border-purple-500/30">
                    {item.count} orders
                  </div>
                  <div className="w-full bg-purple-950/40 rounded-t-lg h-full flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-teal-400 hover:from-purple-500 hover:to-teal-300 rounded-t-lg transition-all duration-300"
                      style={{
                        height: `${Math.max(item.percent, item.count > 0 ? 10 : 2)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-purple-300 font-mono rotate-45 sm:rotate-0 mt-1 whitespace-nowrap">
                    {item.hour.replace(' ', '')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 5 Most Ordered Items */}
        <div className="lg:col-span-5 glass-card rounded-3xl border border-purple-500/20 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">
              Top 5 Best-Selling Dishes
            </h3>
          </div>

          {topItems.length === 0 ? (
            <div className="text-center py-10 text-purple-300/60 text-xs">
              No dish order volume data available for this range yet.
            </div>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, idx) => {
                const maxVol = topItems[0]?.count || 1;
                const ratio = Math.round((item.count / maxVol) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white">{item.name}</span>
                      </div>
                      <span className="font-black text-teal-300">
                        {item.count} ordered (₹{item.revenue})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-purple-950/60 rounded-full overflow-hidden border border-purple-500/20">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-teal-400 rounded-full"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
