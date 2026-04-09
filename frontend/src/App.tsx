import { Component } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import IncidentTicketsPage from './pages/maintenance/IncidentTicketsPage';
import type { ErrorInfo, ReactNode } from 'react';

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
    <div className="App min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-slate-800">Smart Campus Operations Hub</h1>
          <div className="flex gap-4 items-center">
            <Link
              to="/tickets"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Maintenance Tickets
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium text-slate-700 hover:text-indigo-600"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl p-4">
        {/*
          Your AuthProvider is already wrapping <App /> inside main.tsx.
          We don't need to add it here again!
        */}
        <AppErrorBoundary>
          <Routes>
            {/* Default Route redirecting to tickets */}
            <Route path="/" element={<Navigate to="/tickets" replace />} />
            
            {/* Maintenance Ticketing Routes */}
            <Route path="/tickets" element={<IncidentTicketsPage />} />

            {/* Login Route (Using a placeholder until you create the real component) */}
            <Route path="/login" element={<div className="p-4 text-center">Login Page Under Construction</div>} />
            
            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/tickets" replace />} />
          </Routes>
        </AppErrorBoundary>
      </main>
    </div>
  );
}

export default App;