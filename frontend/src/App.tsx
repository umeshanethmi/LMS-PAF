import { Component } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import IncidentTicketsPage from './pages/maintenance/IncidentTicketsPage';
import DashboardPage from './pages/DashboardPage';
import type { ErrorInfo, ReactNode } from 'react';
import Sidebar from './components/common/Sidebar';
import { Bell, Search, User } from 'lucide-react';

// You can create and uncomment your LoginPage import here:
// import LoginPage from './pages/auth/LoginPage';

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

function App() {
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
            <button className="relative text-slate-500 hover:text-indigo-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">Admin User</p>
                <p className="text-xs text-slate-500">Super Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                <User className="w-5 h-5 text-indigo-600" />
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

              {/* Login Route */}
              <Route path="/login" element={<div className="p-4 text-center">Login Page Under Construction</div>} />
              
              {/* Placeholder Routes for Sidebar items */}
              <Route path="/notifications" element={<div className="p-4">Notifications Panel</div>} />
              <Route path="/profile" element={<div className="p-4">User Profile Settings</div>} />
              <Route path="/settings" element={<div className="p-4">Global System Settings</div>} />
              
              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/tickets" replace />} />
            </Routes>
          </AppErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default App;