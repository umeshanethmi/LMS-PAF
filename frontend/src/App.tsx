import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import IncidentTicketsPage from './pages/maintenance/IncidentTicketsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import BookingAssistantPage from './pages/BookingAssistantPage';
import MyBookingsPage from './pages/MyBookingsPage';
import { useAuth } from './contexts/AuthContext';
import './App.css';

const AUTH_ROUTES = ['/login', '/register'];

function AppShell() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isAuthRoute = AUTH_ROUTES.includes(location.pathname);

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 relative">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/admin" element={<DashboardPage overrideRole="ADMIN" />} />
          <Route path="/tech" element={<DashboardPage overrideRole="TECHNICIAN" />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/tickets" element={<IncidentTicketsPage />} />
          <Route path="/book" element={<BookingAssistantPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return <AppShell />;
}

export default App;
