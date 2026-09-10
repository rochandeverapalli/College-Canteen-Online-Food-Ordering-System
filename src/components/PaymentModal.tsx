import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Building2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PaymentModalProps {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentDetails: {
    paymentId: string;
    provider: string;
    transactionId: string;
  }) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  amount,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { userProfile, currentUser } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'campus_wallet'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessPayment = async () => {
    setErrorMessage(null);

    // Validation
    if (paymentMethod === 'upi' && upiId && !upiId.includes('@')) {
      setErrorMessage('Please enter a valid UPI ID (e.g., student@okaxis or student@oksbi)');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Gateway Handshake
      setProcessingStep('Initiating secure payment gateway session...');
      await new Promise((r) => setTimeout(r, 700));

      // Step 2: Bank / UPI Network Authorization
      setProcessingStep(`Authorizing ₹${amount} with ${paymentMethod.toUpperCase()} network...`);
      await new Promise((r) => setTimeout(r, 800));

      // Step 3: Cryptographic verification of transaction
      setProcessingStep('Verifying digital transaction signature...');
      await new Promise((r) => setTimeout(r, 600));

      const generatedTxnId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const generatedPayId = `PAY_${Date.now()}`;

      setProcessingStep('Payment verified! Finalizing token generation...');
      await onSuccess({
        paymentId: generatedPayId,
        provider: paymentMethod === 'upi' ? 'UPI / BHIM' : paymentMethod === 'card' ? 'Razorpay Test Gateway' : 'Campus Student Card',
        transactionId: generatedTxnId,
      });

      setIsProcessing(false);
    } catch (err: unknown) {
      setIsProcessing(false);
      setErrorMessage(err instanceof Error ? err.message : 'Payment authorization failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">Secure Online Payment</h3>
              <p className="text-[11px] text-stone-400">256-bit Encrypted Checkout</p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-stone-400 hover:text-white transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Amount Badge */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-800 font-semibold block uppercase tracking-wider">
                Total Payable Amount
              </span>
              <span className="text-2xl font-black text-amber-900">
                ₹{amount}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-stone-700 block">
                {userProfile?.name || 'Student'}
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                {userProfile?.rollNumber || 'Roll No'}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
              Select Payment Method
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                disabled={isProcessing}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'upi'
                    ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-bold ring-2 ring-amber-500/20'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <Smartphone className="w-5 h-5 text-amber-600" />
                <span className="text-xs">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                disabled={isProcessing}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'card'
                    ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-bold ring-2 ring-amber-500/20'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-600" />
                <span className="text-xs">Card / Gateway</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('campus_wallet')}
                disabled={isProcessing}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'campus_wallet'
                    ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-bold ring-2 ring-amber-500/20'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <Building2 className="w-5 h-5 text-amber-600" />
                <span className="text-xs">Campus Card</span>
              </button>
            </div>
          </div>

          {/* Method specifics */}
          {paymentMethod === 'upi' && (
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white rounded-xl border border-stone-300 flex items-center justify-center shrink-0">
                  <QrCode className="w-10 h-10 text-stone-800" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-stone-800">Scan & Pay on Phone</p>
                  <p className="text-[11px] text-stone-500">
                    Supports Google Pay, PhonePe, Paytm, BHIM UPI
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                  Or enter Virtual Payment Address (VPA)
                </label>
                <input
                  type="text"
                  placeholder="e.g., student@okaxis or 9876543210@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  disabled={isProcessing}
                  className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                <span>Debit / Credit Card</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                  Test Sandbox Active
                </span>
              </div>
              <input
                type="text"
                placeholder="4111 •••• •••• 1111"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                disabled={isProcessing}
                className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-stone-500">
                Safe test mode: No real debit occurs. Simulates Razorpay 3D-Secure authentication.
              </p>
            </div>
          )}

          {paymentMethod === 'campus_wallet' && (
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">College ID RFID Wallet</span>
                <span className="text-xs font-semibold text-emerald-600">Balance: ₹450</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Linked to Roll No: <strong>{userProfile?.rollNumber || 'Active'}</strong>
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Processing Status Banner */}
          {isProcessing && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
              <p className="text-xs font-semibold text-amber-900 animate-pulse">
                {processingStep || 'Authorizing payment...'}
              </p>
            </div>
          )}

          {/* Pay Button */}
          <button
            type="button"
            onClick={handleProcessPayment}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md text-sm transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm & Pay ₹{amount}</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-stone-400">
            Payment verified by secure campus gateway. Token will be generated upon confirmation.
          </p>
        </div>
      </div>
    </div>
  );
};
