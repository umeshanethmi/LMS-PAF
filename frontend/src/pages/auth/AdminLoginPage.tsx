import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert, Lock, Loader2, ArrowRight, ShieldCheck, Terminal } from 'lucide-react';

const AdminLoginPage = () => {
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
        // We check if it's actually an admin after login if we wanted to be strict
        // But the context update will naturally handle the role.
        navigate('/');
      } else {
        setError('Authentication Failed. Unauthorized Administrative Access Attempt.');
      }
    } catch (err) {
      setError('Internal Security System Offline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-mono text-slate-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-slate-900 border border-white/10 rounded-none shadow-2xl overflow-hidden">
          <div className="bg-indigo-600 px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <ShieldAlert className="w-4 h-4 text-white" />
               <span className="text-[10px] font-black uppercase tracking-widest text-white">Security Gateway v4.0</span>
            </div>
            <div className="flex gap-1.5">
               <div className="w-2 h-2 rounded-full bg-white/20"></div>
               <div className="w-2 h-2 rounded-full bg-white/20"></div>
            </div>
          </div>

          <div className="p-12">
            <div className="mb-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6 shadow-glow transition-all hover:bg-white/10">
                 <Terminal className="text-white w-10 h-10" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-widest uppercase text-center">Admin Command</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">Restricted Infrastructure Access</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <span className="w-1 h-1 bg-indigo-500"></span> 0x_Administrator_ID
                </label>
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 px-6 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                  placeholder="Root UID"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <span className="w-1 h-1 bg-indigo-500"></span> 0x_Secure_Keyphrase
                </label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 px-6 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                  ERROR: {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-white hover:bg-indigo-600 hover:text-white text-slate-900 font-black py-5 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Initialize Override
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
              <span>Encrypted P2P Connection</span>
              <span>Layer 7 Protected</span>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[10px] font-bold text-slate-700 uppercase tracking-widest">
           &copy; 2026 Smart Campus Infrastructure Security
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
