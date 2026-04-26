import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  Settings, 
  LogOut, 
  User, 
  Bell, 
  ChevronRight,
  HelpCircle
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Ticket, label: 'Maintenance', path: '/tickets' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'Profile', path: '/profile' },
    ...(isAdmin ? [{ icon: Settings, label: 'Settings', path: '/settings' }] : []),
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <Ticket className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 text-lg leading-tight">Smart Campus</h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide">OPERATIONS HUB</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
            `}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 transition-colors duration-200`} />
              <span className="font-medium text-sm">{item.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 mt-auto border-t border-slate-100">
        <div className="bg-slate-50 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-semibold text-slate-700">Need help?</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">Check our documentation or contact support.</p>
          <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
            Support Center
          </button>
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
