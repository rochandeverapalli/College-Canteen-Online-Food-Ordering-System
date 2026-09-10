import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Utensils,
  Receipt,
  Download,
  Share2,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { getOrderById } from '../firebase/firestore';
import { Order } from '../types';

export const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const fetch = async () => {
      const data = await getOrderById(orderId);
      setOrder(data);
      setLoading(false);
    };
    fetch();
  }, [orderId]);

  const copyToken = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.tokenNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-stone-500 font-medium text-sm">Retrieving your confirmed token...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-6 bg-white rounded-3xl border border-stone-200">
        <h2 className="text-xl font-bold text-stone-900 mb-2">Order Not Found</h2>
        <p className="text-stone-500 text-sm mb-6">Could not locate this order details.</p>
        <Link
          to="/menu"
          className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold"
        >
          Return to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-24">
      {/* Confirmation Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden text-center p-6 sm:p-8 space-y-6">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs uppercase font-black tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Payment Confirmed • Order Placed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-950 mt-3 tracking-tight">
            Thank you, {order.customerName}!
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Your order has been sent to the canteen kitchen counter.
          </p>
        </div>

        {/* Large Prominent Token Badge */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/70 border-2 border-dashed border-amber-400 rounded-3xl p-6 relative group">
          <span className="text-xs uppercase font-extrabold text-amber-800 tracking-wider block mb-1">
            Your Counter Pickup Token
          </span>

          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl sm:text-6xl font-black text-amber-950 tracking-tight font-mono">
              #{order.tokenNumber}
            </span>
            <button
              onClick={copyToken}
              className="p-2 rounded-xl bg-white/80 hover:bg-white text-amber-800 shadow-2xs transition"
              title="Copy Token Number"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <p className="text-xs text-amber-800/80 font-medium mt-2">
            Show this token number at the canteen collection counter.
          </p>
        </div>

        {/* Meta details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-stone-50 rounded-2xl p-4 text-left text-xs">
          <div>
            <span className="text-stone-400 block font-medium">Status</span>
            <span className="font-bold text-amber-700 capitalize">
              {order.orderStatus}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block font-medium">Payment</span>
            <span className="font-bold text-emerald-700 capitalize">
              {order.paymentStatus} (Online)
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-stone-400 block font-medium">Est. Prep Time</span>
            <span className="font-bold text-stone-800 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              ~{order.estimatedTime || 12} mins
            </span>
          </div>
        </div>

        {/* Ordered items breakdown */}
        <div className="text-left border-t border-stone-100 pt-4">
          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-stone-400" />
            <span>Ordered Items</span>
          </h4>
          <div className="space-y-1.5">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1 border-b border-stone-50"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-600">{item.quantity}×</span>
                  <span className="font-medium text-stone-900">{item.name}</span>
                </div>
                <span className="font-bold text-stone-800">₹{item.subtotal}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-black text-stone-950 pt-2">
              <span>Total Paid</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            to={`/track/${order.orderId}`}
            className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Live Track Order</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/menu"
            className="w-full py-3.5 px-6 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <Utensils className="w-4 h-4" />
            <span>Back to Menu</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
