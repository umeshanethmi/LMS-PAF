import React from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Trash2, 
  Clock, 
  Ticket, 
  Calendar,
  Filter,
  MoreVertical,
  Inbox
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationPage: React.FC = () => {
  const { notifications, markAsRead, deleteNotification, unreadCount } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOKING': return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'TICKET': return <Ticket className="w-5 h-5 text-indigo-600" />;
      default: return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'BOOKING': return 'bg-blue-100';
      case 'TICKET': return 'bg-indigo-100';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-rose-100 text-rose-600 text-sm font-bold rounded-full">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-slate-500 mt-1">Stay updated with your campus requests and alerts.</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
            Mark all as read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
            <p className="text-slate-500 max-w-xs mt-1">You don't have any notifications at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`group p-6 flex gap-4 transition-all hover:bg-slate-50/80 ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
              >
                <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${getBg(notif.type)} transition-transform group-hover:scale-110`}>
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{notif.type}</span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        )}
                      </div>
                      <p className={`text-slate-700 leading-relaxed ${!notif.isRead ? 'font-semibold' : 'font-medium'}`}>
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                        {!notif.isRead && (
                          <button 
                            onClick={() => markAsRead(notif.id)}
                            className="text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => deleteNotification(notif.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Notification Settings</h3>
            <p className="text-indigo-200 opacity-80 text-sm">Control how and when you receive alerts on your devices.</p>
          </div>
          <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold hover:bg-indigo-50 transition-colors shrink-0">
            Configure Alerts
          </button>
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
      </div>
    </div>
  );
};

export default NotificationPage;
