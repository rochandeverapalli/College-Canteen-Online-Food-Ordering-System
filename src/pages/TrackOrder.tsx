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
      'Are you sure you want to cancel this order? Since it has not been accepted yet, payment will be refunded to your account.'
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

  const copyToken = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.tokenNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm font-medium text-stone-500">
          Connecting to live canteen counter stream...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-stone-200 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-2">Order Not Found</h2>
        <p className="text-xs text-stone-500 mb-6">
          The requested order does not exist or has expired.
        </p>
        <Link
          to="/orders"
          className="px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl text-xs"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  const isPending = order.orderStatus === 'pending';
  const isPreparing = order.orderStatus === 'preparing';
  const isReady = order.orderStatus === 'ready';
  const isCompleted = order.orderStatus === 'completed';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Orders</span>
        </Link>
        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Live Real-Time Sync Active
        </span>
      </div>

      {/* Main Status & Token Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Urgent Attention Ready Banner */}
        {isReady && (
          <div className="p-4 rounded-2xl bg-emerald-600 text-white flex items-center gap-3 shadow-lg shadow-emerald-600/20 animate-bounce">
            <Flame className="w-6 h-6 shrink-0 text-amber-300" />
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider">
                Order is Hot & Ready for Pickup!
              </h4>
              <p className="text-xs text-emerald-100">
                Please proceed to Canteen Counter 1 with Token #{order.tokenNumber}.
              </p>
            </div>
          </div>
        )}

        {isPreparing && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-3">
            <ChefHat className="w-6 h-6 shrink-0 text-amber-600 animate-pulse" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">
                Kitchen Preparing Your Food
              </h4>
              <p className="text-xs text-amber-700">
                Chef is cooking your items fresh. Estimated ~{order.estimatedTime || 10} minutes.
              </p>
            </div>
          </div>
        )}

        {/* Token Number Display */}
        <div className="text-center py-4 bg-stone-50 rounded-2xl border border-stone-200">
          <span className="text-xs uppercase font-bold text-stone-400 tracking-wider block mb-1">
            Counter Pickup Token
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl sm:text-5xl font-black text-stone-900 font-mono tracking-tight">
              #{order.tokenNumber}
            </span>
            <button
              onClick={copyToken}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 transition"
              title="Copy token"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.customerName} ({order.rollNumber})
          </p>
        </div>

        {/* 5-Step Order Progress Stepper */}
        <div>
          <OrderStatusStepper status={order.orderStatus} />
        </div>

        {/* Order Items Breakdown */}
        <div className="pt-4 border-t border-stone-100 space-y-2">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Order Items
          </h4>
          <div className="space-y-1">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs sm:text-sm py-1"
              >
                <span className="text-stone-800">
                  <strong className="text-stone-950 font-bold mr-2">{item.quantity}×</strong>
                  {item.name}
                </span>
                <span className="font-bold text-stone-900">₹{item.subtotal}</span>
              </div>
            ))}
            <div className="flex justify-between items-baseline pt-2 border-t border-stone-100 font-black text-sm text-stone-900">
              <span>Total Paid (Online)</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Cancellation if still pending */}
        {isPending && (
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-stone-500">
              Order not yet accepted by kitchen. You may cancel it if needed.
            </p>
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1.5 transition"
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
