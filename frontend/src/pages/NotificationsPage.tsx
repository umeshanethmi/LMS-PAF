import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Trash2, CheckCheck, Loader2, CalendarCheck, Ticket, Info } from 'lucide-react';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'BOOKING' | 'TICKET' | 'SYSTEM';
  refId?: string;
  read: boolean;
  createdAt: string;
}

const TYPE_CONFIG = {
  BOOKING: { icon: CalendarCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  TICKET:  { icon: Ticket,        color: 'text-amber-500',  bg: 'bg-amber-50'  },
  SYSTEM:  { icon: Info,          color: 'text-slate-500',  bg: 'bg-slate-50'  },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await apiClient.get<Notification[]>('/notifications');
      setNotifications(data);
    } catch {
      setError('Could not load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const markRead = async (id: string) => {
    await apiClient.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await apiClient.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteOne = async (id: string) => {
    await apiClient.delete(`/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const deleteAll = async () => {
    if (!confirm('Clear all notifications?')) return;
    await apiClient.delete('/notifications');
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-6 text-white shadow-xl"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center relative">
              <Bell className="w-7 h-7 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-[10px] font-black text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter">Notifications</h1>
              <p className="text-indigo-300 text-sm font-medium">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="flex items-center gap-1.5 text-xs font-bold bg-white/15 hover:bg-white/25 px-3 py-2 rounded-xl transition-all">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button onClick={deleteAll}
                className="flex items-center gap-1.5 text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-3 py-2 rounded-xl transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {!user && (
        <div className="text-center py-12 text-slate-500">
          <BellOff className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-bold">Please log in to see your notifications.</p>
        </div>
      )}

      {loading && user && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-bold">
          {error}
        </div>
      )}

      {!loading && user && notifications.length === 0 && !error && (
        <div className="text-center py-16 text-slate-400">
          <BellOff className="w-14 h-14 mx-auto mb-4 opacity-30" />
          <p className="font-bold text-lg">No notifications yet</p>
          <p className="text-sm mt-1">You will be notified when your bookings are updated or tickets change.</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map(n => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.SYSTEM;
          const Icon = cfg.icon;
          return (
            <div key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={`bg-white rounded-2xl border p-4 flex gap-4 cursor-pointer transition-all hover:shadow-md
                ${n.read ? 'border-slate-100 opacity-70' : 'border-indigo-100 shadow-sm ring-1 ring-indigo-50'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                <Icon className={`w-5 h-5 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold text-slate-800 ${!n.read ? 'text-indigo-900' : ''}`}>{n.title}</p>
                  {!n.read && (
                    <span className="shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-1.5" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); deleteOne(n.id); }}
                className="shrink-0 p-1.5 text-slate-300 hover:text-rose-400 hover:bg-rose-50 rounded-lg transition-all self-start"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
