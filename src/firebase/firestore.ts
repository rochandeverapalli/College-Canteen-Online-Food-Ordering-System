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
      onUpdate(list);
    },
    (error) => {
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
      onUpdate(list);
    },
    (error) => {
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

/* ==================== TOKEN NUMBER GENERATOR ==================== */

export async function generateNextTokenNumber(): Promise<string> {
  try {
    // Look up recent orders created today to generate sequential token like C001, C002...
    const ordersSnap = await getDocs(collection(db, ORDERS_COL));
    const count = ordersSnap.size;
    const tokenNum = (count + 1).toString().padStart(3, '0');
    return `C${tokenNum}`;
  } catch (err) {
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `C${randomNum}`;
  }
}

/* ==================== ORDERS ==================== */

export async function createOrder(
  orderData: Omit<Order, 'id'>,
  paymentData: Omit<PaymentRecord, 'paymentId'>
): Promise<Order> {
  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const fullOrder: Order = {
    ...orderData,
    id: orderId,
    orderId,
    paymentId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const fullPayment: PaymentRecord = {
    ...paymentData,
    paymentId,
    orderId,
    createdAt: new Date().toISOString(),
  };

  try {
    // Record payment and order
    await setDoc(doc(db, PAYMENTS_COL, paymentId), fullPayment);
    await setDoc(doc(db, ORDERS_COL, orderId), fullOrder);
    return fullOrder;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, ORDERS_COL);
  }
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

  const sampleCategories: Omit<Category, 'id'>[] = [
    {
      name: 'Breakfast',
      description: 'Hot, fresh south & north Indian morning specials',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      name: 'Meals & Biryani',
      description: 'Filling lunch bowls, aromatic biryanis and combo plates',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      name: 'Fast Food & Burgers',
      description: 'Crispy burgers, cheesy wraps, sandwiches, and golden fries',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      name: 'Snacks & Street Food',
      description: 'Quick bites, samosas, cutlets, and crunchy appetizers',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      name: 'Beverages & Chai',
      description: 'Steaming masala chai, iced coolers, juices, and cold sodas',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      name: 'Desserts',
      description: 'Sweet treats, brownies, and ice cream tubs',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const catIdMap: Record<string, string> = {};

  // Check or create categories
  if (existingCats.empty) {
    for (const cat of sampleCategories) {
      const docRef = await addDoc(categoriesCollection, cat);
      catIdMap[cat.name] = docRef.id;
    }
  } else {
    existingCats.forEach((d) => {
      const data = d.data() as Category;
      catIdMap[data.name] = d.id;
    });
  }

  // Ensure default fallback category IDs
  const breakfastId = catIdMap['Breakfast'] || Object.values(catIdMap)[0];
  const mealsId = catIdMap['Meals & Biryani'] || Object.values(catIdMap)[0];
  const fastFoodId = catIdMap['Fast Food & Burgers'] || Object.values(catIdMap)[0];
  const snacksId = catIdMap['Snacks & Street Food'] || Object.values(catIdMap)[0];
  const beverageId = catIdMap['Beverages & Chai'] || Object.values(catIdMap)[0];
  const dessertId = catIdMap['Desserts'] || Object.values(catIdMap)[0];

  const sampleFoodItems: Omit<FoodItem, 'id'>[] = [
    {
      name: 'Chicken Biryani',
      description: 'Fragrant basmati rice cooked with tender marinated chicken pieces, whole spices, and served with raita.',
      price: 150,
      categoryId: mealsId,
      categoryName: 'Meals & Biryani',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80',
      available: true,
      isVeg: false,
      preparationTime: 15,
      rating: 4.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'Veg Dum Biryani',
      description: 'Slow-cooked spiced aromatic rice layered with fresh cottage cheese (paneer), carrots, beans, and fried onions.',
      price: 120,
      categoryId: mealsId,
      categoryName: 'Meals & Biryani',
      imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=700&auto=format&fit=crop&q=80',
      available: true,
      isVeg: true,
      preparationTime: 15,
      rating: 4.6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'Chicken Fried Rice',
      description: 'Wok-tossed steamed rice with shredded seasoned chicken, spring onions, egg ribbons, and light soy sauce.',
      price: 120,
      categoryId: mealsId,
      categoryName: 'Meals & Biryani',
      imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=700&auto=format&fit=crop&q=80',
      available: true,
      isVeg: false,
      preparationTime: 12,
      rating: 4.7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'Veg Fried Rice',
      description: 'Classic oriental wok rice loaded with crunchy bell peppers, cabbage, carrots, and roasted garlic aroma.',
      price: 90,
      categoryId: mealsId,
      categoryName: 'Meals & Biryani',
      imageUrl: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=700&auto=format&fit=crop&q=80',
      available: true,
      isVeg: true,
      preparationTime: 10,
      rating: 4.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'Crispy Chicken Burger',
      description: 'Golden crumbed chicken patty with melted cheddar cheese slice, fresh lettuce, and smoky garlic mayo on toasted sesame bun.',
      price: 110,
      categoryId: fastFoodId,
      categoryName: 'Fast Food & Burgers',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80',
      available: true,
      isVeg: false,
      preparationTime: 15,
      rating: 4.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'Veggie Supreme Burger',
      description: 'Herb-spiced potato & corn patty with pickled cucumber, tomatoes, sweet relish, and creamy chipotle sauce.',
      price: 80,
      categoryId: fastFoodId,
      categoryName: 'Fast Food & Burgers',
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=700&auto=format&fit=crop&q=80',
      available: true,
      isVeg: true,
      preparationTime: 12,
      rating: 4.4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'Grilled Cheese Sandwich',
      description: 'Triple layered sandwich loaded with grated mozzarella, spiced mint chutney, bell pepper cubes, and grilled crisp with butter.',
      price: 70,
      categoryId: fastFoodId,
      categoryName: 'Fast Food & Burgers',
      imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=700&auto=format&fit=crop&q=80',
      available: true,
      isVeg: true,
      preparationTime: 10,
      rating: 4.6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'Peri-Peri French Fries',
      description: 'Crispy straight cut skin-on potato fries tossed liberally in zesty African peri-peri spices.',
      price: 60,
      categoryId: fastFoodId,
      categoryName: 'Fast Food & Burgers',
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=700&auto=format&fit=crop&q=80',
      available: true,
      isVeg: true,
      preparationTime: 8,
      rating: 4.7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'Crispy Punjabi Samosa (2 pcs)',
      description: 'Flaky crust stuffed with spicy cumin potatoes and sweet green peas, served with sweet tamarind and spicy mint chutney.',
      price: 35,
      categoryId: snacksId,
      categoryName: 'Snacks & Street Food',
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&auto=format&fit=crop&q=80',
      available: true,
      isVeg: true,
      preparationTime: 5,
      rating: 4.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'Masala Dosa with Sambar',
      description: 'Golden fermented rice-lentil crepe smeared with red chutney, filled with potato masala, served with piping hot coconut chutney and sambar.',
      price: 65,
      categoryId: breakfastId,
      categoryName: 'Breakfast',
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=700&auto=format&fit=crop&q=80',
      available: true,
      isVeg: true,
      preparationTime: 12,
      rating: 4.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'Special Kadak Masala Chai',
      description: 'Slow-brewed Assam tea leaves infused with crushed ginger, cardamom pods, clove, and fresh creamy milk.',
      price: 15,
      categoryId: beverageId,
      categoryName: 'Beverages & Chai',
      imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=700&auto=format&fit=crop&q=80',
      available: true,
      isVeg: true,
      preparationTime: 5,
      rating: 5.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'South Indian Filter Coffee',
      description: 'Traditional chicory blend decoction frothed with boiling whole milk, served in classic stainless steel tumbler style.',
      price: 25,
      categoryId: beverageId,
      categoryName: 'Beverages & Chai',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=700&auto=format&fit=crop&q=80',
      available: true,
      isVeg: true,
      preparationTime: 5,
      rating: 4.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'Chilled Mango Lassi',
      description: 'Thick creamy yoghurt churned with Alphonso mango pulp and a pinch of aromatic saffron and cardamom.',
      price: 50,
      categoryId: beverageId,
      categoryName: 'Beverages & Chai',
      imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=700&auto=format&fit=crop&q=80',
      available: true,
      isVeg: true,
      preparationTime: 5,
      rating: 4.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'Fudgy Choco Brownie',
      description: 'Decadent dark chocolate fudge brownie with gooey molten center and chopped roasted walnuts.',
      price: 60,
      categoryId: dessertId,
      categoryName: 'Desserts',
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=700&auto=format&fit=crop&q=80',
      available: true,
      isVeg: true,
      preparationTime: 3,
      rating: 4.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const foodItemsCollection = collection(db, FOOD_ITEMS_COL);
  const existingFood = await getDocs(foodItemsCollection);

  if (existingFood.empty) {
    for (const item of sampleFoodItems) {
      await addDoc(foodItemsCollection, item);
    }
  }

  // Also initialize general canteen settings
  await setDoc(
    doc(db, SETTINGS_COL, DEFAULT_SETTINGS_DOC),
    {
      acceptingOrders: true,
      announcement: 'College Canteen is OPEN! Order online and collect via token when notified.',
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return {
    categoriesCount: sampleCategories.length,
    itemsCount: sampleFoodItems.length,
  };
}
