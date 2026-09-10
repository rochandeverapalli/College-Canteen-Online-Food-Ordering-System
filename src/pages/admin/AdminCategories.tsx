import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import { Category } from '../../types';
import {
  subscribeToCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../firebase/firestore';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToCategories((data) => {
      setCategories(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openAddModal = () => {
    setEditingCat(null);
    setName('');
    setImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setImage(cat.image || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, {
          name: name.trim(),
          image: image.trim(),
        });
      } else {
        await createCategory(name.trim(), image.trim());
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error('Error saving category:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    const ok = window.confirm(`Are you sure you want to delete category "${catName}"?`);
    if (!ok) return;
    try {
      await deleteCategory(id);
    } catch (e) {
      console.error('Error deleting category:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Menu Categories
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Organize meals into breakfast, lunch, snacks, hot beverages, and desserts
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl border border-stone-200 p-4 shadow-2xs hover:shadow-md transition flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80'}
                alt={cat.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover bg-stone-100 shrink-0"
              />
              <div>
                <h4 className="font-bold text-stone-900 text-sm">{cat.name}</h4>
                <span className="text-[11px] font-mono text-stone-400 block">ID: {cat.id}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => openEditModal(cat)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition"
                title="Edit Category"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                {editingCat ? 'Edit Category' : 'Create New Category'}
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
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Indian Breakfast"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs"
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
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
