import React from 'react';
import { User, MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';

interface ActivityItem {
  id: number;
  type: 'status_change' | 'comment' | 'new_ticket';
  user: string;
  action: string;
  time: string;
  avatar?: string;
}

const activities: ActivityItem[] = [
  { id: 1, type: 'status_change', user: 'Tech John', action: 'moved Ticket #102 to Resolved', time: '2 mins ago' },
  { id: 2, type: 'comment', user: 'Admin Sarah', action: 'commented on Ticket #105', time: '15 mins ago' },
  { id: 3, type: 'new_ticket', user: 'User Mike', action: 'reported a new Lighting issue', time: '1 hour ago' },
  { id: 4, type: 'status_change', user: 'Tech Jane', action: 'started working on Ticket #108', time: '3 hours ago' },
  { id: 5, type: 'comment', user: 'User Alice', action: 'added an update to Ticket #110', time: '5 hours ago' },
];

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'status_change': return <RefreshCw className="w-3.5 h-3.5 text-blue-500" />;
    case 'comment': return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
    case 'new_ticket': return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
  }
};

export function ActivityFeed() {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-lg font-black tracking-tight">Recent Activity</h2>
        <span className="bg-white/10 text-white/60 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5">Realtime</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {activities.map((item, idx) => (
          <div 
            key={item.id}
            className="flex gap-4 group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner group-hover:bg-white/20 transition-colors">
                <User className="w-5 h-5 text-white/70" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-900 rounded-full border border-white/10 flex items-center justify-center">
                {getActivityIcon(item.type)}
              </div>
            </div>
            <div className="flex-1 border-b border-white/5 pb-4 group-last:border-0">
              <p className="text-xs font-bold">
                <span className="text-white/90">{item.user}</span>
                <span className="text-white/50 font-medium"> {item.action}</span>
              </p>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
