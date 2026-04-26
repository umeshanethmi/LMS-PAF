import React from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Camera, 
  ExternalLink, 
  Clock, 
  Award,
  Settings,
  Bell,
  Lock,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  
  const stats = [
    { label: 'Account Type', value: user?.provider === 'GOOGLE' ? 'Google SSO' : 'Local Account', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Member Since', value: user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Recently', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Global Role', value: user?.role || 'USER', icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header / Cover Section */}
      <div className="relative h-48 rounded-[32px] bg-gradient-to-r from-indigo-600 to-violet-600 overflow-hidden shadow-lg shadow-indigo-100">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:32px_32px]"></div>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="relative -mt-24 px-8">
        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-40 h-40 rounded-3xl bg-white p-2 shadow-2xl">
                <div className="w-full h-full rounded-2xl bg-indigo-50 flex items-center justify-center border-2 border-slate-100 overflow-hidden">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-20 h-20 text-indigo-200" />
                  )}
                </div>
              </div>
              <button className="absolute bottom-2 right-2 p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 shadow-lg hover:text-indigo-600 hover:scale-110 transition-all">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user?.name}</h1>
                {user?.role === 'ADMIN' && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-full">Admin</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-6 text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>User ID: <span className="font-mono text-xs">{user?.id?.substring(0, 8)}...</span></span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                Edit Profile
              </button>
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-100">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                  <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8">
        {/* Security Section */}
        <div className="bg-white rounded-[32px] border border-slate-200 p-8 space-y-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-6 h-6 text-indigo-600" />
            Security & Access
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-indigo-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500">Add an extra layer of security</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-slate-200 text-slate-500 text-[10px] font-bold rounded-full">DISABLED</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-indigo-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Change Password</p>
                  <p className="text-xs text-slate-500">Update your account credentials</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-[32px] border border-slate-200 p-8 space-y-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600" />
            Notification Preferences
          </h2>
          <div className="space-y-4">
            {['Email Alerts', 'System Push Notifications', 'SMS Updates'].map((pref, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <p className="font-bold text-slate-800">{pref}</p>
                <div className="w-12 h-6 bg-indigo-600 rounded-full relative p-1 cursor-pointer">
                  <div className="absolute right-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
