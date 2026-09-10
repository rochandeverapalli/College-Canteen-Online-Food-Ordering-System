import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Ban,
  ArrowLeft,
  Flame,
  ChefHat,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { Order } from '../types';
import {
  subscribeToOrderById,
  updateOrderStatus,
} from '../firebase/firestore';
import { OrderStatusStepper } from '../components/OrderStatusStepper';

export const TrackOrder: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = subscribeToOrderById(orderId, (updatedOrder) => {
      setOrder(updatedOrder);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order || order.orderStatus !== 'pending') return;
    const confirmed = window.confirm(
      'Are you sure you want to cancel this order? Since it has not been accepted yet, payment will be refunded.'
    );
    if (!confirmed) return;

    setCancelling(true);
    try {
      await updateOrderStatus(order.orderId, 'cancelled');
    } catch (e) {
      console.error('Error cancelling order:', e);
    } finally {
      setCancelling(false);
    }
  };

  const displayOrderNum = order?.orderNumber
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
        <p className="text-sm font-medium text-purple-300">
          Connecting to live canteen counter stream...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-card rounded-3xl border border-purple-500/30 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
        <p className="text-xs text-purple-300/70 mb-6">
          The requested order does not exist or has expired.
        </p>
        <Link
          to="/orders"
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-teal-400 text-white font-bold rounded-xl text-xs shadow-md"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  const isPending = order.orderStatus === 'pending';
  const isPreparing = order.orderStatus === 'preparing';
  const isReady = order.orderStatus === 'ready';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-28 space-y-6">
      {/* Back button & status ping */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Orders</span>
        </Link>
        <span className="text-[11px] text-teal-300 font-semibold flex items-center gap-1.5 bg-teal-950/50 border border-teal-500/30 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          Real-Time Canteen Sync Active
        </span>
      </div>

      {/* Main Status & Token Card */}
      <div className="glass-card rounded-3xl border border-purple-500/20 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Urgent Attention Ready Banner */}
        {isReady && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 flex items-center gap-3 shadow-xl shadow-teal-500/30 animate-pulse">
            <Flame className="w-7 h-7 shrink-0 text-amber-900" />
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider">
                Order is Hot & Ready for Pickup!
              </h4>
              <p className="text-xs font-semibold text-slate-900">
                Please proceed to Canteen Counter with Order {displayOrderNum}.
              </p>
            </div>
          </div>
        )}

        {isPreparing && (
          <div className="p-4 rounded-2xl bg-purple-900/40 border border-purple-500/30 text-purple-200 flex items-center gap-3">
            <ChefHat className="w-6 h-6 shrink-0 text-teal-300 animate-pulse" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-teal-300">
                Kitchen Preparing Your Food
              </h4>
              <p className="text-xs text-purple-300/80">
                Chef is preparing your meal fresh. Estimated ~{order.estimatedTime || 10} minutes.
              </p>
            </div>
          </div>
        )}

        {/* Order Number Display */}
        <div className="text-center py-6 bg-gradient-to-br from-purple-950/60 to-indigo-950/60 rounded-3xl border border-purple-500/30 shadow-inner">
          <span className="text-xs uppercase font-extrabold text-teal-300 tracking-widest block mb-1">
            Sequential Order Number
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-white to-purple-200 font-mono tracking-tight">
              {displayOrderNum}
            </span>
            <button
              onClick={copyToken}
              className="p-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-teal-300 transition"
              title="Copy order number"
            >
              {copied ? <Check className="w-5 h-5 text-teal-300" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-purple-300/80 mt-2">
            Customer: <strong className="text-white">{order.customerName}</strong> • Phone: {order.customerPhone || order.phone || 'N/A'}
          </p>
        </div>

        {/* 5-Step Order Progress Stepper */}
        <div>
          <OrderStatusStepper status={order.orderStatus} />
        </div>

        {/* Order Items Breakdown */}
        <div className="pt-4 border-t border-purple-500/20 space-y-2">
          <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
            Order Items
          </h4>
          <div className="space-y-1.5 divide-y divide-purple-500/10">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs sm:text-sm pt-1.5"
              >
                <span className="text-purple-200">
                  <strong className="text-teal-300 font-bold mr-2">{item.quantity}×</strong>
                  {item.name}
                </span>
                <span className="font-bold text-white">₹{item.subtotal}</span>
              </div>
            ))}
            <div className="flex justify-between items-baseline pt-3 border-t border-purple-500/20 font-black text-base text-white">
              <span>Total Paid</span>
              <span className="text-teal-300">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Cancellation if still pending */}
        {isPending && (
          <div className="pt-4 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-purple-300/70">
              Order not yet started by kitchen. You may cancel it if needed.
            </p>
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2 rounded-xl bg-purple-950/60 hover:bg-rose-950/60 border border-purple-500/30 hover:border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{cancelling ? 'Cancelling...' : 'Cancel Order'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
