import React, { useState } from 'react';
import { ShieldCheck, Zap, Mail, Lock, User as UserIcon, Loader2, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirm: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirm) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        setError('');
        
        try {
            const response = await fetch('http://localhost:9090/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: formData.name, 
                    email: formData.email, 
                    password: formData.password 
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-inter text-slate-800">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-rose-200/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl shadow-indigo-100/50 p-10 relative z-10 border border-white">
                <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-8 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-semibold">Back to Login</span>
                </Link>

                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                        <Zap className="w-7 h-7 text-white fill-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h2>
                    <p className="text-slate-500 mt-2 font-medium">Join the Smart Campus community</p>
                </div>

                {success ? (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 py-8 px-4 rounded-2xl text-center animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-xl">Registration Successful!</h3>
                        <p className="text-sm mt-1 font-medium">Redirecting you to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input 
                                    name="name"
                                    type="text" 
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-800 font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input 
                                    name="email"
                                    type="email" 
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@university.edu"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-800 font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input 
                                    name="password"
                                    type="password" 
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-800 font-medium"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input 
                                    name="confirm"
                                    type="password" 
                                    value={formData.confirm}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-800 font-medium"
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
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 group"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                )}

                <p className="text-center mt-8 text-sm text-slate-500 font-medium">
                    Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
