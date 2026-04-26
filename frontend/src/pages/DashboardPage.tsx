import React from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  MoreVertical,
  Ticket,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const adminStats = [
    { label: 'Active Students', value: '1,284', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Pending Tickets', value: '42', change: '-5%', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Resolved Today', value: '18', change: '+24%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Urgent Alerts', value: '3', change: '0%', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  const userStats = [
    { label: 'My Tickets', value: '5', change: '2 active', icon: Ticket, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Unread Alerts', value: '12', change: 'New', icon: Bell, color: 'text-rose-600', bg: 'bg-rose-100' },
    { label: 'Requests', value: '2', change: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'History', value: '24', change: 'Resolved', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  const stats = isAdmin ? adminStats : userStats;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-8 text-white ${isAdmin ? 'bg-indigo-600' : 'bg-slate-900'}`}>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'User'}! {isAdmin ? '👑' : '👋'}</h1>
          <p className="mt-2 text-indigo-100 opacity-90 max-w-md">
            {isAdmin 
              ? "System is healthy. You have 3 urgent maintenance tickets that need your attention."
              : "Check your recent maintenance requests and system notifications below."}
          </p>
          <button className={`mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-lg transition-transform hover:scale-105 active:scale-95 ${isAdmin ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'}`}>
            {isAdmin ? 'View Reports' : 'New Ticket'}
          </button>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent"></div>
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className={`rounded-xl ${stat.bg} p-2.5`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <span className={`text-xs font-semibold ${stat.change.startsWith('+') ? 'text-emerald-600' : stat.change === '0%' || isNaN(parseInt(stat.change)) ? 'text-slate-400' : 'text-rose-600'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Section (Activity or My Tickets) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">{isAdmin ? 'System Activity' : 'Recent Notifications'}</h2>
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 cursor-pointer">
              <span>View all</span>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
            <p className="text-slate-400 text-sm">{isAdmin ? 'System-wide activity visualization' : 'Your recent personal alerts'}</p>
          </div>
        </div>

        {/* Side Section (Upcoming or Fast Actions) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Upcoming</h2>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Apr</span>
                  <span className="text-lg font-bold text-slate-700 leading-none">{14 + i}</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {isAdmin ? 'Server Maintenance' : 'Lab Session'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Scheduled for 10:00 PM</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            {isAdmin ? 'Manage Schedule' : 'Full Calendar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
