import { useState } from 'react';
import { Loader2, Lock, Mail, ShieldCheck, Zap, BellRing } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(identifier.trim(), password);
      navigate('/');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-rose-200/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[32px] shadow-2xl shadow-indigo-200/50 overflow-hidden relative z-10 border border-white">
        <div className="hidden md:flex flex-col justify-between p-12 bg-indigo-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:24px_24px]"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-indigo-600 fill-indigo-600" />
              </div>
              <span className="text-xl font-bold tracking-tight">SmartCampus Hub</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-tight mb-6 text-white">
              Manage Campus <br />
              <span className="text-indigo-200">Operations with AI</span>
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed mb-8 max-w-sm">
              The all-in-one platform for facility booking, ticketing, and real-time smart notifications.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-500/50 rounded-lg flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">Secure RBAC</p>
                  <p className="text-sm text-indigo-100">Role-based access for admins, instructors and students.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-500/50 rounded-lg flex items-center justify-center shrink-0">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">Smart Booking</p>
                  <p className="text-sm text-indigo-100">Chat-driven assistant finds the right hall or lab for you.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-indigo-200 text-sm">
            © 2026 LMS PAF. All rights reserved.
          </div>
        </div>

        <div className="p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500 mb-8">Sign in to access your dashboard.</p>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email or username</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin@sliit.lk"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-slate-800"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm py-3 px-4 rounded-xl font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
              </button>
            </form>

            <p className="text-xs text-slate-400 text-center pt-4 border-t border-slate-100">
              Try <code className="bg-slate-100 px-1 rounded">admin@sliit.lk / Admin123</code>,
              {' '}<code className="bg-slate-100 px-1 rounded">instructor / instructor123</code>, or
              {' '}<code className="bg-slate-100 px-1 rounded">student / student123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
