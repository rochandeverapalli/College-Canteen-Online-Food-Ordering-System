import React from 'react';
import { Check, Clock, ChefHat, CheckCircle2, Flame, Ban, XCircle } from 'lucide-react';
import { OrderStatus } from '../types';

interface OrderStatusStepperProps {
  status: OrderStatus;
}

const STEPS: { key: OrderStatus; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'accepted', label: 'Accepted', icon: Check },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready for Pickup', icon: Flame },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

export const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({ status }) => {
  if (status === 'cancelled' || status === 'rejected') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
          {status === 'cancelled' ? <Ban className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        </div>
        <h4 className="text-sm font-bold text-rose-900 capitalize">
          Order {status}
        </h4>
        <p className="text-xs text-rose-700 mt-0.5">
          {status === 'cancelled'
            ? 'This order was cancelled by you.'
            : 'The canteen kitchen was unable to fulfill this order.'}
        </p>
      </div>
    );
  }

  const orderIndexMap: Record<string, number> = {
    pending: 0,
    accepted: 1,
    preparing: 2,
    ready: 3,
    completed: 4,
  };

  const currentStepIndex = orderIndexMap[status] ?? 0;

  return (
    <div className="w-full py-4">
      {/* Desktop Stepper */}
      <div className="relative flex items-center justify-between">
        {/* Progress connecting bar */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-200 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-amber-500 -translate-y-1/2 z-0 transition-all duration-500"
          style={{
            width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
          }}
        />

        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDone
                    ? 'bg-amber-500 text-white shadow-md'
                    : isCurrent
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 shadow-lg scale-110 animate-pulse'
                    : 'bg-white border-2 border-stone-300 text-stone-400'
                }`}
              >
                <StepIcon className="w-4 h-4" />
              </div>
              <span
                className={`text-[11px] font-semibold mt-2 text-center whitespace-nowrap ${
                  isCurrent
                    ? 'text-amber-700 font-bold'
                    : isDone
                    ? 'text-stone-900'
                    : 'text-stone-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
