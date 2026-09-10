import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  Flame,
  Sparkles,
  Utensils,
  Award,
  Coffee,
  CheckCircle,
  Database,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { FoodItem, Category, CanteenSetting } from '../types';
import {
  subscribeToCategories,
  subscribeToFoodItems,
  subscribeToCanteenSettings,
  seedCanteenDemoData,
} from '../firebase/firestore';
import { FoodCard } from '../components/FoodCard';
import { FoodDetailsModal } from '../components/FoodDetailsModal';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [canteenSettings, setCanteenSettings] = useState<CanteenSetting>({
    acceptingOrders: true,
    announcement: 'Fresh meals prepared hot every day at your College Canteen.',
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  useEffect(() => {
    const unsubCats = subscribeToCategories((cats) => {
      setCategories(cats);
    });

    const unsubFood = subscribeToFoodItems((items) => {
      setFoodItems(items);
      setLoading(false);
    });

    const unsubSettings = subscribeToCanteenSettings((settings) => {
      setCanteenSettings(settings);
    });

    return () => {
      unsubCats();
      unsubFood();
      unsubSettings();
    };
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedCanteenDemoData();
    } catch (e) {
      console.error('Error seeding demo data:', e);
    } finally {
      setSeeding(false);
    }
  };

  const popularItems = foodItems.filter((i) => i.available).slice(0, 4);
  const todaySpecials = foodItems
    .filter((i) => i.available && (i.price >= 100 || i.rating >= 4.8))
    .slice(0, 4);

  return (
    <div className="min-h-screen pb-20">
      {/* Canteen Notice / Status Banner */}
      {!canteenSettings.acceptingOrders ? (
        <div className="bg-rose-500 text-white px-4 py-2.5 text-center text-sm font-semibold flex items-center justify-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Online ordering is temporarily closed by canteen kitchen. You can still browse the menu.</span>
        </div>
      ) : (
        canteenSettings.announcement && (
          <div className="bg-amber-500 text-white px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{canteenSettings.announcement}</span>
          </div>
        )
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 via-stone-50 to-stone-50 pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold shadow-xs">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>Campus Online Canteen • Fast Counter Pickup</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-950 tracking-tight leading-[1.1]">
              Skip the Queue. <br />
              <span className="text-amber-500">Order Your Food Online.</span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Browse the canteen menu, order your favourite meals from your phone, pay securely, and collect hot food when your token number is called.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                to="/menu"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2 group"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/menu"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 font-bold text-base border border-stone-200 transition text-center"
              >
                Browse Menu
              </Link>
            </div>

            {/* Micro value props */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-200/80 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <span className="block text-xl font-black text-stone-900">0 min</span>
                <span className="text-xs text-stone-500">Queue Time</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="block text-xl font-black text-stone-900">100%</span>
                <span className="text-xs text-stone-500">Live Status</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="block text-xl font-black text-stone-900">Token</span>
                <span className="text-xs text-stone-500">Instant Counter Code</span>
              </div>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80"
                alt="College Canteen Biryani"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  Campus Favourite
                </span>
                <h3 className="text-xl font-black">Hyderabadi Chicken & Veg Biryani</h3>
                <p className="text-xs text-stone-200 mt-1">
                  Served with fresh raita & spicy salan. Ready in 15 mins.
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-black text-amber-300">from ₹120</span>
                  <Link
                    to="/menu"
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition"
                  >
                    Order Today
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Empty Database Seed helper card if fresh database */}
      {foodItems.length === 0 && !loading && (
        <div className="max-w-4xl mx-auto my-8 p-6 sm:p-8 bg-amber-50 border-2 border-amber-300 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-stone-900">
              Set Up College Canteen Menu
            </h3>
            <p className="text-stone-600 text-sm max-w-md mx-auto mt-1">
              Your Firestore database is active. Click below to automatically seed authentic college canteen food items (Biryani, Dosa, Burgers, Samosas, Chai, Coffee).
            </p>
          </div>
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition inline-flex items-center gap-2"
          >
            {seeding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Seeding Firestore Menu...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Seed Realistic Canteen Menu</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Food Categories
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Browse hot breakfast, lunch thalis, quick bites, and drinks
            </p>
          </div>
          <Link
            to="/menu"
            className="text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/menu?category=${encodeURIComponent(cat.id)}`}
              className="group bg-white rounded-2xl p-3 border border-stone-200 shadow-2xs hover:shadow-md hover:border-amber-300 transition flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-stone-100 mb-2.5">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80'}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-amber-700 transition">
                {cat.name}
              </h4>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Items Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                Popular Items
              </h2>
              <p className="text-xs sm:text-sm text-stone-500">
                Most ordered snacks and meals on campus today
              </p>
            </div>
          </div>
          <Link
            to="/menu"
            className="text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>See Full Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularItems.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onOpenDetails={(item) => setSelectedFood(item)}
            />
          ))}
        </div>
      </section>

      {/* Today's Specials */}
      {todaySpecials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                  Today's Chef Specials
                </h2>
                <p className="text-xs sm:text-sm text-stone-500">
                  Signature canteen recipes freshly cooked every morning
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {todaySpecials.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onOpenDetails={(item) => setSelectedFood(item)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Food Details Modal */}
      <FoodDetailsModal
        food={selectedFood}
        onClose={() => setSelectedFood(null)}
      />
    </div>
  );
};
