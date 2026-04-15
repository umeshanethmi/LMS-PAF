import React from 'react';
import { 
  Users, 
  Clock, 
  CircleCheck, 
  TriangleAlert,
  TrendingUp,
  Calendar,
  MoreVertical,
  Wrench,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { role } = useAuth();

  // Define stats based on role
  const getStats = () => {
    switch (role) {
      case 'admin':
        return [
          { label: 'Active Students', value: '1,284', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Pending Tickets', value: '42', change: '-5%', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Resolved Today', value: '18', change: '+24%', icon: CircleCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Urgent Alerts', value: '3', change: '0%', icon: TriangleAlert, color: 'text-rose-600', bg: 'bg-rose-100' },
        ];
      case 'technician':
        return [
          { label: 'Assigned Jobs', value: '8', change: '+2', icon: Wrench, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { label: 'Pending Repair', value: '5', change: '-1', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Completed', value: '12', change: '+4', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Response Time', value: '2.4h', change: '-15%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
        ];
      case 'user':
      default:
        return [
          { label: 'My Reports', value: '4', change: 'New', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { label: 'Resolved', value: '3', change: 'Check', icon: CircleCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Pending', value: '1', change: 'Waiting', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Alerts', value: '0', change: 'None', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
        ];
    }
  };

  const getWelcomeInfo = () => {
    switch (role) {
      case 'admin':
        return {
          title: 'Welcome back, Admin! 👋',
          subtitle: 'Everything is looking great today. You have 3 urgent maintenance tickets that need your attention.',
          buttonText: 'View Reports'
        };
      case 'technician':
        return {
          title: 'Hello, Team Lead! 🔧',
          subtitle: 'You have 5 pending maintenance tasks for this afternoon. Tools ready?',
          buttonText: 'Start Working'
        };
      case 'user':
      default:
        return {
          title: 'Hi there, Resident! 👋',
          subtitle: 'Track your campus reports and see real-time updates on building maintenance.',
          buttonText: 'Report Incident'
        };
    }
  };

  const stats = getStats();
  const welcome = getWelcomeInfo();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-indigo-600 p-8 text-white shadow-2xl shadow-indigo-200">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">{welcome.title}</h1>
          <p className="mt-2 text-indigo-100 opacity-90 max-w-sm">
            {welcome.subtitle}
          </p>
          <button className="mt-6 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-indigo-600 shadow-lg transition-transform hover:scale-105 active:scale-95">
            {welcome.buttonText}
          </button>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-indigo-500/20 to-transparent"></div>
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-100">
            <div className="flex items-center justify-between">
              <div className={`rounded-xl ${stat.bg} p-2.5`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <button className="text-slate-300 hover:text-slate-500">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 
                  stat.change === '0%' || stat.change === 'None' ? 'bg-slate-50 text-slate-400' : 'bg-rose-50 text-rose-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Activity Section */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">
              {role === 'admin' ? 'System Activity' : role === 'technician' ? 'Current Workload' : 'My Recent Activity'}
            </h2>
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 cursor-pointer hover:underline">
              <span>View details</span>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
            <Activity className="w-8 h-8 text-slate-200 mb-2" />
            <p className="text-slate-400 text-sm font-medium">No recent activity data available</p>
          </div>
        </div>

        {/* Schedule/Upcoming Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Upcoming</h2>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex flex-col items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-indigo-300">Apr</span>
                  <span className="text-lg font-bold text-slate-700 leading-none group-hover:text-indigo-600">{14 + i}</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {role === 'admin' ? 'System Audit' : role === 'technician' ? 'HVAC Maintenance' : 'Community Meet'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Scheduled for 10:00 PM</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 transition-all">
            {role === 'admin' ? 'Manage System' : role === 'technician' ? 'View Schedule' : 'View Full Calendar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple placeholder icon for empty activity
const Activity = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export default DashboardPage;

