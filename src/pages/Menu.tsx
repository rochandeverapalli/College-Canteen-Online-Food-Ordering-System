import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Utensils,
  Leaf,
  Drumstick,
  Sparkles,
  X,
  Database,
  Loader2,
  Flame,
} from 'lucide-react';
import { FoodItem, Category } from '../types';
import {
  subscribeToCategories,
  subscribeToFoodItems,
  seedCanteenDemoData,
} from '../firebase/firestore';
import { FoodCard } from '../components/FoodCard';
import { FoodDetailsModal } from '../components/FoodDetailsModal';

export const Menu: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [categories, setCategories] = useState<Category[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean>(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialSearch) setSearchQuery(initialSearch);
  }, [initialCategory, initialSearch]);

  useEffect(() => {
    const unsubCats = subscribeToCategories((cats) => {
      setCategories(cats);
    });

    const unsubFood = subscribeToFoodItems((items) => {
      setFoodItems(items);
      setLoading(false);
    });

    return () => {
      unsubCats();
      unsubFood();
    };
  }, []);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setSearchParams((prev) => {
      if (catId === 'all') {
        prev.delete('category');
      } else {
        prev.set('category', catId);
      }
      return prev;
    });
  };

  const handleSeed = async () => {
    setSeeding(true);
    await seedCanteenDemoData();
    setSeeding(false);
  };

  const filteredItems = useMemo(() => {
    return foodItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }

      // Dietary filter
      if (dietFilter === 'veg' && !item.isVeg) return false;
      if (dietFilter === 'non-veg' && item.isVeg) return false;

      // Available only filter
      if (availabilityFilter && !item.available) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCat = item.categoryName?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [foodItems, selectedCategory, dietFilter, availabilityFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
      {/* Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Campus Canteen Menu
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
              {foodItems.length} Items Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-purple-300/80 mt-1">
            Pick your meals, place your guest order, and get your sequential order number instantly.
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search dosa, biryani, burgers, tea..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-purple-950/40 border border-purple-500/30 rounded-2xl text-white placeholder-purple-300/40 focus:outline-none focus:border-teal-400 transition-all shadow-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-purple-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills & Diet Filter Tabs */}
      <div className="space-y-4 mb-8">
        {/* Category Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-teal-400 text-white shadow-lg shadow-purple-600/30'
                : 'glass-card text-purple-200 hover:text-white hover:border-purple-400/50'
            }`}
          >
            All Items ({foodItems.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-600 to-teal-400 text-white shadow-lg shadow-purple-600/30'
                  : 'glass-card text-purple-200 hover:text-white hover:border-purple-400/50'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Dietary & Stock Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-purple-500/20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDietFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                dietFilter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-950/40 border border-purple-500/20 text-purple-300 hover:text-white'
              }`}
            >
              All Diets
            </button>
            <button
              onClick={() => setDietFilter('veg')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                dietFilter === 'veg'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-purple-950/40 border border-purple-500/20 text-emerald-400 hover:bg-purple-900/40'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Veg Only</span>
            </button>
            <button
              onClick={() => setDietFilter('non-veg')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                dietFilter === 'non-veg'
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'bg-purple-950/40 border border-purple-500/20 text-rose-400 hover:bg-purple-900/40'
              }`}
            >
              <Drumstick className="w-3.5 h-3.5" />
              <span>Non-Veg</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-purple-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.checked)}
                className="w-4 h-4 rounded text-teal-400 focus:ring-teal-400 border-purple-500/30 accent-teal-400"
              />
              <span>In Stock Only</span>
            </label>

            {foodItems.length < 15 && (
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="text-xs px-3 py-1 rounded-xl bg-purple-900/40 hover:bg-purple-800 text-teal-300 border border-purple-500/30 flex items-center gap-1.5 transition"
              >
                {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                <span>Fill 26+ Items</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="glass-card rounded-3xl h-72 animate-pulse border border-purple-500/20"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <div className="glass-card rounded-3xl border border-purple-500/20 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-purple-900/40 border border-purple-500/30 text-teal-300 flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No items found</h3>
          <p className="text-xs text-purple-300/70 mb-6">
            We couldn't find any food items matching your search or dietary filter.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setDietFilter('all');
                setAvailabilityFilter(false);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-teal-400 text-white font-semibold text-xs shadow-md"
            >
              Reset Filters
            </button>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-4 py-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-teal-300 font-semibold text-xs hover:bg-purple-900/50 flex items-center gap-1.5"
            >
              {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Load 26+ Items</span>
            </button>
          </div>
        </div>
      )}

      {/* Food Items Grid */}
      {!loading && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onOpenDetails={(item) => setSelectedFood(item)}
            />
          ))}
        </div>
      )}

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
