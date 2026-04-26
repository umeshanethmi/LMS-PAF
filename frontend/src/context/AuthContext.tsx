import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    picture?: string;
    phone?: string;
    department?: string;
    bio?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                // Check if token is expired
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    logout();
                } else {
                    setUser({
                        id: decoded.id || decoded.sub,
                        email: decoded.sub,
                        name: decoded.name || decoded.sub?.split('@')[0] || 'User',
                        role: decoded.role || 'USER',
                        picture: decoded.picture,
                        phone: decoded.phone,
                        department: decoded.department,
                        bio: decoded.bio
                    });
                }
            } catch (error) {
                console.error("Failed to decode token:", error);
                logout();
            }
        }
    }, [token]);

    const login = (newToken: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
