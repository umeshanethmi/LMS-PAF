import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, role } = useAuth();
  
  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 p-2 lg:p-6">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 lg:p-12 text-white shadow-3xl border border-white/5">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-48 -left-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="rounded-3xl bg-gradient-to-tr from-indigo-500 to-blue-400 p-5 shadow-2xl shadow-indigo-500/40 ring-4 ring-indigo-500/20">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tighter text-white lg:text-5xl">My Profile</h1>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-white/10">Account</span>
              </div>
              <p className="mt-2 text-lg font-medium text-slate-400 max-w-xl">
                Manage your personal information and account settings.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-8 lg:p-12 rounded-[2.5rem] border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
         <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[2rem] bg-gradient-to-tr from-indigo-100 to-blue-50 flex items-center justify-center text-indigo-600 font-black text-6xl shadow-inner border border-indigo-100/50 relative">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
         </div>
         <div className="text-center sm:text-left">
            <h2 className="text-4xl font-black tracking-tight text-slate-800">{user?.username || 'Guest System'}</h2>
            <p className="text-lg font-black text-indigo-600 uppercase tracking-widest mt-2">{role || 'Unassigned'}</p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
               <span className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-medium text-sm border border-slate-200">System ID: #{user?.id || '---'}</span>
               <span className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-medium text-sm border border-slate-200">Email: {user?.email || 'Not provided'}</span>
            </div>
         </div>
      </div>
    </div>
  );
}
