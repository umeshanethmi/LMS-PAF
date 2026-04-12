import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  Send, 
  X, 
  MapPin, 
  CircleCheck, 
  TriangleAlert, 
  User as UserIcon, 
  MessageSquare,
  Hash,
  ArrowRight
} from 'lucide-react';
import { 
  addTicketComment, 
  updateTicketStatus, 
  assignTechnician 
} from '../../services/ticketApi';
import type { Ticket, TicketRole, TicketStatus } from '../../services/ticketApi';

interface TicketDetailViewProps {
  ticket: Ticket;
  onClose: () => void;
  onUpdated: () => void;
  currentUserId: number;
  role: TicketRole;
}

function TicketDetailView({ ticket, onClose, onUpdated, currentUserId, role }: TicketDetailViewProps) {
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);
  const [techId, setTechId] = useState('');
  const [notes, setNotes] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);

  const isAdmin = role === 'ADMIN';
  const isTechnician = role === 'TECHNICIAN';

  const handlePostComment = async () => {
    if (!comment.trim()) return;
    setUpdating(true);
    try {
      await addTicketComment(ticket.id, comment, currentUserId);
      setComment('');
      onUpdated();
    } catch (error) {
      console.error('Failed to post comment', error);
      alert('Failed to post comment');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus, resolutionNotes?: string) => {
    if (newStatus === 'REJECTED' && !resolutionNotes?.trim()) {
      alert('Rejection reason is mandatory.');
      return;
    }
    if (newStatus === 'RESOLVED' && !resolutionNotes?.trim()) {
      alert('Resolution notes are mandatory.');
      return;
    }

    setUpdating(true);
    try {
      await updateTicketStatus(ticket.id, newStatus, currentUserId, role, resolutionNotes);
      onUpdated();
      if (newStatus === 'RESOLVED' || newStatus === 'REJECTED') {
         onClose();
      }
      setShowRejectForm(false);
      setShowResolveForm(false);
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async () => {
    if (!techId.trim()) return;
    setUpdating(true);
    try {
      await assignTechnician(ticket.id, techId, currentUserId, role);
      alert('Technician assigned successfully');
      setTechId('');
      onUpdated();
    } catch (error) {
      console.error('Failed to assign technician', error);
      alert('Failed to assign technician');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="max-h-[95vh] w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl flex flex-col scale-100 transition-transform border border-white/20">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl shadow-inner ${
              ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-600' : 
              ticket.status === 'REJECTED' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
            }`}>
              <Hash className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Ticket Detail</h2>
                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-lg font-bold text-slate-600">ID: {ticket.id}</span>
              </div>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">{ticket.category} • Reported on {new Date(ticket.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-2xl p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200 group"
          >
            <X className="h-6 w-6 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-2">
                <MapPin className="w-3 h-3" /> Location
              </label>
              <p className="text-slate-800 font-bold text-sm tracking-tight">{ticket.location}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-2">
                <TriangleAlert className="w-3 h-3" /> Priority
              </label>
              <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                ticket.priority === 'HIGH' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 
                ticket.priority === 'MEDIUM' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
              }`}>
                {ticket.priority}
              </span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-2">
                <UserIcon className="w-3 h-3" /> Assigned
              </label>
              <p className="text-slate-800 font-bold text-sm tracking-tight">{ticket.assignedTechnicianId || 'Unassigned'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-indigo-500">Incident Description</label>
            <div className="p-6 rounded-[1.5rem] bg-indigo-50/30 border border-indigo-100/50">
              <p className="text-slate-700 leading-relaxed font-medium">{ticket.description}</p>
            </div>
          </div>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Attachments</label>
              <div className="grid grid-cols-3 gap-4">
                {ticket.attachments.map((att, idx) => (
                  <div key={idx} className="group relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-slate-100 shadow-md hover:border-indigo-400 transition-all cursor-zoom-in">
                    <img
                      src={att.fileUrl || `http://localhost:8084/api/tickets/attachments/${att.id}`}
                      alt="Attachment"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://placehold.co/400x300/f1f5f9/94a3b8?text=Image+Not+Found';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                       <X className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Notes Display */}
          {ticket.resolutionNotes && (
             <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-emerald-500">Resolution / Rejection Notes</label>
                <div className="p-6 rounded-[1.5rem] bg-emerald-50/50 border border-emerald-100">
                  <p className="text-emerald-900 font-semibold italic">"{ticket.resolutionNotes}"</p>
                </div>
             </div>
          )}

          {/* Role specific forms */}
          {isAdmin && ticket.status === 'OPEN' && !showRejectForm && (
            <div className="p-6 rounded-[2rem] bg-slate-900 text-white space-y-4 shadow-xl">
               <h3 className="font-bold text-lg">Admin Management</h3>
               <div className="flex gap-3">
                  <div className="flex-1">
                    <input 
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all"
                      placeholder="Tech ID (e.g. TECH-001)"
                      value={techId}
                      onChange={(e) => setTechId(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleAssign}
                    disabled={updating}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2"
                  >
                    {updating ? <Clock className="animate-spin w-4 h-4" /> : 'Assign'}
                  </button>
               </div>
               <button 
                onClick={() => setShowRejectForm(true)}
                className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold py-3 rounded-xl border border-rose-500/30 transition-all text-sm uppercase tracking-widest"
               >
                 Reject Ticket
               </button>
            </div>
          )}

          {showRejectForm && (
            <div className="p-6 rounded-[2rem] bg-rose-50 border border-rose-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
               <div className="flex items-center justify-between">
                 <h3 className="text-rose-700 font-black tracking-tight flex items-center gap-2 uppercase text-xs">
                    <AlertTriangle className="w-4 h-4" /> Mandatory Rejection Reason
                 </h3>
                 <button onClick={() => setShowRejectForm(false)}><X className="w-4 h-4 text-rose-400" /></button>
               </div>
               <textarea 
                  className="w-full rounded-2xl border-2 border-rose-200/50 bg-white p-4 text-sm focus:outline-none focus:border-rose-400 transition-all"
                  placeholder="Explain why this ticket is being rejected..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
               />
               <div className="flex gap-2">
                 <button 
                  onClick={() => handleStatusChange('REJECTED', notes)}
                  disabled={updating}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                 >
                   {updating ? <Clock className="animate-spin w-4 h-4" /> : 'Confirm Rejection'}
                 </button>
               </div>
            </div>
          )}

          {isTechnician && ticket.status === 'IN_PROGRESS' && !showResolveForm && (
             <div className="p-6 rounded-[2rem] bg-emerald-900 text-white space-y-4 shadow-xl">
               <h3 className="font-bold text-lg flex items-center gap-2">
                  <CircleCheck className="w-5 h-5 text-emerald-400" /> Technician Dashboard
               </h3>
               <p className="text-xs text-emerald-300 font-medium">Add resolution notes to complete this ticket.</p>
               <button 
                onClick={() => setShowResolveForm(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/30 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
               >
                 Mark as Resolved <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          )}

          {isTechnician && ticket.status === 'OPEN' && ticket.assignedTechnicianId && ( // Changed from 'ASSIGNED'
             <button 
                onClick={() => handleStatusChange('IN_PROGRESS')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg"
             >
               Start Working (Set to In Progress)
             </button>
          )}

          {showResolveForm && (
            <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
               <div className="flex items-center justify-between">
                 <h3 className="text-emerald-700 font-black tracking-tight flex items-center gap-2 uppercase text-xs">
                    <CircleCheck className="w-4 h-4" /> Mandatory Resolution Notes
                 </h3>
                 <button onClick={() => setShowResolveForm(false)}><X className="w-4 h-4 text-emerald-400" /></button>
               </div>
               <textarea 
                  className="w-full rounded-2xl border-2 border-emerald-200/50 bg-white p-4 text-sm focus:outline-none focus:border-emerald-400 transition-all"
                  placeholder="Describe what was fixed and how..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
               />
               <button 
                  onClick={() => handleStatusChange('RESOLVED', notes)}
                  disabled={updating}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
               >
                 {updating ? <Clock className="animate-spin w-4 h-4" /> : 'Finalize Resolution'}
               </button>
            </div>
          )}

          {/* Discussion */}
          <div className="border-t border-slate-100 pt-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              <label className="text-sm font-black uppercase tracking-widest text-slate-800">Discussion & Updates</label>
              <span className="bg-slate-100 text-[10px] font-bold px-2 py-0.5 rounded-full">{ticket.comments?.length || 0}</span>
            </div>
            
            <div className="space-y-4 mb-8">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((c) => (
                  <div key={c.id} className={`flex flex-col max-w-[85%] ${c.authorUserId === currentUserId ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                    <div className={`rounded-[1.25rem] p-4 shadow-sm border ${
                      c.authorUserId === currentUserId 
                      ? 'bg-indigo-600 text-white border-indigo-700' 
                      : 'bg-white text-slate-700 border-slate-100'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap font-medium">{c.content}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                      {c.authorUserId === currentUserId ? 'You' : `User #${c.authorUserId}`} • {new Date(c.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                   <MessageSquare className="w-10 h-10 text-slate-200 mb-2" />
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Start a conversation</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 bg-white p-2 rounded-[1.5rem] border-2 border-slate-100 focus-within:border-indigo-400 transition-all shadow-inner">
              <input
                className="flex-1 bg-transparent px-4 py-2 text-sm outline-none text-slate-700 font-medium"
                placeholder="Type a message..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                disabled={updating}
              />
              <button
                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-slate-900 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                onClick={handlePostComment}
                disabled={updating || !comment.trim()}
              >
                {updating ? <Clock className="animate-spin w-4 h-4" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketDetailView;
