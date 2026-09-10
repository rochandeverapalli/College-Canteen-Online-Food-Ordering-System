import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  User,
  Hash,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(name, rollNumber, email, password, phone);
      navigate('/menu', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please check inputs.');
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
            Student Registration
          </h2>
          <p className="text-xs text-stone-500">
            Register your college ID to order canteen meals online
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Student Roll Number / College ID
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="21BCSE104"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500 uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              College Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="aarav@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
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
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-stone-500">
          Already registered?{' '}
          <Link to="/login" className="text-amber-700 font-bold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};
