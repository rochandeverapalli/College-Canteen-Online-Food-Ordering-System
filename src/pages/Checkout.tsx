import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Clock,
  AlertTriangle,
  ChevronLeft,
  User,
  Hash,
  Mail,
  Receipt,
  Loader2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  createOrder,
  generateNextTokenNumber,
  subscribeToCanteenSettings,
} from '../firebase/firestore';
import { CanteenSetting, Order } from '../types';
import { PaymentModal } from '../components/PaymentModal';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalAmount, subtotal, tax, clearCart, estimatedPrepTime } = useCart();
  const { currentUser, userProfile } = useAuth();

  const [canteenSettings, setCanteenSettings] = useState<CanteenSetting>({
    acceptingOrders: true,
  });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToCanteenSettings((settings) => {
      setCanteenSettings(settings);
    });
    return () => unsub();
  }, []);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePaymentSuccess = async (paymentDetails: {
    paymentId: string;
    provider: string;
    transactionId: string;
  }) => {
    if (!currentUser) return;
    setIsCreatingOrder(true);
    setErrorMessage(null);

    try {
      // 1. Generate unique canteen token number (e.g. C001, C002...)
      const tokenNumber = await generateNextTokenNumber();

      // 2. Prepare Order Payload
      const orderPayload: Omit<Order, 'id'> = {
        orderId: '', // assigned inside createOrder
        tokenNumber,
        userId: currentUser.uid,
        customerName: userProfile?.name || currentUser.displayName || 'College Student',
        rollNumber: userProfile?.rollNumber || 'COLLEGE-ID',
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
        paymentStatus: 'paid',
        paymentId: paymentDetails.paymentId,
        orderStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedTime: estimatedPrepTime,
      };

      // 3. Prepare Payment Record Payload
      const paymentPayload = {
        orderId: '',
        userId: currentUser.uid,
        amount: totalAmount,
        status: 'paid' as const,
        provider: paymentDetails.provider,
        transactionId: paymentDetails.transactionId,
        createdAt: new Date().toISOString(),
      };

      // 4. Save to Firestore
      const savedOrder = await createOrder(orderPayload, paymentPayload);

      // 5. Clear Cart & Navigate
      clearCart();
      setIsPaymentModalOpen(false);
      navigate(`/order-confirmation/${savedOrder.orderId}`);
    } catch (err: unknown) {
      console.error('Error completing order placement:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to finalize order in database. Please check connection.'
      );
      setIsCreatingOrder(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Back button */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          to="/cart"
          className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Checkout & Order Token
        </h1>
      </div>

      {/* Canteen closed warning */}
      {!canteenSettings.acceptingOrders && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <span className="font-bold block">Online ordering is temporarily closed!</span>
            The canteen staff has toggled online orders OFF temporarily due to high kitchen volume. Please try again in a few minutes.
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer details & Items */}
        <div className="md:col-span-7 space-y-6">
          {/* Customer Profile Details Card */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
              <User className="w-4 h-4 text-amber-500" />
              <span>Student Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-stone-400 block font-medium">Full Name</span>
                <span className="font-bold text-stone-900">
                  {userProfile?.name || currentUser?.displayName || 'Student'}
                </span>
              </div>
              <div>
                <span className="text-xs text-stone-400 block font-medium">Roll Number</span>
                <span className="font-bold text-stone-900 uppercase">
                  {userProfile?.rollNumber || 'Pending in Profile'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-stone-400 block font-medium">College Email</span>
                <span className="font-medium text-stone-700">
                  {currentUser?.email}
                </span>
              </div>
            </div>
          </div>

          {/* Ordered items breakdown */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
              <Receipt className="w-4 h-4 text-amber-500" />
              <span>Items in Token Order</span>
            </h3>

            <div className="divide-y divide-stone-100">
              {items.map((item) => (
                <div key={item.foodId} className="py-2.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-700">{item.quantity}×</span>
                    <span className="font-medium text-stone-900">{item.name}</span>
                  </div>
                  <span className="font-bold text-stone-900">₹{item.subtotal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Payment trigger card */}
        <div className="md:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-5 sticky top-24">
          <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
            Payment Summary
          </h3>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-900">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Tax (GST 5%)</span>
              <span className="font-semibold text-stone-900">₹{tax}</span>
            </div>
            <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
              <span className="text-base font-black text-stone-900">Payable Total</span>
              <span className="text-2xl font-black text-amber-900">₹{totalAmount}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1">
            <div className="flex items-center gap-2 font-bold text-stone-800">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Est. Prep Time: ~{estimatedPrepTime} mins</span>
            </div>
            <p className="text-[11px] text-stone-500">
              Token number will be generated immediately after payment confirmation.
            </p>
          </div>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={!canteenSettings.acceptingOrders || isCreatingOrder}
            className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
          >
            {isCreatingOrder ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Finalizing Order & Token...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay & Place Order • ₹{totalAmount}</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Payment Handshake • No Card Details Stored</span>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        amount={totalAmount}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
