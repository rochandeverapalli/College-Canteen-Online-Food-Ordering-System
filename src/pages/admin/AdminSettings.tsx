import React, { useEffect, useState } from 'react';
import {
  Settings,
  Power,
  Clock,
  Sparkles,
  Save,
  CheckCircle2,
  Database,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { CanteenSetting } from '../../types';
import {
  subscribeToCanteenSettings,
  updateCanteenSettings,
  seedCanteenDemoData,
} from '../../firebase/firestore';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<CanteenSetting>({
    acceptingOrders: true,
    canteenName: 'Main Campus Canteen',
    openingTime: '08:00',
    closingTime: '20:30',
    announcement: 'Fresh hot meals & beverages prepared daily at the College Canteen.',
    counterNumber: 'Counter 1 & 2',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToCanteenSettings((data) => {
      setSettings(data);
    });
    return () => unsub();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);

    try {
      await updateCanteenSettings(settings);
      setSuccessMsg('Canteen operational settings saved successfully!');
    } catch (e) {
      console.error('Error updating settings:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeedMenu = async () => {
    const confirmed = window.confirm(
      'Re-seed canteen menu? This will populate 26+ food items and categories.'
    );
    if (!confirmed) return;

    setIsSeeding(true);
    try {
      await seedCanteenDemoData();
      alert('26+ food items and categories seeded successfully!');
    } catch (e) {
      console.error('Error seeding data:', e);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card rounded-3xl border border-purple-500/20 p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl font-black text-white tracking-tight">
          Canteen Operations & Counter Settings
        </h1>
        <p className="text-xs sm:text-sm text-purple-300/80 mt-1">
          Configure operating hours, order acceptance switch, collection counters, and broadcast messages
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="glass-card rounded-3xl border border-purple-500/20 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Master Emergency Switch */}
        <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-sm font-bold text-white block">
              Accepting Online Orders (Master Counter Switch)
            </span>
            <p className="text-xs text-purple-300/70 mt-0.5">
              Turn OFF when canteen kitchen is overloaded or closed for the day.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSettings((prev) => ({
                ...prev,
                acceptingOrders: !prev.acceptingOrders,
              }))
            }
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 ${
              settings.acceptingOrders
                ? 'bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-teal-400/30'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{settings.acceptingOrders ? 'ONLINE (Accepting)' : 'PAUSED (Closed)'}</span>
          </button>
        </div>

        {/* Operating Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-purple-200 block mb-1">
              Opening Time
            </label>
            <input
              type="time"
              value={settings.openingTime || '08:00'}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, openingTime: e.target.value }))
              }
              className="w-full text-xs px-3.5 py-2.5 bg-purple-950/40 border border-purple-500/30 rounded-xl text-white outline-none focus:border-teal-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-purple-200 block mb-1">
              Closing Time
            </label>
            <input
              type="time"
              value={settings.closingTime || '20:30'}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, closingTime: e.target.value }))
              }
              className="w-full text-xs px-3.5 py-2.5 bg-purple-950/40 border border-purple-500/30 rounded-xl text-white outline-none focus:border-teal-400"
            />
          </div>
        </div>

        {/* Daily Announcement Banner */}
        <div>
          <label className="text-xs font-bold text-purple-200 block mb-1">
            Student Announcement Banner
          </label>
          <input
            type="text"
            placeholder="e.g. Fresh Chicken Biryani and Masala Dosa available hot at Counter 1!"
            value={settings.announcement || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, announcement: e.target.value }))
            }
            className="w-full text-xs px-3.5 py-2.5 bg-purple-950/40 border border-purple-500/30 rounded-xl text-white outline-none focus:border-teal-400"
          />
          <p className="text-[11px] text-purple-300/60 mt-1">
            Displayed on student view and checkout notices.
          </p>
        </div>

        {/* Counter Number */}
        <div>
          <label className="text-xs font-bold text-purple-200 block mb-1">
            Collection Counter Identification
          </label>
          <input
            type="text"
            placeholder="Counter 1 & 2 (Main Food Court)"
            value={settings.counterNumber || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, counterNumber: e.target.value }))
            }
            className="w-full text-xs px-3.5 py-2.5 bg-purple-950/40 border border-purple-500/30 rounded-xl text-white outline-none focus:border-teal-400"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-400 hover:from-purple-500 hover:to-teal-300 text-white font-bold rounded-2xl text-xs shadow-lg shadow-purple-600/30 transition flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save All Canteen Settings</span>
          </button>
        </div>
      </form>

      {/* Database Maintenance & Seeding Card */}
      <div className="glass-card rounded-3xl border border-purple-500/20 p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-teal-400" />
          <span>Menu Database Maintenance</span>
        </h3>
        <p className="text-xs text-purple-300/80">
          Populate or refresh the full catalog with 26+ authentic canteen specialties across Breakfast, Meals, Snacks, Beverages, and Fast Food.
        </p>

        <button
          type="button"
          onClick={handleSeedMenu}
          disabled={isSeeding}
          className="px-5 py-2.5 bg-purple-900/60 hover:bg-purple-800 text-teal-300 border border-purple-500/30 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
        >
          {isSeeding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>Seed / Re-seed 26+ Canteen Food Items</span>
        </button>
      </div>
    </div>
  );
};
