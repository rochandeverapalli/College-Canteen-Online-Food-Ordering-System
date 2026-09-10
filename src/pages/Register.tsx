import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  User,
  Hash,
  Phone,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!rollNumber.trim()) {
      setError('Please enter your college Roll Number or Staff ID.');
      return;
    }

    const cleanMobile = mobileNumber.trim().replace(/[^0-9+]/g, '');
    if (!cleanMobile || cleanMobile.length < 7) {
      setError('Please enter a valid mobile number (at least 7 digits).');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await register(
        name,
        rollNumber,
        cleanMobile,
        password,
        isStaff ? passkey : undefined
      );
      navigate('/menu', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md shadow-amber-500/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            Create Canteen Account
          </h2>
          <p className="text-xs text-stone-500">
            Register using your College Roll Number & Mobile Number
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="flex-1 leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Full Name */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* 2. Roll Number */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Roll Number / College ID *
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. 21CS042 or STAFF02"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 uppercase focus:bg-white focus:outline-none focus:border-amber-500 transition font-mono"
              />
            </div>
          </div>

          {/* 3. Mobile Number */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Mobile Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="e.g. 9812345678"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Used for order token SMS and counter verification.
            </span>
          </div>

          {/* 4. Password */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Optional Staff Registration */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700 select-none">
              <input
                type="checkbox"
                checked={isStaff}
                onChange={(e) => setIsStaff(e.target.checked)}
                className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Register as Canteen Staff / Kitchen Manager</span>
            </label>

            {isStaff && (
              <div className="mt-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5 animate-fadeIn">
                <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Canteen Staff Passkey</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter CANTEEN_STAFF_2025"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-mono"
                />
                <p className="text-[10px] text-amber-700">
                  Staff passkey for testing: <code className="font-bold">CANTEEN_STAFF_2025</code>
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-stone-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-amber-600 font-bold hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
