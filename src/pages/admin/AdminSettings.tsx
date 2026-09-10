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
    announcement: 'Fresh meals prepared hot every day at your College Canteen.',
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
      'Re-seed canteen menu? This will populate initial menu items and categories.'
    );
    if (!confirmed) return;

    setIsSeeding(true);
    try {
      await seedCanteenDemoData();
      alert('Demo canteen food items and categories have been seeded into Firestore!');
    } catch (e) {
      console.error('Error seeding data:', e);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Canteen Operations & System Settings
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Configure operating hours, kitchen capacity toggles, counter pickup points, and announcements
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Master Emergency Switch */}
        <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-sm font-bold text-stone-900 block">
              Accepting Online Orders (Master Kitchen Switch)
            </span>
            <p className="text-xs text-stone-500 mt-0.5">
              Turn OFF when canteen kitchen is overloaded with counter orders or closing for the day.
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
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-2 ${
              settings.acceptingOrders
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{settings.acceptingOrders ? 'ONLINE (Accepting)' : 'PAUSED (Closed)'}</span>
          </button>
        </div>

        {/* Operating Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Opening Time
            </label>
            <input
              type="time"
              value={settings.openingTime || '08:00'}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, openingTime: e.target.value }))
              }
              className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Closing Time
            </label>
            <input
              type="time"
              value={settings.closingTime || '20:30'}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, closingTime: e.target.value }))
              }
              className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Daily Announcement Banner */}
        <div>
          <label className="text-xs font-bold text-stone-700 block mb-1">
            Student Announcement Banner
          </label>
          <input
            type="text"
            placeholder="e.g. Fresh Chicken Biryani available from 12:30 PM today!"
            value={settings.announcement || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, announcement: e.target.value }))
            }
            className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
          />
          <p className="text-[11px] text-stone-400 mt-1">
            Appears at the very top of the homepage for all visiting students.
          </p>
        </div>

        {/* Counter Number */}
        <div>
          <label className="text-xs font-bold text-stone-700 block mb-1">
            Collection Counter Identification
          </label>
          <input
            type="text"
            placeholder="Counter 1 & 2 (Main Food Hall)"
            value={settings.counterNumber || ''}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, counterNumber: e.target.value }))
            }
            className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs shadow-md transition flex items-center gap-2"
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
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-500" />
          <span>Demo Data Management</span>
        </h3>
        <p className="text-xs text-stone-500">
          Reset or re-populate authentic college canteen menu items (Biryani, Masala Dosa, Burgers, Samosas, Chai, Cold Coffee) for demonstrations and testing.
        </p>

        <button
          type="button"
          onClick={handleSeedMenu}
          disabled={isSeeding}
          className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition flex items-center gap-2"
        >
          {isSeeding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>Seed / Re-seed Canteen Menu Items</span>
        </button>
      </div>
    </div>
  );
};
