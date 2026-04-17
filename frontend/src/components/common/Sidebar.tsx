import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutGrid,
  Ticket, 
  Settings, 
  User, 
  Bell,
  ChevronRight,
  ShieldCheck,
  Inbox,
  Briefcase,
  LogOut
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';

function Sidebar({ overrideRole }: { overrideRole?: 'user' | 'admin' | 'technician' }) {
  const { user, role: authRole, logout } = useAuth();
  const role = overrideRole || authRole;
  
  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/' },
    { 
      icon: Inbox, 
      label: role === 'admin' ? 'Manage Incidents' : role === 'technician' ? 'Assigned Tasks' : 'My Tickets', 
      path: '/tickets' 
    },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'My Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="w-80 h-screen bg-slate-900 text-white flex flex-col overflow-hidden relative border-r border-white/5 shrink-0 shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
      
      {/* Brand Section */}
      <div className="p-8">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/30 transition-transform group-hover:scale-110 group-active:scale-95 duration-300">
             <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white">CampusHub</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1.5">v2.4.0 • Enterprise</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1.5 py-6 custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `
              group relative flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300
              ${isActive 
                ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'}
            `}
          >
            {({ isActive }) => (
              <>
                {!isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-600 rounded-r-full scale-0 group-hover:scale-100 transition-transform origin-left"></div>
                )}
                <div className="flex items-center gap-3.5 relative z-10">
                  <div className={`p-1 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0'}`} />
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-white/5 m-4 bg-white/5 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-200 border border-white/20">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-black truncate text-slate-200">{user?.username || 'Guest System'}</p>
            <p className="text-[9px] text-slate-400 truncate uppercase font-black tracking-widest mt-0.5">{role || 'Unassigned'}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
