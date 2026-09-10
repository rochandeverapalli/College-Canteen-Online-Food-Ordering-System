import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  Zap,
  ShoppingBag,
  ShieldCheck,
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

export const Home: React.FC = () => {
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
    .filter((i) => i.available && (i.price >= 100 || (i.rating && i.rating >= 4.7)))
    .slice(0, 4);

  return (
    <div className="min-h-screen pb-28">
      {/* Canteen Notice / Status Banner */}
      {!canteenSettings.acceptingOrders ? (
        <div className="bg-rose-600 text-white px-4 py-2.5 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Online ordering is temporarily paused by canteen counter. You can still browse the menu.</span>
        </div>
      ) : (
        canteenSettings.announcement && (
          <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-teal-950 text-teal-300 border-b border-teal-500/30 px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-teal-400 animate-pulse" />
            <span>{canteenSettings.announcement}</span>
          </div>
        )
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-purple-500/20">
        {/* Glow ambient backdrops */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/50 border border-purple-500/30 text-teal-300 text-xs font-bold shadow-md">
              <Flame className="w-4 h-4 text-teal-400 animate-pulse" />
              <span>Campus Digital Canteen • Instant Sequential Order Number</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Skip The Long Lines. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-teal-300 to-white">
                Order & Eat Fresh.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-purple-200/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Order directly with your mobile number & name—no passwords or login barriers needed. Collect hot food immediately when your sequential order token is announced!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                to="/menu"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-400 hover:from-purple-500 hover:to-teal-300 text-white font-black text-base shadow-xl shadow-purple-600/30 hover:shadow-teal-400/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>View Menu (26+ Items)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/orders"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl glass-card text-purple-200 hover:text-white font-bold text-base border border-purple-500/30 hover:border-teal-400 transition text-center"
              >
                Track Live Order
              </Link>
            </div>

            {/* Micro value props */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-purple-500/20 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <span className="block text-2xl font-black text-white">#1, #2...</span>
                <span className="text-xs text-purple-300/70">Sequential Tokens</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="block text-2xl font-black text-teal-300">0 min</span>
                <span className="text-xs text-purple-300/70">Queue Waiting</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="block text-2xl font-black text-purple-300">100%</span>
                <span className="text-xs text-purple-300/70">Real-Time Kitchen</span>
              </div>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden shadow-2xl border border-purple-500/30 glass-card p-2 group">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80"
                  alt="College Canteen Biryani"
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0819] via-[#0b0819]/40 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs uppercase font-extrabold text-teal-300 tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Campus Special
                  </span>
                  <h3 className="text-xl font-black mt-1">Hyderabadi Chicken & Veg Biryani</h3>
                  <p className="text-xs text-purple-200/80 mt-1">
                    Served hot with spicy salan & fresh onion raita. Ready in 15 mins.
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-black text-teal-300">₹140</span>
                    <Link
                      to="/menu"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-teal-400 hover:from-purple-500 text-white text-xs font-bold shadow-md transition"
                    >
                      Order Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Empty Database Seed helper card if fresh database */}
      {foodItems.length === 0 && !loading && (
        <div className="max-w-4xl mx-auto my-8 p-6 sm:p-8 glass-card border border-teal-500/40 rounded-3xl text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center mx-auto shadow-md">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              Initialize 26+ College Canteen Food Items
            </h3>
            <p className="text-purple-200 text-sm max-w-md mx-auto mt-1">
              Populate authentic college canteen items (Biryani, Dosa, Burgers, Samosas, Chai, Cold Coffee, Frankie, Fried Rice) in one click.
            </p>
          </div>
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-400 text-white font-bold text-sm shadow-md transition inline-flex items-center gap-2"
          >
            {seeding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading Menu Items...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Load 26+ Menu Items</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Food Categories
            </h2>
            <p className="text-xs sm:text-sm text-purple-300/70">
              Hot breakfast, lunch meals, quick snacks, and refreshing drinks
            </p>
          </div>
          <Link
            to="/menu"
            className="text-xs sm:text-sm font-bold text-teal-300 hover:text-teal-200 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/menu?category=${encodeURIComponent(cat.id)}`}
              className="group glass-card rounded-2xl p-3.5 border border-purple-500/20 hover:border-teal-400/50 shadow-md hover:shadow-lg transition-all flex flex-col items-center text-center hover:-translate-y-1"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-purple-950/50 mb-2.5 border border-purple-500/30">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80'}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-teal-300 transition">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Items Section */}
      {popularItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Most Popular on Campus
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/30 text-teal-300 text-xs font-semibold">
                  Trending
                </span>
              </div>
              <p className="text-xs sm:text-sm text-purple-300/70 mt-0.5">
                Top rated and most ordered by students & staff
              </p>
            </div>
            <Link
              to="/menu"
              className="text-xs sm:text-sm font-bold text-teal-300 hover:text-teal-200 flex items-center gap-1"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {popularItems.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onOpenDetails={(item) => setSelectedFood(item)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Today's Specials */}
      {todaySpecials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Chef's Recommendations
              </h2>
              <p className="text-xs sm:text-sm text-purple-300/70 mt-0.5">
                Freshly prepared meals with premium ingredients
              </p>
            </div>
            <Link
              to="/menu"
              className="text-xs sm:text-sm font-bold text-teal-300 hover:text-teal-200 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

      {/* How It Works 3-Step Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="glass-card rounded-3xl border border-purple-500/20 p-8 sm:p-12 shadow-2xl">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block mb-1">
              Zero Queuing System
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              How Campus Ordering Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-purple-600/30">
                1
              </div>
              <h3 className="text-base font-bold text-white">Pick Your Food</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed">
                Choose your favorite breakfast, lunch, or snacks from over 26+ available canteen items.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-indigo-600/30">
                2
              </div>
              <h3 className="text-base font-bold text-white">Get Sequential Token</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed">
                Enter your mobile number and name. You instantly get Order #1, #2... clubbed with all campus orders.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-teal-500/30">
                3
              </div>
              <h3 className="text-base font-bold text-white">Collect Fresh & Hot</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed">
                Watch the live kitchen counter status. When your token turns green, pick up your meal!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Food Details Modal */}
      {selectedFood && (
        <FoodDetailsModal
          food={selectedFood}
          isOpen={!!selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}
    </div>
  );
};
