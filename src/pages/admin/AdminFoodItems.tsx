import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Clock,
  Star,
  Leaf,
  Drumstick,
  Loader2,
  Database,
  Sparkles,
} from 'lucide-react';
import { FoodItem, Category } from '../../types';
import {
  subscribeToFoodItems,
  subscribeToCategories,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  toggleFoodAvailability,
  seedCanteenDemoData,
} from '../../firebase/firestore';

export const AdminFoodItems: React.FC = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number>(50);
  const [preparationTime, setPreparationTime] = useState<number>(10);
  const [isVeg, setIsVeg] = useState(true);
  const [available, setAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubFood = subscribeToFoodItems((items) => {
      setFoodItems(items);
      setLoading(false);
    });

    const unsubCats = subscribeToCategories((cats) => {
      setCategories(cats);
    });

    return () => {
      unsubFood();
      unsubCats();
    };
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategoryId(categories[0]?.id || 'breakfast');
    setPrice(60);
    setPreparationTime(10);
    setIsVeg(true);
    setAvailable(true);
    setImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: FoodItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategoryId(item.categoryId);
    setPrice(item.price);
    setPreparationTime(item.preparationTime || 10);
    setIsVeg(item.isVeg);
    setAvailable(item.available);
    setImageUrl(item.imageUrl || '');
    setDescription(item.description);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedCat = categories.find((c) => c.id === categoryId);
      const catName = selectedCat ? selectedCat.name : categoryId;

      const payload = {
        name,
        categoryId,
        categoryName: catName,
        price: Number(price),
        preparationTime: Number(preparationTime),
        isVeg,
        available,
        imageUrl: imageUrl.trim(),
        description: description.trim(),
        rating: editingItem?.rating || 4.5,
      };

      if (editingItem) {
        await updateFoodItem(editingItem.id, payload);
      } else {
        await createFoodItem(payload);
      }

      setIsModalOpen(false);
    } catch (e) {
      console.error('Error saving food item:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, itemName: string) => {
    const ok = window.confirm(`Are you sure you want to remove "${itemName}" from the canteen menu?`);
    if (!ok) return;
    try {
      await deleteFoodItem(id);
    } catch (e) {
      console.error('Error deleting food item:', e);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleFoodAvailability(id, !current);
    } catch (e) {
      console.error('Error toggling availability:', e);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    await seedCanteenDemoData();
    setSeeding(false);
  };

  const filteredItems = foodItems.filter((item) => {
    if (categoryFilter !== 'all' && item.categoryId !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        item.name.toLowerCase().includes(q) ||
        item.categoryName?.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Canteen Menu Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Add food items, update prices, and toggle in-stock / out-of-stock live
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Food Item</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              categoryFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            All Categories ({foodItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                categoryFilter === cat.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Table / Grid */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Prep Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Live Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80'}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover shrink-0 bg-stone-100"
                      />
                      <div>
                        <span className="font-bold text-stone-900 block">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-stone-400 line-clamp-1 max-w-[180px]">
                          {item.description}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-semibold text-stone-700">
                    {item.categoryName || item.categoryId}
                  </td>

                  <td className="py-3 px-4 font-black text-stone-900">
                    ₹{item.price}
                  </td>

                  <td className="py-3 px-4 text-stone-600">
                    ~{item.preparationTime || 10}m
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-3.5 h-3.5 border flex items-center justify-center rounded-xs ${
                          item.isVeg ? 'border-emerald-600' : 'border-rose-700'
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-rose-700'
                          }`}
                        />
                      </div>
                      <span className="font-medium text-[11px] text-stone-700">
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggle(item.id, item.available)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition shadow-2xs ${
                        item.available
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                      title="Click to toggle in/out of stock"
                    >
                      {item.available ? '● In Stock' : '✕ Out of Stock'}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition"
                        title="Edit Item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && !loading && (
          <div className="py-12 text-center text-stone-400 text-xs">
            No items match this category or search query.
          </div>
        )}
      </div>

      {/* Add / Edit Food Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                {editingItem ? 'Edit Canteen Food Item' : 'Add New Food Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Food Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Dosa with Chutney"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Preparation Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Dietary Classification
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsVeg(true)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                        isVeg
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-white border-stone-200 text-stone-500'
                      }`}
                    >
                      Pure Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsVeg(false)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                        !isVeg
                          ? 'bg-rose-50 border-rose-500 text-rose-800'
                          : 'bg-white border-stone-200 text-stone-500'
                      }`}
                    >
                      Non-Veg
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Crispy crepe made from fermented batter, served with coconut chutney & sambar."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                />
                <label htmlFor="availCheck" className="text-xs font-semibold text-stone-700 cursor-pointer">
                  Available in Canteen Stock Today
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Food Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
