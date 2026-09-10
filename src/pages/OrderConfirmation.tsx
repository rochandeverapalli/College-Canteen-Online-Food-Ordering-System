import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Utensils,
  Receipt,
  Copy,
  Check,
  Phone,
  Sparkles,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { subscribeToSingleOrder } from '../firebase/firestore';
import { Order } from '../types';

export const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const unsub = subscribeToSingleOrder(
      orderId,
      (data) => {
        setOrder(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    return () => unsub();
  }, [orderId]);

  const displayOrderNumber = order?.orderNumber
    ? `#${order.orderNumber}`
    : order?.tokenNumber
    ? `#${order.tokenNumber}`
    : '#1';

  const copyToken = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber ? String(order.orderNumber) : order.tokenNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
        <p className="text-purple-300 font-medium text-sm">Generating your sequential token number...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 glass-card rounded-3xl border border-purple-500/25">
        <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
        <p className="text-purple-300/70 text-sm mb-6">Could not locate this order record.</p>
        <Link
          to="/menu"
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-teal-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-600/30"
        >
          Return to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-28">
      {/* Confirmation Glass Card */}
      <div className="glass-card rounded-3xl border border-purple-500/30 shadow-[0_16px_50px_rgba(124,58,237,0.25)] overflow-hidden text-center p-6 sm:p-9 space-y-7 relative">
        {/* Ambient background glows */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Success Icon */}
        <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-purple-600 to-teal-400 p-0.5 mx-auto shadow-xl shadow-teal-400/20">
          <div className="w-full h-full bg-[#0b081e] rounded-[22px] flex items-center justify-center text-teal-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 text-xs uppercase font-extrabold tracking-widest text-teal-300 bg-teal-950/60 border border-teal-500/30 px-3.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> Order Placed • Sent to Kitchen
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
            Thank you, {order.customerName}!
          </h1>
          <p className="text-purple-200/80 text-xs sm:text-sm mt-1">
            Your order has been queued in the canteen system.
          </p>
        </div>

        {/* Massive Sequential Order Number Card */}
        <div className="bg-gradient-to-br from-purple-900/40 via-indigo-950/50 to-teal-950/40 border-2 border-dashed border-teal-400/50 rounded-3xl p-6 relative group shadow-[0_8px_30px_rgba(45,212,191,0.15)]">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold text-teal-300 tracking-widest">
              Sequential Order Number
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 my-2">
            <span className="text-6xl sm:text-7xl font-black tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-white to-purple-200 drop-shadow-md">
              {displayOrderNumber}
            </span>
            <button
              onClick={copyToken}
              className="p-3 rounded-2xl bg-purple-900/60 hover:bg-purple-800 border border-purple-500/30 text-teal-300 transition-all hover:scale-105 active:scale-95"
              title="Copy Order Number"
            >
              {copied ? <Check className="w-5 h-5 text-teal-300" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-purple-200 font-medium mt-2">
            <span>Callout on Counter Display:</span>
            <span className="px-2 py-0.5 rounded-md bg-purple-900/80 font-mono font-bold text-teal-300">
              Order {displayOrderNumber}
            </span>
          </div>

          <p className="text-[11px] text-purple-300/70 mt-2">
            Save or screenshot this order number to collect your hot meal at the counter.
          </p>
        </div>

        {/* Customer & Order Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-purple-950/40 border border-purple-500/20 rounded-2xl p-4 text-left text-xs">
          <div>
            <span className="text-purple-300/70 block font-medium">Customer</span>
            <span className="font-bold text-white text-sm truncate block mt-0.5">
              {order.customerName}
            </span>
          </div>
          <div>
            <span className="text-purple-300/70 block font-medium">Mobile Number</span>
            <span className="font-mono font-bold text-teal-300 text-sm flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 text-purple-400" />
              {order.customerPhone || order.phone || 'N/A'}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-purple-300/70 block font-medium">Est. Prep Time</span>
            <span className="font-bold text-white flex items-center gap-1 mt-0.5 text-sm">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              ~{order.estimatedTime || 10} mins
            </span>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-900/30 border border-purple-500/20 text-xs">
          <div className="flex items-center gap-2 text-purple-200 font-medium">
            <Activity className="w-4 h-4 text-teal-400 animate-pulse" />
            <span>Kitchen Live Status:</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold uppercase tracking-wider text-[11px]">
            {order.orderStatus === 'pending'
              ? 'Order Received'
              : order.orderStatus === 'preparing'
              ? 'Chef Preparing'
              : order.orderStatus === 'ready'
              ? 'Ready for Counter Pickup'
              : order.orderStatus}
          </span>
        </div>

        {/* Ordered items breakdown */}
        <div className="text-left border-t border-purple-500/20 pt-4">
          <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-teal-400" />
            <span>Ordered Items Breakdown</span>
          </h4>
          <div className="space-y-2 divide-y divide-purple-500/10">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs pt-1.5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-teal-300">{item.quantity}×</span>
                  <span className="font-medium text-white">{item.name}</span>
                </div>
                <span className="font-bold text-purple-200">₹{item.subtotal}</span>
              </div>
            ))}
            <div className="flex justify-between text-base font-black text-white pt-3">
              <span>Total Bill</span>
              <span className="text-teal-300">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            to={`/track/${order.orderId}`}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-400 hover:from-purple-500 hover:to-teal-300 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Live Track Order</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/menu"
            className="w-full py-3.5 px-6 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 hover:text-white font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <Utensils className="w-4 h-4 text-teal-400" />
            <span>Order More Food</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
