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
      .filter((o) => o.paymentStatus === 'paid' && o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Canteen Analytics & Financials
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Real-time insights into revenue, popular dishes, and peak campus rush hours
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl">
          <button
            onClick={() => setDateRange('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              dateRange === 'today' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              dateRange === 'week' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              dateRange === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-stone-950 block">₹{totalRevenue}</span>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            100% verified online payment
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Orders Handled</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-stone-950 block">
            {filteredOrders.length}
          </span>
          <span className="text-[11px] text-stone-400 font-medium block">
            {completedOrdersCount} successfully collected
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Average Order</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-stone-950 block">₹{avgOrderValue}</span>
          <span className="text-[11px] text-stone-400 font-medium block">
            Per student transaction
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Prep Speed</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-stone-950 block">~12m</span>
          <span className="text-[11px] text-stone-400 font-medium block">
            Kitchen turnaround time
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Peak Rush Hours Visual Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Hourly Student Order Traffic
              </h3>
              <p className="text-xs text-stone-400">
                Identify lunch rush vs snack break peaks across the canteen day
              </p>
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              Counter Traffic
            </span>
          </div>

          {/* Bar chart visualization */}
          <div className="pt-6 pb-2">
            <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-48 border-b border-stone-200 pb-2">
              {hourlyData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none z-10">
                    {item.count} orders
                  </div>
                  <div className="w-full bg-stone-100 rounded-t-lg h-full flex items-end">
                    <div
                      className="w-full bg-amber-500 hover:bg-amber-600 rounded-t-lg transition-all duration-300"
                      style={{
                        height: `${Math.max(item.percent, item.count > 0 ? 8 : 2)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono rotate-45 sm:rotate-0 mt-1 whitespace-nowrap">
                    {item.hour.replace(' ', '')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 5 Most Ordered Items */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-stone-900">
              Top 5 Best-Selling Dishes
            </h3>
          </div>

          {topItems.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-xs">
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
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-stone-900">{item.name}</span>
                      </div>
                      <span className="font-black text-stone-800">
                        {item.count} ordered (₹{item.revenue})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
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
