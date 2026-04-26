import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock, Loader2, ArrowRight, CheckCircle } from 'lucide-react';

const RegisterPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Registration failed.');
      }
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
      {/* Decorative orbs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', transform: 'translate(-40%, -40%)' }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', transform: 'translate(40%, 40%)' }} />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', transform: 'translate(-50%, -50%)' }} />

      <div className="w-full max-w-md relative z-10">
        {success ? (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/40">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Account Created!</h2>
            <p className="text-slate-300 font-medium">Redirecting you to login...</p>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <GraduationCap className="text-white w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter">Join Campus Hub</h1>
              <p className="text-slate-400 text-sm mt-2 font-medium">Create your student account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    name="username" type="text" required value={form.username}
                    onChange={handleChange} placeholder="e.g. john_doe"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:bg-white/15 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    name="email" type="email" required value={form.email}
                    onChange={handleChange} placeholder="you@campus.edu"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:bg-white/15 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    name="password" type="password" required value={form.password}
                    onChange={handleChange} placeholder="Min 6 characters"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:bg-white/15 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    name="confirm" type="password" required value={form.confirm}
                    onChange={handleChange} placeholder="Repeat your password"
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
                className="w-full py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 group transition-all active:scale-[0.98] disabled:opacity-60 mt-2 shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center mt-8 text-sm text-slate-400 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 font-black hover:text-indigo-300 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
