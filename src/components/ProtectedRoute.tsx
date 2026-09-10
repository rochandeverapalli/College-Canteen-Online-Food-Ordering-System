import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, KeyRound, Loader2, Sparkles } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { isAdmin, loading, loginAsAdminWithPasskey } = useAuth();
  const [passkey, setPasskey] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        <p className="text-sm font-medium text-purple-300">Checking authorization...</p>
      </div>
    );
  }

  // If route requires admin and user is not verified as admin yet, render the sleek Staff Passkey modal
  if (requireAdmin && !isAdmin) {
    const handleVerify = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!passkey.trim()) {
        setErrorMsg('Please enter the canteen staff passkey');
        return;
      }
      setVerifying(true);
      setErrorMsg('');
      try {
        const ok = await loginAsAdminWithPasskey(passkey);
        if (!ok) {
          setErrorMsg('Invalid staff passkey. Use: CANTEEN_STAFF_2025');
        }
      } catch (err) {
        setErrorMsg('Authentication error');
      } finally {
        setVerifying(false);
      }
    };

    const handleQuickUnlock = async () => {
      setVerifying(true);
      await loginAsAdminWithPasskey('CANTEEN_STAFF_2025');
      setVerifying(false);
    };

    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-purple-500/30 shadow-[0_12px_40px_rgba(147,51,234,0.25)] relative overflow-hidden text-center">
          {/* Ambient glow in background */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-teal-400 p-0.5 mx-auto mb-5 shadow-lg shadow-purple-600/30">
            <div className="w-full h-full bg-[#0d0a21] rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-teal-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Staff & Kitchen Portal</h2>
          <p className="text-purple-300 text-sm mb-6 leading-relaxed">
            Enter the canteen management passkey to access live orders, token dispatcher, and menu controls.
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-left">
              <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">
                Staff Passkey
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="e.g. CANTEEN_STAFF_2025"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-purple-950/40 border border-purple-500/30 focus:border-teal-400 text-white placeholder-purple-400/50 outline-none transition-all"
                />
              </div>
              {errorMsg && (
                <p className="text-xs text-rose-400 mt-2 font-medium">{errorMsg}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-400 hover:from-purple-500 hover:to-teal-300 text-white font-semibold shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Unlock Staff Portal'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-purple-500/20">
            <button
              onClick={handleQuickUnlock}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-purple-900/40 hover:bg-purple-800/50 border border-purple-500/30 text-teal-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:border-teal-400/50"
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              1-Click Instant Staff Access (Demo)
            </button>
            <p className="text-[11px] text-purple-400/70 mt-2">
              Default passkey: <code className="text-teal-300">CANTEEN_STAFF_2025</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
