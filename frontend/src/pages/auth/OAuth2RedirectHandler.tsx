import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const OAuth2RedirectHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            loginWithToken(token);
            navigate('/', { replace: true });
        } else {
            navigate('/login', { replace: true });
        }
    }, [location, navigate, loginWithToken]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
                <h2 className="text-white text-xl font-bold">Finishing secure login...</h2>
                <p className="text-slate-400">Welcome to Smart Campus Hub</p>
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;
