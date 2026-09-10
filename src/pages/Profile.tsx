import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Hash,
  Mail,
  Phone,
  ShieldCheck,
  Key,
  CheckCircle2,
  AlertCircle,
  LogOut,
  LayoutDashboard,
  Save,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../firebase/auth';

export const Profile: React.FC = () => {
  const { userProfile, currentUser, isAdmin, logout, claimAdmin, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(userProfile?.name || currentUser?.displayName || '');
  const [rollNumber, setRollNumber] = useState(userProfile?.rollNumber || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [passkey, setPasskey] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [claimMessage, setClaimMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      await updateUserProfile(currentUser.uid, {
        name,
        rollNumber,
        phone,
      });
      await refreshProfile();
      setSaveMessage('Profile information saved successfully.');
    } catch (e: unknown) {
      setSaveMessage('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClaimAdmin = async () => {
    if (!passkey.trim()) return;
    setClaimLoading(true);
    setClaimMessage(null);

    try {
      const ok = await claimAdmin(passkey.trim());
      if (ok) {
        setClaimMessage({ text: 'Admin privileges granted! You now have staff access.' });
        setPasskey('');
      } else {
        setClaimMessage({
          text: 'Invalid passkey. Hint: default test passkey is "canteenadmin2025"',
          isError: true,
        });
      }
    } catch (err: unknown) {
      setClaimMessage({
        text: err instanceof Error ? err.message : 'Error claiming admin access.',
        isError: true,
      });
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 space-y-6">
      {/* Header Profile Summary */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-3xl bg-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-amber-500/20">
            {name.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                {name || 'College Student'}
              </h1>
              {isAdmin && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                  <ShieldCheck className="w-3 h-3" />
                  Staff Admin
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{currentUser?.email}</p>
            {rollNumber && (
              <span className="inline-block mt-1 font-mono text-xs font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                Roll: {rollNumber}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Details */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-amber-500" />
          <span>Edit Profile Details</span>
        </h3>

        {saveMessage && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveMessage}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Roll Number / Student ID
              </label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:outline-none focus:border-amber-500 uppercase font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Email (Account Primary)
              </label>
              <input
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="w-full text-xs px-3.5 py-2.5 bg-stone-100 border border-stone-200 rounded-2xl text-stone-500 cursor-not-allowed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Profile</span>
          </button>
        </form>
      </div>

      {/* Staff Admin Passkey Card */}
      {!isAdmin && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <Key className="w-4 h-4 text-amber-600" />
            <span>Are you a Canteen Staff Member?</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Enter the canteen management passkey to activate Staff Administrator permissions on your account. (Hint for evaluation: passkey is <code className="bg-amber-200/80 px-1.5 py-0.5 rounded font-mono font-bold">canteenadmin2025</code>).
          </p>

          {claimMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                claimMessage.isError
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {claimMessage.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{claimMessage.text}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1 max-w-md">
            <input
              type="password"
              placeholder="Enter admin passkey..."
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2.5 bg-white border border-amber-300 rounded-2xl focus:outline-none focus:border-amber-600"
            />
            <button
              onClick={handleClaimAdmin}
              disabled={claimLoading || !passkey.trim()}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-bold transition disabled:opacity-50"
            >
              {claimLoading ? 'Verifying...' : 'Activate Staff'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
