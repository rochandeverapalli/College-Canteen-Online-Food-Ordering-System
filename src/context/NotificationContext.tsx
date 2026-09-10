import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AppNotification, Order } from '../types';
import { useAuth } from './AuthContext';
import { subscribeToStudentOrders } from '../firebase/firestore';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  addNotification: (title: string, message: string, type?: AppNotification['type'], tokenNumber?: string, orderId?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Synthesized gentle notification chime using Web Audio API
function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15); // D6

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch {
    // Audio may be blocked before first user gesture
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const previousOrdersRef = useRef<Map<string, string>>(new Map());
  const isInitialLoadRef = useRef<boolean>(true);

  const addNotification = (
    title: string,
    message: string,
    type: AppNotification['type'] = 'info',
    tokenNumber?: string,
    orderId?: string
  ) => {
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      tokenNumber,
      orderId,
    };

    setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
    playChime();

    // Trigger browser notification if supported and granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
        });
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    if (!currentUser) {
      previousOrdersRef.current.clear();
      isInitialLoadRef.current = true;
      return;
    }

    // Request browser notification permission gently
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    const unsubscribe = subscribeToStudentOrders(currentUser.uid, (orders) => {
      if (isInitialLoadRef.current) {
        // Record initial states without triggering toast spam
        orders.forEach((ord) => {
          previousOrdersRef.current.set(ord.orderId, ord.orderStatus);
        });
        isInitialLoadRef.current = false;
        return;
      }

      orders.forEach((order) => {
        const prevStatus = previousOrdersRef.current.get(order.orderId);
        if (prevStatus && prevStatus !== order.orderStatus) {
          // Status has changed!
          let title = `Order Update (#${order.tokenNumber})`;
          let message = '';
          let type: AppNotification['type'] = 'info';

          switch (order.orderStatus) {
            case 'accepted':
              message = `Your order #${order.tokenNumber} has been accepted by the canteen kitchen!`;
              type = 'info';
              break;
            case 'preparing':
              message = `Chef is preparing your food for order #${order.tokenNumber}.`;
              type = 'info';
              break;
            case 'ready':
              title = `Order #${order.tokenNumber} is READY!`;
              message = `Your order #${order.tokenNumber} is ready for pickup at the counter!`;
              type = 'success';
              break;
            case 'completed':
              title = `Order Completed`;
              message = `Order #${order.tokenNumber} marked as collected. Enjoy your meal!`;
              type = 'success';
              break;
            case 'rejected':
              title = `Order Rejected`;
              message = `Order #${order.tokenNumber} could not be accepted.`;
              type = 'alert';
              break;
            case 'cancelled':
              title = `Order Cancelled`;
              message = `Order #${order.tokenNumber} has been cancelled.`;
              type = 'warning';
              break;
          }

          if (message) {
            addNotification(title, message, type, order.tokenNumber, order.orderId);
          }
        }
        previousOrdersRef.current.set(order.orderId, order.orderStatus);
      });
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        clearAll,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
