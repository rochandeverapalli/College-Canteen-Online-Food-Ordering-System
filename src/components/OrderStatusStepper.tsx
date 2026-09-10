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
      <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4 text-center">
        <div className="w-10 h-10 rounded-full bg-rose-900/50 text-rose-400 flex items-center justify-center mx-auto mb-2">
          {status === 'cancelled' ? <Ban className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        </div>
        <h4 className="text-sm font-bold text-white capitalize">
          Order {status}
        </h4>
        <p className="text-xs text-rose-300/80 mt-0.5">
          {status === 'cancelled'
            ? 'This order was cancelled.'
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
      <div className="relative flex items-center justify-between">
        {/* Connecting Track */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-purple-950/70 border-t border-purple-500/20 -translate-y-1/2 z-0" />
        <div
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-purple-500 to-teal-400 -translate-y-1/2 z-0 transition-all duration-500 shadow-[0_0_12px_rgba(45,212,191,0.5)]"
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
                    ? 'bg-gradient-to-tr from-purple-600 to-teal-400 text-white shadow-md shadow-teal-400/20'
                    : isCurrent
                    ? 'bg-teal-400 text-slate-950 ring-4 ring-teal-400/30 shadow-lg shadow-teal-400/40 scale-110 font-bold'
                    : 'bg-[#100c2a] border border-purple-500/30 text-purple-400/50'
                }`}
              >
                <StepIcon className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-semibold mt-2 text-center whitespace-nowrap ${
                  isCurrent
                    ? 'text-teal-300 font-black'
                    : isDone
                    ? 'text-purple-200'
                    : 'text-purple-400/50'
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
