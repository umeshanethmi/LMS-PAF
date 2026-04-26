import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const LoginSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            login(token);
            // Small delay to ensure state is updated before redirecting
            setTimeout(() => {
                navigate('/');
            }, 500);
        } else {
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="bg-white p-10 rounded-[32px] shadow-xl shadow-indigo-100/50 flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Authenticating...</h2>
                <p className="text-slate-500">Please wait while we set up your session.</p>
            </div>
        </div>
    );
};

export default LoginSuccess;
