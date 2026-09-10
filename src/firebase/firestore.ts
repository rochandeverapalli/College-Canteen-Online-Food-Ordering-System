import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from './config';
import {
  Category,
  FoodItem,
  Order,
  OrderStatus,
  PaymentRecord,
  CanteenSetting,
} from '../types';
import { INITIAL_CATEGORIES, INITIAL_FOOD_ITEMS } from '../data/menuData';
import { handleFirestoreError, OperationType } from './errors';

// Collections
const CATEGORIES_COL = 'categories';
const FOOD_ITEMS_COL = 'foodItems';
const ORDERS_COL = 'orders';
const PAYMENTS_COL = 'payments';
const SETTINGS_COL = 'canteenSettings';

/* ==================== CATEGORIES ==================== */

export function subscribeToCategories(
  onUpdate: (categories: Category[]) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    collection(db, CATEGORIES_COL),
    (snapshot) => {
      const list: Category[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Category, 'id'>) });
      });
      if (list.length > 0) {
        onUpdate(list);
      } else {
        onUpdate(INITIAL_CATEGORIES);
      }
    },
    (error) => {
      console.warn('Firestore categories listener / offline:', error);
      onUpdate(INITIAL_CATEGORIES);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, CATEGORIES_COL);
    }
  );
}

export async function getFoodItems(): Promise<FoodItem[]> {
  try {
    const snapshot = await getDocs(collection(db, FOOD_ITEMS_COL));
    const list: FoodItem[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as Omit<FoodItem, 'id'>) });
    });
    return list;
  } catch (err) {
    console.error('Error fetching food items:', err);
    return [];
  }
}

export async function addCategory(
  nameOrData: string | Omit<Category, 'id' | 'createdAt'>,
  image?: string
): Promise<string> {
  try {
    const data =
      typeof nameOrData === 'string'
        ? { name: nameOrData, image: image || '', active: true }
        : nameOrData;
    const docRef = await addDoc(collection(db, CATEGORIES_COL), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, CATEGORIES_COL);
  }
}

export const createCategory = addCategory;
export const createFoodItem = addFoodItem;

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const docSnap = await getDoc(doc(db, ORDERS_COL, orderId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) };
    }
    return null;
  } catch (error) {
    console.error('Error getting order:', error);
    return null;
  }
}

export function subscribeToOrderById(
  orderId: string,
  onUpdate: (order: Order | null) => void,
  onError?: (err: unknown) => void
) {
  return subscribeToSingleOrder(orderId, onUpdate, onError);
}

export async function updateCategory(
  id: string,
  data: Partial<Category>
): Promise<void> {
  try {
    await updateDoc(doc(db, CATEGORIES_COL, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${CATEGORIES_COL}/${id}`);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, CATEGORIES_COL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${CATEGORIES_COL}/${id}`);
  }
}

/* ==================== FOOD ITEMS ==================== */

export function subscribeToFoodItems(
  onUpdate: (items: FoodItem[]) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    collection(db, FOOD_ITEMS_COL),
    (snapshot) => {
      const list: FoodItem[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<FoodItem, 'id'>) });
      });
      if (list.length > 0) {
        onUpdate(list);
      } else {
        onUpdate(INITIAL_FOOD_ITEMS);
      }
    },
    (error) => {
      console.warn('Firestore food items listener / offline:', error);
      onUpdate(INITIAL_FOOD_ITEMS);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, FOOD_ITEMS_COL);
    }
  );
}

export async function addFoodItem(
  data: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, FOOD_ITEMS_COL), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, FOOD_ITEMS_COL);
  }
}

