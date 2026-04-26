import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, User as UserIcon, Lock, Loader2, ArrowRight, Chrome } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid username or password. Please try again.');
      }
    } catch {
      setError('Connection failed. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', transform: 'translate(40%, -40%)' }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', transform: 'translate(-40%, 40%)' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-indigo-500/40"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Building2 className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">Smart Campus Hub</h1>
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mt-2">Operations Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text" required value={username}
                  onChange={(e) => setUsername(e.target.value)} placeholder="e.g. admin"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:bg-white/15 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Password</label>
                <span className="text-[10px] font-bold text-indigo-400 cursor-pointer hover:text-indigo-300">Forgot?</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:bg-white/15 transition-all font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-bold">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 group transition-all active:scale-[0.98] disabled:opacity-60 shadow-2xl shadow-indigo-500/30"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Google OAuth */}
            <a
              href="http://localhost:8080/oauth2/authorization/google"
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-3 transition-all hover:bg-white/15 border border-white/20 bg-white/5"
            >
              <Chrome className="w-5 h-5 text-rose-400" />
              Continue with Google
            </a>
          </form>

          <p className="text-center mt-8 text-sm text-slate-400 font-medium">
            New to Campus Hub?{' '}
            <Link to="/register" className="text-indigo-400 font-black hover:text-indigo-300 transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
