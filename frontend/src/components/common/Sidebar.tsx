import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutGrid, 
  Ticket, 
  Settings, 
  LogOut, 
  User, 
  Bell, 
  ChevronRight,
  CircleHelp,
  Activity,
  Users,
  Wrench
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { role, login, logout } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { icon: LayoutGrid, label: 'Overview', path: '/' },
    ];

    if (role === 'admin') {
      baseItems.push(
        { icon: Activity, label: 'Ticket Console', path: '/tickets' },
        { icon: Users, label: 'Workforce', path: '/technicians' }
      );
    } else if (role === 'technician') {
      baseItems.push(
        { icon: Wrench, label: 'My Jobs', path: '/tickets' }
      );
    } else {
      baseItems.push(
        { icon: Ticket, label: 'Report Incident', path: '/tickets' }
      );
    }

    baseItems.push(
      { icon: Bell, label: 'Notifications', path: '/notifications' },
      { icon: User, label: 'Personal Hub', path: '/profile' }
    );

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-72 h-screen bg-white border-r border-slate-100 flex flex-col transition-all duration-500 ease-in-out sticky top-0">
      {/* Brand Section */}
      <div className="p-8 flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-indigo-200 group-hover:rotate-12 transition-transform duration-500">
            <Ticket className="text-white w-7 h-7" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        <div>
          <h1 className="font-extrabold text-slate-900 text-xl leading-none tracking-tighter">Smart</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Campus Hub</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 mt-8 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 ml-3 mb-4">Main Menu</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group
              ${isActive 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-4">
                  <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                </div>
                {!isActive && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section / Bottom Action */}
      <div className="p-6 mt-auto">
        <div className="bg-slate-950 rounded-[2rem] p-6 mb-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all"></div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center">
               <User className="text-white w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white/50 uppercase tracking-widest">{role || 'GUEST'}</p>
              <h4 className="text-sm font-bold text-white tracking-tight">Active Session</h4>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="grid grid-cols-3 gap-1 mb-4 relative z-10">
            {(['user', 'admin', 'technician'] as const).map(r => (
              <button
                key={r}
                onClick={() => login(r)}
                className={`py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all border ${
                  role === r 
                    ? 'bg-indigo-500 border-indigo-400 text-white' 
                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                }`}
              >
                {r.slice(0, 4)}
              </button>
            ))}
          </div>

          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/10 hover:border-rose-400 group/btn"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover/btn:rotate-12" />
            Sign Out
          </button>
        </div>

        <div className="flex items-center justify-between px-4">
          <span className="text-[10px] font-bold text-slate-400">v2.0.4-module-c</span>
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
