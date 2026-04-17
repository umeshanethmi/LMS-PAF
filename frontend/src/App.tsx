import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import DashboardPage from './pages/DashboardPage';
import './App.css';

function App() {
  const location = useLocation();
  
  // Determine if we are on a role-specific route
  let overrideRole: 'user' | 'admin' | 'technician' | undefined = undefined;
  if (location.pathname === '/admin') overrideRole = 'admin';
  else if (location.pathname === '/tech') overrideRole = 'technician';
  else if (location.pathname === '/') overrideRole = 'user';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      <Sidebar overrideRole={overrideRole} />
      <main className="flex-1 overflow-y-auto p-8 relative">
        <Routes>
          <Route path="/" element={<DashboardPage overrideRole="user" />} />
          <Route path="/admin" element={<DashboardPage overrideRole="admin" />} />
          <Route path="/tech" element={<DashboardPage overrideRole="technician" />} />
          <Route path="/tickets" element={<DashboardPage overrideRole={overrideRole} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;