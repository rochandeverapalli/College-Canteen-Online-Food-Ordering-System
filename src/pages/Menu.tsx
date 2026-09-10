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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">
            Canteen Menu
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Select items, customize quantities, and order ahead without waiting in line
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search food by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-stone-200 rounded-2xl focus:outline-none focus:border-amber-500 shadow-2xs transition placeholder:text-stone-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills & Diet Filter Tabs */}
      <div className="space-y-3 mb-8">
        {/* Category Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
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
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Dietary & Stock Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDietFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                dietFilter === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Diets
            </button>
            <button
              onClick={() => setDietFilter('veg')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                dietFilter === 'veg'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-100 text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Veg Only</span>
            </button>
            <button
              onClick={() => setDietFilter('non-veg')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                dietFilter === 'non-veg'
                  ? 'bg-rose-700 text-white'
                  : 'bg-stone-100 text-rose-800 hover:bg-rose-50'
              }`}
            >
              <Drumstick className="w-3.5 h-3.5" />
              <span>Non-Veg</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-stone-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 animate-pulse"
            >
              <div className="h-44 bg-stone-200 rounded-xl" />
              <div className="h-4 bg-stone-200 rounded w-3/4" />
              <div className="h-3 bg-stone-200 rounded w-full" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-6 bg-stone-200 rounded w-16" />
                <div className="h-8 bg-stone-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">
            No food items found
          </h3>
          <p className="text-xs text-stone-500 mb-6">
            {searchQuery
              ? `No menu items match "${searchQuery}". Try clearing filters or searching for something else.`
              : 'No items currently available in this category.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {(searchQuery || selectedCategory !== 'all' || dietFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setDietFilter('all');
                  setAvailabilityFilter(false);
                }}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold"
              >
                Reset All Filters
              </button>
            )}

            {foodItems.length === 0 && (
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-2"
              >
                {seeding ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Database className="w-3.5 h-3.5" />
                )}
                <span>Seed Realistic Canteen Menu</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Food Grid */}
      {!loading && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
      <FoodDetailsModal
        food={selectedFood}
        onClose={() => setSelectedFood(null)}
      />
    </div>
  );
};