export async function updateFoodItem(
  id: string,
  data: Partial<FoodItem>
): Promise<void> {
  try {
    await updateDoc(doc(db, FOOD_ITEMS_COL, id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${FOOD_ITEMS_COL}/${id}`);
  }
}

export async function deleteFoodItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, FOOD_ITEMS_COL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${FOOD_ITEMS_COL}/${id}`);
  }
}

export async function toggleFoodAvailability(
  id: string,
  available: boolean
): Promise<void> {
  return updateFoodItem(id, { available });
}

/* ==================== TOKEN & SEQUENTIAL ORDER NUMBER GENERATOR ==================== */

const COUNTERS_COL = 'counters';
const ORDER_COUNTER_DOC = 'orders';

/**
 * Generates an atomic sequential integer order number (1, 2, 3...)
 * clubbed across all customers using a Firestore transaction.
 */
export async function getNextOrderNumber(): Promise<number> {
  const counterRef = doc(db, COUNTERS_COL, ORDER_COUNTER_DOC);
  try {
    const nextNum = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let current = 0;
      if (counterDoc.exists()) {
        const val = counterDoc.data().currentNumber;
        if (typeof val === 'number') current = val;
      }
      const next = current + 1;
      transaction.set(
        counterRef,
        { currentNumber: next, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      return next;
    });
    return nextNum;
  } catch (err) {
    console.warn('Atomic counter transaction notice, querying existing orders count:', err);
    try {
      const ordersSnap = await getDocs(collection(db, ORDERS_COL));
      const next = ordersSnap.size + 1;
      setDoc(
        counterRef,
        { currentNumber: next, updatedAt: new Date().toISOString() },
        { merge: true }
      ).catch(() => {});
      return next;
    } catch {
      return 1;
    }
  }
}

export async function generateNextTokenNumber(): Promise<string> {
  const orderNum = await getNextOrderNumber();
  return orderNum.toString();
}

/* ==================== ORDERS ==================== */

export async function createOrder(
  orderData: Omit<Order, 'id' | 'orderId'> & { orderNumber?: number },
  paymentData?: Partial<PaymentRecord>
): Promise<Order> {
  // If orderNumber was not pre-assigned, get next sequential order number
  const orderNumber = orderData.orderNumber || (await getNextOrderNumber());
  const tokenNumber = orderNumber.toString(); // "1", "2", "3"...
  const orderId = `ORD-${Date.now()}-${orderNumber}`;
  const paymentId = `PAY-${Date.now()}-${orderNumber}`;

  const fullOrder: Order = {
    ...orderData,
    id: orderId,
    orderId,
    orderNumber,
    tokenNumber,
    customerPhone: orderData.customerPhone || orderData.phone || '',
    paymentStatus: orderData.paymentStatus || 'paid',
    paymentId,
    orderStatus: orderData.orderStatus || 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const fullPayment: PaymentRecord = {
    paymentId,
    orderId,
    userId: orderData.userId || 'guest',
    amount: orderData.totalAmount,
    status: 'paid',
    provider: paymentData?.provider || 'UPI / Counter Payment',
    transactionId: paymentData?.transactionId || `TXN${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  try {
    // Record payment and order
    await setDoc(doc(db, PAYMENTS_COL, paymentId), fullPayment);
    await setDoc(doc(db, ORDERS_COL, orderId), fullOrder);
    return fullOrder;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, ORDERS_COL);
    // Return order if non-fatal network error occurred
    return fullOrder;
  }
}

export function subscribeToOrdersByPhone(
  phone: string,
  onUpdate: (orders: Order[]) => void,
  onError?: (err: unknown) => void
) {
  const cleanPhone = phone.trim().replace(/\D/g, '');
  return onSnapshot(
    collection(db, ORDERS_COL),
    (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data() as Order;
        const itemPhone = (d.customerPhone || d.phone || '').replace(/\D/g, '');
        if (itemPhone && (itemPhone === cleanPhone || itemPhone.endsWith(cleanPhone) || cleanPhone.endsWith(itemPhone))) {
          list.push({ id: docSnap.id, ...d });
        }
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, ORDERS_COL);
    }
  );
}

export function subscribeToStudentOrders(
  userId: string,
  onUpdate: (orders: Order[]) => void,
  onError?: (err: unknown) => void
) {
  const q = query(
    collection(db, ORDERS_COL),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) });
      });
      // Sort client-side by creation timestamp descending to avoid compound index requirements
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, ORDERS_COL);
    }
  );
}

export function subscribeToAllOrders(
  onUpdate: (orders: Order[]) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    collection(db, ORDERS_COL),
    (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) });
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, ORDERS_COL);
    }
  );
}

export function subscribeToSingleOrder(
  orderId: string,
  onUpdate: (order: Order | null) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    doc(db, ORDERS_COL, orderId),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) });
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `${ORDERS_COL}/${orderId}`);
    }
  );
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  rejectionReason?: string
): Promise<void> {
  try {
    const updateData: Record<string, unknown> = {
      orderStatus: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    await updateDoc(doc(db, ORDERS_COL, orderId), updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COL}/${orderId}`);
  }
}

/* ==================== CANTEEN SETTINGS ==================== */

const DEFAULT_SETTINGS_DOC = 'general';

export function subscribeToCanteenSettings(
  onUpdate: (settings: CanteenSetting) => void
) {
  return onSnapshot(
    doc(db, SETTINGS_COL, DEFAULT_SETTINGS_DOC),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({ id: docSnap.id, ...(docSnap.data() as CanteenSetting) });
      } else {
        // Fallback default
        onUpdate({
          id: DEFAULT_SETTINGS_DOC,
          acceptingOrders: true,
          announcement: 'Welcome to College Canteen! Fresh meals prepared daily.',
        });
      }
    },
    (error) => {
      console.warn('Canteen settings read issue, fallback to default active', error);
      onUpdate({
        id: DEFAULT_SETTINGS_DOC,
        acceptingOrders: true,
        announcement: 'Welcome to College Canteen! Fresh meals prepared daily.',
      });
    }
  );
}

export async function updateCanteenSettings(
  settings: Partial<CanteenSetting>
): Promise<void> {
  try {
    await setDoc(
      doc(db, SETTINGS_COL, DEFAULT_SETTINGS_DOC),
      {
        ...settings,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${SETTINGS_COL}/${DEFAULT_SETTINGS_DOC}`);
  }
}

/* ==================== DEMO DATA SEEDER ==================== */

export async function seedCanteenDemoData(): Promise<{ categoriesCount: number; itemsCount: number }> {
  const categoriesCollection = collection(db, CATEGORIES_COL);
  const existingCats = await getDocs(categoriesCollection);

  // Check or create categories
  if (existingCats.empty) {
    for (const cat of INITIAL_CATEGORIES) {
      await setDoc(doc(db, CATEGORIES_COL, cat.id), {
        ...cat,
        createdAt: new Date().toISOString(),
      });
    }
  }

  const foodItemsCollection = collection(db, FOOD_ITEMS_COL);
  const existingFood = await getDocs(foodItemsCollection);

  // If empty or fewer than 15 items, populate full menu
  if (existingFood.size < 15) {
    for (const item of INITIAL_FOOD_ITEMS) {
      await setDoc(doc(db, FOOD_ITEMS_COL, item.id), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Also initialize general canteen settings
  await setDoc(
    doc(db, SETTINGS_COL, DEFAULT_SETTINGS_DOC),
    {
      acceptingOrders: true,
      announcement: 'Campus Food Court is OPEN! Order online & pick up at the counter with your Order Token Number.',
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return {
    categoriesCount: INITIAL_CATEGORIES.length,
    itemsCount: INITIAL_FOOD_ITEMS.length,
  };
}
