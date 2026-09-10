import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Clock,
  AlertTriangle,
  ChevronLeft,
  User,
  Phone,
  Receipt,
  Loader2,
  Sparkles,
  QrCode,
  Banknote,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import {
  createOrder,
  subscribeToCanteenSettings,
} from '../firebase/firestore';
import { CanteenSetting, Order } from '../types';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalAmount, subtotal, tax, clearCart, estimatedPrepTime } = useCart();

  const [canteenSettings, setCanteenSettings] = useState<CanteenSetting>({
    acceptingOrders: true,
  });

  // Fresh inputs every time - NO login saving
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'counter' | 'card'>('upi');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToCanteenSettings((settings) => {
      setCanteenSettings(settings);
    });
    return () => unsub();
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 text-purple-300">
          <Receipt className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Tray is Empty</h2>
        <p className="text-purple-300/70 text-sm mb-6">
          Please pick your delicious food items from the menu before placing an order.
        </p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-teal-400 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 hover:shadow-teal-400/30 transition-all"
        >
          Explore Campus Menu
        </Link>
      </div>
    );
  }

  const validateForm = () => {
    const errors: { name?: string; phone?: string } = {};
    if (!customerName.trim()) {
      errors.name = 'Please enter your full name';
    } else if (customerName.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (!cleanPhone) {
      errors.phone = 'Please enter your mobile number';
    } else if (cleanPhone.length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const cleanPhone = mobileNumber.replace(/\D/g, '');

      // Prepare Order Payload
      const orderPayload: Omit<Order, 'id' | 'orderId'> = {
        tokenNumber: '', // assigned sequentially inside createOrder
        userId: `guest-${Date.now()}`,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        phone: cleanPhone,
        notes: orderNotes.trim() || undefined,
        items: items.map((i) => ({
          foodId: i.foodId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          subtotal: i.subtotal,
          isVeg: i.isVeg,
        })),
        subtotal,
        tax,
        totalAmount,
        paymentStatus: paymentMethod === 'counter' ? 'pending' : 'paid',
        paymentMethod: paymentMethod === 'upi' ? 'UPI / QR' : paymentMethod === 'counter' ? 'Counter Cash' : 'Card',
        paymentId: `PAY-${Date.now()}`,
        orderStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedTime: estimatedPrepTime,
      };

      // Atomic createOrder assigns consecutive orderNumber (1, 2, 3...)
      const savedOrder = await createOrder(orderPayload, {
        provider: paymentMethod === 'upi' ? 'Instant UPI' : paymentMethod === 'counter' ? 'Counter Cash' : 'Card Payment',
        transactionId: `TXN${Date.now()}`,
      });

      // Save phone and last order locally for convenience
      localStorage.setItem('canteen_last_order_id', savedOrder.orderId);
      localStorage.setItem('canteen_last_customer_phone', cleanPhone);

      clearCart();
      navigate(`/order-confirmation/${savedOrder.orderId}`);
    } catch (err: unknown) {
      console.error('Error placing order:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to generate sequential order number. Please check connection.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="p-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-purple-300 hover:text-white hover:border-teal-400 transition-all"
            title="Back to Cart"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Order Details & Token</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                Instant Token
              </span>
            </h1>
            <p className="text-xs text-purple-300/70 mt-0.5">
              Enter your name and mobile number to receive your official sequential order number.
            </p>
          </div>
        </div>
      </div>

      {/* Canteen closed alert */}
      {!canteenSettings.acceptingOrders && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-sm flex items-start gap-3 backdrop-blur-md">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <span className="font-bold block text-white">Online Ordering Paused</span>
            The kitchen is currently handling high volume. Please check back in a few minutes.
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: List of items ordered & Customer Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Ordered Items List */}
          <div className="glass-card rounded-3xl p-6 border border-purple-500/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-400" />
                <span>Items in Your Order ({items.length})</span>
              </h2>
              <Link to="/menu" className="text-xs font-semibold text-teal-300 hover:text-teal-200">
                + Add More
              </Link>
            </div>

            <div className="divide-y divide-purple-500/10 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.foodId} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-purple-900/60 border border-purple-500/30 flex items-center justify-center font-bold text-teal-300 text-xs shrink-0">
                      {item.quantity}×
                    </span>
                    <div>
                      <p className="font-semibold text-white leading-tight">{item.name}</p>
                      <p className="text-xs text-purple-300/60">₹{item.price} each</p>
                    </div>
                  </div>
                  <span className="font-bold text-white shrink-0">₹{item.subtotal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Customer Info Form (Asked every time - No login required) */}
          <div className="glass-card rounded-3xl p-6 border border-purple-500/20 shadow-xl space-y-5">
            <div className="border-b border-purple-500/20 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-teal-400" />
                <span>Customer Contact Information</span>
              </h2>
              <p className="text-xs text-purple-300/70 mt-1">
                Your order number will be linked to your mobile number and announced when ready.
              </p>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider mb-1.5">
                  Your Full Name <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                    }}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-purple-950/40 border ${
                      formErrors.name ? 'border-rose-500' : 'border-purple-500/30'
                    } focus:border-teal-400 text-white placeholder-purple-300/40 outline-none transition-all`}
                  />
                </div>
                {formErrors.name && (
                  <p className="text-xs text-rose-400 mt-1 font-medium">{formErrors.name}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-xs font-semibold text-purple-300/70">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setMobileNumber(val);
                      if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined });
                    }}
                    placeholder="9876543210"
                    className={`w-full pl-18 pr-4 py-3 rounded-xl bg-purple-950/40 border ${
                      formErrors.phone ? 'border-rose-500' : 'border-purple-500/30'
                    } focus:border-teal-400 text-white placeholder-purple-300/40 outline-none transition-all font-mono tracking-wider`}
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-xs text-rose-400 mt-1 font-medium">{formErrors.phone}</p>
                )}
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider mb-1.5">
                  Cooking Notes / Special Requests (Optional)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. Less spicy, extra coconut chutney, packing for take-away..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 focus:border-teal-400 text-white placeholder-purple-300/40 outline-none transition-all text-sm resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Method Selection & Sequential Order Number Callout */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          {/* Payment Method Selector */}
          <div className="glass-card rounded-3xl p-6 border border-purple-500/20 shadow-xl space-y-5">
            <h2 className="text-base font-bold text-white border-b border-purple-500/20 pb-3 flex items-center justify-between">
              <span>Select Payment Method</span>
              <span className="text-xs text-teal-300 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Instant Receipt
              </span>
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {/* UPI Option */}
              <label
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-purple-900/40 border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.2)]'
                    : 'bg-purple-950/30 border-purple-500/20 hover:border-purple-400/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Instant UPI / QR Code</p>
                    <p className="text-xs text-purple-300/70">Google Pay, PhonePe, Paytm, BHIM</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="w-4 h-4 text-teal-400 accent-teal-400"
                />
              </label>

              {/* Counter Cash Option */}
              <label
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'counter'
                    ? 'bg-purple-900/40 border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.2)]'
                    : 'bg-purple-950/30 border-purple-500/20 hover:border-purple-400/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Pay Cash at Counter</p>
                    <p className="text-xs text-purple-300/70">Pay when collecting your food token</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'counter'}
                  onChange={() => setPaymentMethod('counter')}
                  className="w-4 h-4 text-teal-400 accent-teal-400"
                />
              </label>

              {/* Card Option */}
              <label
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-purple-900/40 border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.2)]'
                    : 'bg-purple-950/30 border-purple-500/20 hover:border-purple-400/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Debit / Credit Card</p>
                    <p className="text-xs text-purple-300/70">Visa, Mastercard, RuPay</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="w-4 h-4 text-teal-400 accent-teal-400"
                />
              </label>
            </div>

            {/* Bill breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-purple-500/20 text-sm">
              <div className="flex justify-between text-purple-200">
                <span>Items Subtotal</span>
                <span className="font-semibold text-white">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-purple-200">
                <span>Campus Canteen GST (5%)</span>
                <span className="font-semibold text-white">₹{tax}</span>
              </div>
              <div className="pt-3 border-t border-purple-500/20 flex justify-between items-baseline">
                <span className="text-base font-bold text-white">Total Amount</span>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-purple-200">
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            {/* Prep Time Estimate */}
            <div className="p-3.5 rounded-2xl bg-purple-950/50 border border-purple-500/25 flex items-center gap-3 text-xs text-purple-200">
              <Clock className="w-5 h-5 text-teal-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Estimated Prep Time: ~{estimatedPrepTime} mins</span>
                <span className="text-[11px] text-purple-300/70">
                  Orders are prepared in consecutive sequential sequence (1, 2, 3...)
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={!canteenSettings.acceptingOrders || isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-400 hover:from-purple-500 hover:to-teal-300 text-white font-black text-base shadow-xl shadow-purple-600/35 hover:shadow-teal-400/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Assigning Order Number...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-teal-200" />
                  <span>Place Order & Get Token • ₹{totalAmount}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-purple-300/60">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>No login needed • Direct token on counter pickup</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
