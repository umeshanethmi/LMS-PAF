import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Key, 
  Eye, 
  LogOut, 
  Clock, 
  Globe,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  History,
  X,
  QrCode,
  UserCheck,
  MapPin,
  Monitor
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SecurityPage: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'2FA' | 'PASSWORD' | 'IMPROVE' | 'SESSION' | 'LOGOUT_ALL' | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [is2faEnabled, setIs2faEnabled] = useState(false);

  interface Session {
    id: number;
    device: string;
    location: string;
    status: string;
    icon: any;
    color: string;
    bg: string;
    ip: string;
    browser: string;
    lastActive: string;
  }

  const [sessions, setSessions] = useState([
    { id: 1, device: 'MacBook Pro 14"', location: 'Colombo, LK', status: 'Current Session', icon: Smartphone, color: 'text-emerald-500', bg: 'bg-emerald-50', ip: '192.168.1.45', browser: 'Chrome v118.0.2', lastActive: 'Just Now' },
    { id: 2, device: 'iPhone 15 Pro', location: 'Colombo, LK', status: 'Active 2h ago', icon: Smartphone, color: 'text-slate-400', bg: 'bg-slate-50', ip: '10.0.0.12', browser: 'Safari Mobile', lastActive: '2 hours ago' },
    { id: 3, device: 'Chrome on Windows', location: 'Kandy, LK', status: 'Active 1d ago', icon: Globe, color: 'text-slate-400', bg: 'bg-slate-50', ip: '45.23.11.90', browser: 'Edge v117', lastActive: 'Yesterday' },
  ]);

  const loginHistory = [
    { date: 'Oct 26, 2023 - 22:45', action: 'Login Success', status: 'Google SSO', icon: CheckCircle2, color: 'text-emerald-500' },
    { date: 'Oct 26, 2023 - 10:12', action: 'Login Success', status: 'Password', icon: CheckCircle2, color: 'text-emerald-500' },
    { date: 'Oct 25, 2023 - 18:30', action: 'Failed Attempt', status: 'Invalid Password', icon: AlertTriangle, color: 'text-rose-500' },
  ];

  const securityChecklist = [
    { title: 'Enable Two-Factor Auth', status: is2faEnabled ? 'Completed' : 'Action Required', done: is2faEnabled },
    { title: 'Update Account Recovery Email', status: 'Completed', done: true },
    { title: 'Last Password Change', status: '45 days ago', done: true },
    { title: 'Review Active Devices', status: `${sessions.length} Active`, done: true },
  ];

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setActiveModal('SESSION');
  };

  const terminateSession = (id: number) => {
    setSessions(sessions.filter(s => s.id !== id));
    setActiveModal(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
          <Shield className="w-10 h-10 text-indigo-600" />
          Security Dashboard
        </h1>
        <p className="text-slate-500 font-medium text-lg ml-14">
          Manage your account's security, active sessions, and privacy settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Security Settings */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Two-Factor Authentication</h3>
              <p className="text-slate-500 font-medium mb-6">Add an extra layer of security to your account.</p>
              <button 
                onClick={() => setActiveModal('2FA')}
                className={`px-6 py-3 rounded-2xl font-bold transition-all w-full ${is2faEnabled ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                {is2faEnabled ? 'Enabled (Manage)' : 'Enable 2FA'}
              </button>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Password Manager</h3>
              <p className="text-slate-500 font-medium mb-6">Last changed 45 days ago. Update regularly.</p>
              <button 
                onClick={() => setActiveModal('PASSWORD')}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all w-full"
              >
                Change Password
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">Active Sessions</h2>
              <button 
                onClick={() => setActiveModal('LOGOUT_ALL')}
                className="text-rose-600 font-black text-sm uppercase tracking-wider hover:underline"
              >
                Log out all devices
              </button>
            </div>
            
            <div className="space-y-4">
              {sessions.map((session, i) => (
                <div 
                  key={i} 
                  onClick={() => handleSessionClick(session)}
                  className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 ${session.bg} rounded-xl flex items-center justify-center`}>
                      <session.icon className={`w-6 h-6 ${session.color}`} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{session.device}</p>
                      <p className="text-sm text-slate-500 font-medium">{session.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-black uppercase tracking-widest ${session.status === 'Current Session' ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {session.status}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black">Security Score</h3>
                <span className="text-indigo-400 font-black">{is2faEnabled ? '100%' : '82%'}</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-1000`} style={{ width: is2faEnabled ? '100%' : '82%' }}></div>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                {is2faEnabled ? 'Your account is fully protected.' : 'Your account is highly secure. Enable 2FA to reach 100%.'}
              </p>
              <button 
                onClick={() => setActiveModal('IMPROVE')}
                className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-indigo-50 transition-colors"
              >
                Improve Security
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 p-8 space-y-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <History className="w-6 h-6 text-indigo-600" />
              Recent Activity
            </h3>
            <div className="space-y-6">
              {loginHistory.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`mt-1 w-2 h-2 rounded-full ${item.color} shrink-0`}></div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 leading-none">{item.action}</p>
                    <p className="text-xs text-slate-500 font-medium">{item.status}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Close */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                {activeModal === '2FA' && 'Setup 2FA Protection'}
                {activeModal === 'PASSWORD' && 'Update Password'}
                {activeModal === 'IMPROVE' && 'Security Recommendations'}
                {activeModal === 'SESSION' && 'Session Details'}
                {activeModal === 'LOGOUT_ALL' && 'Security Alert'}
              </h2>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Session Detail Content */}
            {activeModal === 'SESSION' && selectedSession && (
              <div className="space-y-8">
                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className={`w-16 h-16 ${selectedSession.bg} rounded-2xl flex items-center justify-center`}>
                    <selectedSession.icon className={`w-8 h-8 ${selectedSession.color}`} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900">{selectedSession.device}</h4>
                    <p className="text-indigo-600 font-bold">{selectedSession.status}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <Globe className="w-3 h-3" />
                      IP Address
                    </div>
                    <p className="font-bold text-slate-900">{selectedSession.ip}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <Monitor className="w-3 h-3" />
                      Browser
                    </div>
                    <p className="font-bold text-slate-900">{selectedSession.browser}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <MapPin className="w-3 h-3" />
                      Location
                    </div>
                    <p className="font-bold text-slate-900">{selectedSession.location}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      Last Active
                    </div>
                    <p className="font-bold text-slate-900">{selectedSession.lastActive}</p>
                  </div>
                </div>

                {selectedSession.status !== 'Current Session' && (
                  <button 
                    onClick={() => terminateSession(selectedSession.id)}
                    className="w-full py-5 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-black hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout this device
                  </button>
                )}
              </div>
            )}

            {/* Logout All Confirmation */}
            {activeModal === 'LOGOUT_ALL' && (
              <div className="space-y-8 text-center">
                <div className="w-24 h-24 bg-rose-50 rounded-full mx-auto flex items-center justify-center">
                  <AlertTriangle className="w-12 h-12 text-rose-500 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">Sign out all devices?</h3>
                  <p className="text-slate-500 font-medium px-8">This will end all active sessions including your current one. You will need to log back in.</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => { setSessions(sessions.filter(s => s.status === 'Current Session')); setActiveModal(null); }}
                    className="flex-1 py-5 bg-rose-600 text-white rounded-2xl font-black shadow-xl shadow-rose-100"
                  >
                    Confirm Logout
                  </button>
                </div>
              </div>
            )}

            {/* 2FA Modal Content */}
            {activeModal === '2FA' && (
              <div className="space-y-8 text-center">
                <div className="w-48 h-48 bg-slate-50 border-2 border-slate-100 rounded-3xl mx-auto flex items-center justify-center p-4">
                  <QrCode className="w-full h-full text-slate-300" />
                </div>
                <div className="space-y-2">
                  <p className="text-slate-900 font-bold">Scan with your authenticator app</p>
                  <p className="text-slate-500 text-sm font-medium px-8">Use Google Authenticator or Microsoft Authenticator to scan this code.</p>
                </div>
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit code"
                    className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-center text-2xl font-black tracking-[0.5em] focus:bg-white focus:border-indigo-600 outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={() => { setIs2faEnabled(true); setActiveModal(null); }}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
                >
                  Verify & Enable
                </button>
              </div>
            )}

            {/* Password Modal Content */}
            {activeModal === 'PASSWORD' && (
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setActiveModal(null); }}>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Current Password</label>
                  <input 
                    type="password" 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">New Password</label>
                  <input 
                    type="password" 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold"
                  />
                </div>
                <div className="pt-4 flex gap-4">
                   <button 
                     type="button" 
                     onClick={() => setActiveModal(null)}
                     className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all"
                   >
                     Update Password
                   </button>
                </div>
              </form>
            )}

            {/* Improve Security Modal Content */}
            {activeModal === 'IMPROVE' && (
              <div className="space-y-6">
                <div className="grid gap-4">
                  {securityChecklist.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        {item.done ? (
                          <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{item.title}</p>
                          <p className={`text-xs font-bold ${item.done ? 'text-emerald-600' : 'text-rose-500'}`}>{item.status}</p>
                        </div>
                      </div>
                      {!item.done && (
                        <button className="px-4 py-2 bg-white border border-rose-200 text-rose-500 text-xs font-black rounded-xl hover:bg-rose-50 transition-all">
                          Fix Now
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-indigo-50 rounded-3xl space-y-4">
                   <h4 className="font-black text-indigo-900 flex items-center gap-2">
                     <UserCheck className="w-5 h-5" />
                     Security Tip
                   </h4>
                   <p className="text-sm text-indigo-700 font-medium">
                     Using a password manager like Bitwarden or 1Password is the best way to keep your account safe from credential stuffing.
                   </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityPage;
