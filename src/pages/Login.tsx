import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UtensilsCrossed,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Hash,
  ShieldCheck,
  UserCheck,
  Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/menu';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(identifier, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Preset demo accounts for instant evaluation
  const handleQuickFill = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setError(null);
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
            Sign In to CampusBites
          </h2>
          <p className="text-xs text-stone-500">
            Enter your Roll Number or Mobile Number and Password
          </p>
        </div>

        {/* Demo Fast-Login Presets Card */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2">
          <span className="text-[11px] font-bold text-stone-600 block uppercase tracking-wider">
            Quick Testing Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('21CS042', 'password123')}
              className="py-2 px-3 bg-white border border-stone-200 rounded-xl text-left hover:border-amber-400 hover:bg-amber-50/30 transition shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">Student Demo</span>
                <UserCheck className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600" />
              </div>
              <div className="text-[10px] text-stone-500 font-mono mt-0.5">Roll: 21CS042</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('STAFF01', 'admin12345')}
              className="py-2 px-3 bg-white border border-amber-300 rounded-xl text-left hover:bg-amber-50 transition shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">Admin Staff</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-[10px] text-stone-500 font-mono mt-0.5">Roll: STAFF01</div>
            </button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="flex-1 leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Roll Number or Mobile Number
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. 21CS042 or 9812345678"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <span className="text-[10px] text-stone-400 mt-1 block">
              You can log in using either your assigned roll number or registered mobile number.
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-xs text-stone-500">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="text-amber-600 font-bold hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
