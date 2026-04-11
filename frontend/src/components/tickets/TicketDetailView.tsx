import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Send, X } from 'lucide-react';
import type { TicketRole } from '../../services/ticketApi';

interface Comment {
  id: number;
  author: string;
  message: string;
  createdAt: string;
}

interface TicketDetailViewProps {
  ticket: any; 
  onClose: () => void;
  onUpdated: () => void;
  currentUserId: number;
  role: TicketRole;
}

function TicketDetailView({ ticket, onClose, onUpdated }: TicketDetailViewProps) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [updating, setUpdating] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [techInput, setTechInput] = useState(ticket.assignedTechnicianId || '');

  useEffect(() => {
    fetchComments();
  }, [ticket.id]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const res = await axios.get(`http://localhost:8080/api/comments/${ticket.id}`);
      setComments(res.data);
    } catch (error) {
      console.error('Failed to fetch comments', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await axios.post(`http://localhost:8080/api/comments`, {
        ticketId: ticket.id,
        author: "Staff Member", 
        message: comment
      });
      setComment('');
      fetchComments();
    } catch (error) {
      console.error('Failed to add comment', error);
      alert('Failed to post comment');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      await axios.patch(`http://localhost:8080/api/maintenancetickets/${ticket.id}/status?status=${newStatus}`);
      onUpdated();
      onClose(); 
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async (techId: string) => {
    if (!techId.trim()) return;
    setUpdating(true);
    try {
      await axios.put(`http://localhost:8080/api/maintenancetickets/${ticket.id}/assign?technicianId=${techId}`);
      onUpdated();
      alert('Technician assigned successfully');
    } catch (error) {
      console.error('Failed to assign technician', error);
      alert('Failed to assign technician');
    } finally {
      setUpdating(false);
    }
  };

  const displayImages = ticket.attachmentPaths || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col scale-100 transition-transform">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Incident Details</h2>
            <p className="text-sm text-slate-500 font-medium">Ticket #{ticket.id} • {ticket.category}</p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-xl p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Resource</label>
                <p className="text-slate-700 font-semibold">{ticket.resourceId}</p>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Location</label>
                <p className="text-slate-700 font-semibold">{ticket.location}</p>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Priority</label>
                <span className={`block w-fit px-3 py-1 rounded-full text-[12px] font-bold mt-1 ${
                  ticket.priority === 'HIGH' ? 'bg-rose-100 text-rose-600' : 
                  ticket.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {ticket.priority}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                <p className="text-slate-600 text-[15px] leading-relaxed mt-1">{ticket.description}</p>
              </div>
              <div className="pt-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned Technician</label>
                <div className="flex gap-2 mt-2">
                  <input
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all"
                    placeholder="Technician ID"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                  />
                  <button
                    className="rounded-xl bg-slate-800 px-4 py-2 text-[12px] font-bold text-white hover:bg-slate-900 transition-colors disabled:opacity-50"
                    onClick={() => handleAssign(techInput)}
                    disabled={updating}
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Images Grid */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 block">Attachments</label>
            {displayImages && displayImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {displayImages.map((path: string, idx: number) => {
                  const hasImage = path && path.trim() !== "";
                  const src = hasImage 
                    ? `http://localhost:8080/uploads/${path.split('/').pop()?.split('\\').pop()}`
                    : "https://placehold.co/128x128/f1f5f9/94a3b8?text=Placeholder";

                  return (
                    <div key={idx} className="relative aspect-square w-full">
                       <img
                        src={src}
                        alt="Attachment"
                        className="aspect-square w-full object-cover border-2 border-slate-100 rounded-2xl shadow-sm hover:scale-105 transition-transform cursor-pointer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://placehold.co/128x128/f1f5f9/94a3b8?text=Error';
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-4 italic">No image attachments provided.</p>
            )}
          </div>

          {/* Discussion */}
          <div className="border-t border-slate-100 pt-6">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4 block">Discussion</label>
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {loadingComments ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-300" /></div>
              ) : comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-800 text-sm">{c.author}</span>
                      <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap">{c.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 text-sm py-4">No comments yet.</p>
              )}
            </div>
            
            <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
              <input
                className="flex-1 bg-transparent border-none px-4 py-2 text-sm outline-none text-slate-700"
                placeholder="Write a message..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button
                className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors"
                onClick={handleAddComment}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-500">Status:</span>
            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
              ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {ticket.status}
            </span>
          </div>
          
          <div className="flex gap-3">
             <button
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all disabled:opacity-50"
              onClick={() => handleStatusChange('IN_PROGRESS')}
              disabled={updating || ticket.status === 'IN_PROGRESS'}
            >
              Start Progress
            </button>
            <button
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
              onClick={() => handleStatusChange('RESOLVED')}
              disabled={updating || ticket.status === 'RESOLVED'}
            >
              {updating ? 'Updating...' : 'Mark as Resolved'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketDetailView;
