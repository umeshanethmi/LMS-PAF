import { Component } from 'react';
import { useLocation, Navigate, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import IncidentTicketsPage from './pages/maintenance/IncidentTicketsPage';
import DashboardPage from './pages/DashboardPage';
import type { ErrorInfo, ReactNode } from 'react';
import Sidebar from './components/common/Sidebar';
import { Bell, Search, User } from 'lucide-react';



interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, message: error.message || 'Unknown runtime error' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Runtime UI error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-left text-sm text-rose-700">
          <p className="font-semibold">Frontend runtime error</p>
          <p className="mt-1 break-words">{this.state.message}</p>
          <p className="mt-2 text-xs">Open browser console for stack trace details.</p>
        </div>
      );
    }

    return this.props.children;
  }
}


import LoginPage from './pages/auth/LoginPage';
import LoginSuccess from './pages/auth/LoginSuccess';
import RegisterPage from './pages/auth/RegisterPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import NotificationPage from './pages/NotificationPage';

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/login/success' || location.pathname === '/register';

  if (isLoginPage) {
    return (
      <AppErrorBoundary>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/success" element={<LoginSuccess />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AppErrorBoundary>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-96 max-w-lg">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="bg-transparent border-none outline-none text-sm text-slate-600 w-full placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-6">
            <Link to="/notifications" className="relative text-slate-500 hover:text-indigo-600 transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500">{user?.role || 'Member'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 overflow-hidden">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-indigo-600" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-8">
          <AppErrorBoundary>
            <Routes>
              {/* Main Routes */}
              <Route path="/" element={<DashboardPage />} />
              
              {/* Maintenance Ticketing Routes */}
              <Route path="/tickets" element={<IncidentTicketsPage />} />
              <Route path="/notifications" element={<NotificationPage />} />
              <Route path="/profile" element={<div className="p-4">User Profile Settings</div>} />
              <Route path="/settings" element={<div className="p-4">Global System Settings</div>} />
              
              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppErrorBoundary>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;