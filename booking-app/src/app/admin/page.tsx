'use client';
// src/app/admin/page.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Lock, Mail, Loader2, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(`Welcome back, ${data.admin.name}!`);
        router.push('/admin/dashboard');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-saffron" />
            <span className="font-display text-white text-xl">Admin Portal</span>
          </div>
          <p className="text-deep-300 text-sm">Sign in to manage your bookings</p>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-deep-200 text-xs font-semibold uppercase tracking-wide mb-1.5">
                <Mail className="w-3 h-3 inline mr-1" />Email
              </label>
              <input
                type="email"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-deep-400
                           focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent transition-all"
                placeholder="admin@yourbusiness.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-deep-200 text-xs font-semibold uppercase tracking-wide mb-1.5">
                <Lock className="w-3 h-3 inline mr-1" />Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-deep-400
                           focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-saffron w-full flex items-center justify-center gap-2 py-3.5"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-deep-500 text-xs mt-6">
          Default: admin@yourbusiness.com / admin123
        </p>
      </div>
    </div>
  );
}
