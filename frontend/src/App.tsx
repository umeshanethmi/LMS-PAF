import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import DashboardPage from './pages/DashboardPage';
import { useAuth } from './contexts/AuthContext';
import { ShieldAlert, User, Wrench, Settings } from 'lucide-react';
import './App.css';

function RoleSwitcher() {
  const { role, setSimulationRole } = useAuth();
  
  return (
    <div className="fixed top-8 right-8 z-[100] bg-white border border-slate-200 p-1.5 rounded-2xl shadow-2xl flex items-center gap-1 animate-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4 mr-1">
        <ShieldAlert className="w-4 h-4 text-indigo-600" />
        Role Simulator
      </div>
      <div className="flex gap-1 bg-slate-50 p-1 rounded-xl">
        {[
          { id: 'user', icon: User, label: 'User' },
          { id: 'admin', icon: ShieldAlert, label: 'Admin' },
          { id: 'technician', icon: Wrench, label: 'Tech' }
        ].map((r) => (
          <button
            key={r.id}
            onClick={() => setSimulationRole(r.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
              role === r.id 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <r.icon className="w-3.5 h-3.5" />
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      <Sidebar />
      <RoleSwitcher />
      <main className="flex-1 overflow-y-auto p-8 relative">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tickets" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;