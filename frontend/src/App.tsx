import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import IncidentTicketsPage from './pages/maintenance/IncidentTicketsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function App() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 relative">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/student" element={<DashboardPage overrideRole="USER" />} />
          <Route path="/tech" element={<DashboardPage overrideRole="TECHNICIAN" />} />
          <Route path="/admin" element={<DashboardPage overrideRole="ADMIN" />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/tickets" element={<IncidentTicketsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;