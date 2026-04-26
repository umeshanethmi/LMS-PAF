import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import './App.css';

function App() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 relative">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/admin" element={<DashboardPage overrideRole="ADMIN" />} />
          <Route path="/tech" element={<DashboardPage overrideRole="TECHNICIAN" />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/tickets" element={<DashboardPage />} />
          <Route path="/notifications" element={<DashboardPage />} />
          <Route path="/profile" element={<DashboardPage />} />
          <Route path="/settings" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;