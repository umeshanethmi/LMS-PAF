import { useState } from 'react';
import { ShieldCheck, Zap, BellRing, Mail, Lock, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:9090/oauth2/authorization/google';
    };

    const handleManualLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const response = await fetch('http://localhost:9090/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                login(data.token);
                navigate('/');
            } else {
                setError(data.message || 'Invalid email or password');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-inter text-slate-800">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-rose-200/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[32px] shadow-2xl shadow-indigo-200/50 overflow-hidden relative z-10 border border-white">
                {/* Left Side: Branding/Info */}
                <div className="hidden md:flex flex-col justify-between p-12 bg-indigo-600 text-white relative overflow-hidden">
                    {/* Pattern Overlay */}
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
                            The all-in-one platform for campus safety, ticketing, and real-time smart notifications.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-indigo-500/50 rounded-lg flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Secure RBAC</p>
                                    <p className="text-sm text-indigo-100">Enterprise-grade role-based access control.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-indigo-500/50 rounded-lg flex items-center justify-center shrink-0">
                                    <BellRing className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Smart Alerts</p>
                                    <p className="text-sm text-indigo-100">Stay updated with instant push notifications.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 text-indigo-200 text-sm">
                        © 2024 Smart Campus Hub. All rights reserved.
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="p-12 flex flex-col justify-center">
                    <div className="max-w-sm mx-auto w-full">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                        <p className="text-slate-500 mb-8">Please sign in to access your dashboard.</p>

                        <form onSubmit={handleManualLogin} className="space-y-4 mb-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@university.edu"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-slate-800"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-semibold text-slate-700">Password</label>
                                    <span className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer">Forgot?</span>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-slate-800"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm py-3 px-4 rounded-xl font-medium animate-in fade-in zoom-in-95 duration-200">
                                    {error}
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                            </button>
                        </form>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-4 text-slate-400 font-semibold">Or continue with</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-100 py-4 px-6 rounded-2xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-100/50 transition-all active:scale-[0.98] group"
                        >
                            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path fill="#EA4335" d="M12 5.04c1.9 0 3.53.68 4.87 1.92l3.62-3.62C18.23 1.34 15.35 0 12 0 7.31 0 3.26 2.69 1.18 6.63l4.22 3.27C6.4 7.21 8.97 5.04 12 5.04z" />
                                <path fill="#4285F4" d="M23.49 12.27c0-.85-.07-1.66-.22-2.45H12v4.62h6.45c-.28 1.48-1.12 2.74-2.38 3.58l3.71 2.87c2.17-2 3.42-4.94 3.42-8.62z" />
                                <path fill="#FBBC05" d="M5.4 14.75c-.24-.72-.37-1.48-.37-2.25s.13-1.53.37-2.25L1.18 6.63C.43 8.24 0 10.06 0 12c0 1.94.43 3.76 1.18 5.37l4.22-3.27z" />
                                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.71-2.87c-1.04.7-2.38 1.11-4.23 1.11-3.03 0-5.6-2.17-6.52-5.09l-4.22 3.27C3.26 21.31 7.31 24 12 24z" />
                            </svg>
                            Google
                        </button>

                        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                            <Link 
                                to="/admin-login"
                                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Shield className="w-3 h-3" />
                                Administrative Gateway
                            </Link>
                        </div>

                        <p className="mt-6 text-center text-sm text-slate-500 font-medium">
                            Don't have an account? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Create Account</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer Links */}
            <div className="fixed bottom-8 text-slate-400 text-sm flex gap-8">
                <span className="hover:text-slate-600 cursor-pointer">Support</span>
                <span className="hover:text-slate-600 cursor-pointer">Documentation</span>
                <span className="hover:text-slate-600 cursor-pointer">Status</span>
            </div>
        </div>
    );
};

export default LoginPage;
