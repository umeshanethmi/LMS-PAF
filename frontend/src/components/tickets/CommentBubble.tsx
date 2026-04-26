import React from 'react';
import type { TicketCommentResponse } from '../../services/ticketApi';

interface CommentBubbleProps {
  comment: TicketCommentResponse;
  currentUserId: string;
}

const CommentBubble = ({ comment, currentUserId }: CommentBubbleProps) => {
  const isMe = comment.authorUserId === currentUserId;
  const time = new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = new Date(comment.timestamp).toLocaleDateString();
  const isToday = new Date().toLocaleDateString() === date;
  
  const formattedTime = `${isToday ? 'Today' : date}, ${time}`;

  // Role display logic
  const roleLabel = comment.authorRole || (comment.authorUserId === '0' ? 'SYSTEM' : 'USER');

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
      <div className={`max-w-[85%] px-6 py-4 rounded-[1.5rem] shadow-sm relative transition-all hover:shadow-md ${
        isMe 
        ? 'bg-indigo-600 text-white rounded-tr-none' 
        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-black uppercase tracking-widest ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
            {comment.author || 'User'}
          </span>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
            isMe 
            ? 'bg-white/20 text-white' 
            : roleLabel === 'ADMIN' 
              ? 'bg-indigo-100 text-indigo-700' 
              : roleLabel === 'TECHNICIAN'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
          }`}>
            {roleLabel}
          </span>
        </div>
        <p className="text-sm font-medium leading-relaxed">{comment.content}</p>
        <div className={`text-[9px] mt-2 font-bold ${isMe ? 'text-indigo-300 text-right' : 'text-slate-400 text-left'}`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default CommentBubble;
