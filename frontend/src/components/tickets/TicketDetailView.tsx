import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  TriangleAlert, 
  User as UserIcon, 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  ArrowRight,
  CircleCheck,
  Zap,
  Info,
  ShieldCheck,
  Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  updateTicketStatus, 
  assignTechnician,
  startWork,
  getTicketById,
  getTechnicians,
  addTicketComment,
  deleteTicket,
  updateTicket
} from '../../services/ticketApi';
import AssignTechnicianModal from './AssignTechnicianModal';
import type { Ticket, TicketRole, TicketStatus } from '../../services/ticketApi';
import CommentBubble from './CommentBubble';

interface TicketDetailViewProps {
  ticket: Ticket;
  onClose: () => void;
  onUpdated: () => void;
  currentUserId: string;
  role: TicketRole;
}

function TicketDetailView({ ticket: initialTicket, onClose, onUpdated, currentUserId, role }: TicketDetailViewProps) {
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  
  useEffect(() => {
    setTicket(initialTicket);
  }, [initialTicket]);

  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);
  const [techId, setTechId] = useState('');
  const [notes, setNotes] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [technicianList, setTechnicianList] = useState<{id: string, username: string}[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    category: ticket.category,
    priority: ticket.priority,
    location: ticket.location,
    description: ticket.description,
    contactDetails: ticket.contactDetails
  });

  const isAdmin = role === 'ADMIN';
  const isTechnician = role === 'TECHNICIAN';

  useEffect(() => {
    const loadTechs = async () => {
      try {
        const techs = await getTechnicians();
        const liveTechs = techs.map((u: any) => ({ id: u.id, username: u.username }));
        setTechnicianList([{ id: '0', username: 'Guest System' }, ...liveTechs]);
      } catch (err) {
        setTechnicianList([{ id: '0', username: 'Guest System' }]);
      }
    };
    if (isAdmin) loadTechs();
  }, [isAdmin]);

  useEffect(() => {
    const fetchFullDetail = async () => {
      try {
        setLoadingDetail(true);
        const fullTicket = await getTicketById(ticket.id);
        setTicket(fullTicket);
      } catch (err) {
        console.error("Failed to fetch full ticket:", err);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchFullDetail();
  }, [ticket.id]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || updating) return;

    setUpdating(true);
    try {
      await addTicketComment(ticket.id, comment, currentUserId, role);
      setComment('');
      const updatedTicket = await getTicketById(ticket.id);
      setTicket(updatedTicket);
      onUpdated();
    } catch (error: any) {
      alert('Failed to post comment: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignSuccess = async () => {
    setIsAssignModalOpen(false);
    const updatedTicket = await getTicketById(ticket.id);
    setTicket(updatedTicket);
    onUpdated();
  };

  const handleStatusChange = async (newStatus: TicketStatus, resolutionNotes?: string) => {
    if ((newStatus === 'REJECTED' || newStatus === 'RESOLVED') && !resolutionNotes?.trim()) {
      alert('Notes are mandatory.');
      return;
    }

    setUpdating(true);
    try {
      const updated = await updateTicketStatus(ticket.id, newStatus, currentUserId, role, resolutionNotes);
      setTicket(updated);
      onUpdated();
      setShowResolveForm(false);
      setShowRejectForm(false);
      setNotes('');
    } catch (error: any) {
      alert('Failed to update status: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this ticket?')) return;
    setUpdating(true);
    try {
      await deleteTicket(ticket.id, currentUserId);
      onUpdated();
      onClose();
    } catch (error: any) {
      alert('Failed to delete ticket: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateTicket = async () => {
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('category', editData.category);
      formData.append('priority', editData.priority);
      formData.append('location', editData.location);
      formData.append('description', editData.description);
      formData.append('contactDetails', editData.contactDetails || '');

      const updated = await updateTicket(ticket.id, formData, currentUserId);
      setTicket(updated);
      setIsEditMode(false);
      onUpdated();
      alert('Ticket updated successfully.');
    } catch (error: any) {
      alert('Failed to update ticket: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'OPEN': return { color: 'rose', icon: AlertCircle, label: 'Awaiting Review' };
      case 'ASSIGNED': return { color: 'indigo', icon: Clock, label: 'Expert Assigned' };
      case 'IN_PROGRESS': return { color: 'amber', icon: Zap, label: 'Work Underway' };
      case 'RESOLVED': return { color: 'emerald', icon: CircleCheck, label: 'Solved' };
      case 'REJECTED': return { color: 'slate', icon: AlertCircle, label: 'Rejected' };
      case 'CLOSED': return { color: 'slate', icon: CheckCircle2, label: 'Closed' };
      default: return { color: 'slate', icon: Info, label: status };
    }
  };

  const statusConfig = getStatusConfig(ticket.status || 'OPEN');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative h-[92vh] w-full max-w-4xl overflow-hidden rounded-[3rem] bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex flex-col border border-white/20"
      >
        {/* Header Section */}
        <div className="relative p-10 bg-slate-900 overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[100px] -mr-48 -mt-48 rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 blur-[80px] -ml-32 -mb-32 rounded-full"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={`h-16 w-16 rounded-3xl flex items-center justify-center shadow-2xl ${
                statusConfig.color === 'rose' ? 'bg-rose-500' : 
                statusConfig.color === 'indigo' ? 'bg-indigo-500' :
                statusConfig.color === 'amber' ? 'bg-amber-500' :
                statusConfig.color === 'emerald' ? 'bg-emerald-500' : 'bg-slate-500'
              } text-white`}>
                <Hash className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-white tracking-tight">Case Overview</h2>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    statusConfig.color === 'rose' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 
                    statusConfig.color === 'indigo' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                    statusConfig.color === 'amber' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    statusConfig.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                  } border`}>
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-slate-400 font-bold mt-1 text-sm uppercase tracking-widest flex items-center gap-2">
                  {ticket.category} <span className="h-1 w-1 rounded-full bg-slate-700"></span> ID: {ticket.id}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="h-12 w-12 rounded-2xl bg-white/5 text-white hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center group"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
          <div className="p-10 space-y-10">
            
            {/* Vital Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Location', value: ticket.location, icon: MapPin, color: 'slate', field: 'location' },
                { label: 'Priority', value: ticket.priority, icon: TriangleAlert, color: ticket.priority === 'HIGH' ? 'rose' : 'amber', field: 'priority' },
                { label: 'Category', value: ticket.category, icon: Hash, color: 'indigo', field: 'category' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-2 mb-3">
                    <stat.icon className={`w-4 h-4 ${
                      stat.color === 'rose' ? 'text-rose-500' :
                      stat.color === 'amber' ? 'text-amber-500' :
                      stat.color === 'indigo' ? 'text-indigo-500' : 'text-slate-500'
                    }`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                  </div>
                  {isEditMode ? (
                    stat.field === 'priority' ? (
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                        value={editData.priority}
                        onChange={e => setEditData({...editData, priority: e.target.value as any})}
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                      </select>
                    ) : stat.field === 'category' ? (
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                        value={editData.category}
                        onChange={e => setEditData({...editData, category: e.target.value})}
                      >
                        {['Electrical', 'Plumbing', 'IT / Network', 'HVAC / Cooling', 'Cleaning', 'Furniture', 'Security', 'Other'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                        value={editData.location}
                        onChange={e => setEditData({...editData, location: e.target.value})}
                      />
                    )
                  ) : (
                    <p className="text-lg font-black tracking-tight text-slate-900">
                      {stat.value}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Description Section */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Info className="w-24 h-24" />
               </div>
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                 <MessageSquare className="w-3.5 h-3.5" /> Incident Report
               </h3>
               {isEditMode ? (
                 <textarea 
                   className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                   value={editData.description}
                   onChange={e => setEditData({...editData, description: e.target.value})}
                 />
               ) : (
                 <p className="text-slate-700 font-medium leading-relaxed text-lg">
                   {ticket.description}
                 </p>
               )}
            </div>

            {ticket.resolutionNotes && (
              <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                   <CircleCheck className="w-24 h-24 text-emerald-500" />
                 </div>
                 <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
                   <CheckCircle2 className="w-3.5 h-3.5" /> Resolution Notes
                 </h3>
                 <p className="text-emerald-900 font-medium leading-relaxed text-lg whitespace-pre-wrap">
                   {ticket.resolutionNotes}
                 </p>
              </div>
            )}

            {/* Workflow Actions Section */}
            <AnimatePresence mode="wait">
              {isAdmin && ticket.status === 'OPEN' && !showRejectForm && (
                <motion.div 
                  key="admin-actions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[60px] -mr-32 -mt-32 rounded-full"></div>
                  <h3 className="text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-tight">
                    <ShieldCheck className="w-6 h-6 text-indigo-400" /> Admin Command Hub
                  </h3>
                  <button 
                    onClick={() => setIsAssignModalOpen(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black px-10 py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                  >
                    <Zap className="w-4 h-4" /> Deploy Expert
                  </button>
                  <button 
                    onClick={() => setShowRejectForm(true)}
                    className="w-full mt-4 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 font-bold py-4 rounded-2xl transition-all border border-white/5 hover:border-rose-500/30 text-xs uppercase tracking-widest"
                  >
                    Reject Application
                  </button>
                  
                  {isAssignModalOpen && (
                    <AssignTechnicianModal
                      ticketId={ticket.id}
                      ticketCategory={ticket.category}
                      ticketLocation={ticket.location}
                      currentUserId={currentUserId}
                      role={role}
                      onClose={() => setIsAssignModalOpen(false)}
                      onAssign={handleAssignSuccess}
                    />
                  )}
                </motion.div>
              )}

              {role === 'USER' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-indigo-50/50 p-8 rounded-[3rem] border border-indigo-100 shadow-inner relative overflow-hidden"
                >
                  <h3 className="text-lg font-black text-indigo-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
                    <UserIcon className="w-6 h-6 text-indigo-500" /> Student Actions
                  </h3>
                  
                  {isEditMode ? (
                    <div className="flex gap-4">
                      <button 
                        onClick={handleUpdateTicket}
                        disabled={updating}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                      >
                        {updating ? <Clock className="animate-spin w-4 h-4" /> : 'Save Changes'}
                      </button>
                      <button 
                        onClick={() => setIsEditMode(false)}
                        className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setIsEditMode(true)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                      >
                        Edit Ticket
                      </button>
                      <button 
                        onClick={handleDeleteTicket}
                        disabled={updating}
                        className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-rose-500/30 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                      >
                        Delete Ticket
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {isTechnician && ticket.assignedTechnicianId === currentUserId && (
                <div className="space-y-6">
                  {ticket.status === 'ASSIGNED' && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col md:flex-row gap-4">
                      <button 
                        onClick={async () => {
                          setUpdating(true);
                          try {
                            const updated = await startWork(ticket.id, currentUserId);
                            setTicket(updated);
                            onUpdated();
                          } catch (err: any) {
                            alert('Failed to start work: ' + (err.response?.data?.message || err.message));
                          } finally {
                            setUpdating(false);
                          }
                        }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[2rem] transition-all shadow-2xl shadow-indigo-600/20 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                      >
                         <Zap className="w-5 h-5" /> Start Mission
                      </button>
                      <button 
                        onClick={() => handleStatusChange('OPEN', 'Technician rejected assignment')}
                        className="px-8 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-[2rem] hover:bg-slate-50 transition-all text-xs uppercase"
                      >
                        Decline
                      </button>
                    </motion.div>
                  )}

                  {ticket.status === 'IN_PROGRESS' && !showResolveForm && (
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-[3rem] bg-emerald-950 text-white space-y-6 shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[60px] -mr-32 -mt-32 rounded-full"></div>
                       <h3 className="font-black text-xl flex items-center gap-3">
                          <CircleCheck className="w-8 h-8 text-emerald-400" /> Operational Center
                       </h3>
                       <button 
                        onClick={() => setShowResolveForm(true)}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-5 rounded-[2rem] transition-all shadow-2xl shadow-emerald-500/40 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                       >
                         Mark as Resolved <ArrowRight className="w-5 h-5" />
                       </button>
                    </motion.div>
                  )}
                </div>
              )}
            </AnimatePresence>

            {/* Input Forms */}
            <AnimatePresence>
              {(showRejectForm || showResolveForm) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-8 rounded-[3rem] border-2 space-y-6 ${showRejectForm ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}
                >
                   <div className="flex items-center justify-between">
                     <h3 className={`font-black uppercase tracking-widest text-xs flex items-center gap-2 ${showRejectForm ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {showRejectForm ? <TriangleAlert className="w-5 h-5" /> : <CircleCheck className="w-5 h-5" />} Mandatory Documentation
                     </h3>
                     <button onClick={() => { setShowRejectForm(false); setShowResolveForm(false); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                   </div>
                   <textarea 
                      className="w-full rounded-[2rem] border-2 border-white bg-white/80 p-6 text-sm font-medium focus:outline-none focus:border-indigo-400 transition-all shadow-inner"
                      placeholder={showRejectForm ? "Why is this being rejected?" : "Detailed resolution notes..."}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                   />
                   <button 
                    onClick={() => handleStatusChange(showRejectForm ? 'REJECTED' : 'RESOLVED', notes)}
                    disabled={updating}
                    className={`w-full py-5 rounded-[2rem] text-white font-black uppercase tracking-widest text-xs transition-all shadow-2xl ${showRejectForm ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
                   >
                     {updating ? <Clock className="animate-spin w-5 h-5 mx-auto" /> : `Finalize ${showRejectForm ? 'Rejection' : 'Resolution'}`}
                   </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Discussion Feed */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-indigo-500" />
                  </div>
                  <h3 className="font-black text-slate-800 uppercase tracking-tighter">Communication Feed</h3>
                </div>
                <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                  {ticket.comments?.length || 0} Entries
                </span>
              </div>
              
              <div className="bg-white rounded-[3rem] border border-slate-200/60 p-8 shadow-sm h-[500px] flex flex-col relative">
                <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar flex flex-col-reverse">
                  <div className="flex flex-col gap-6">
                  {ticket.comments && ticket.comments.length > 0 ? (
                    ticket.comments.map((c) => (
                      <CommentBubble 
                        key={c.id} 
                        comment={c} 
                        currentUserId={currentUserId} 
                      />
                    ))
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center opacity-30">
                       <Inbox className="w-16 h-16 mb-4 text-slate-300" />
                       <p className="font-bold text-slate-400">No signals detected yet.</p>
                    </div>
                  )}
                  </div>
                </div>

                <form onSubmit={handlePostComment} className="mt-8 relative">
                   <input 
                      type="text" 
                      placeholder="Type your transmission..."
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-full px-8 py-5 pr-16 text-sm font-bold focus:outline-none focus:border-indigo-400 transition-all focus:bg-white focus:shadow-xl shadow-inner"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                   />
                   <button 
                      type="submit"
                      disabled={!comment.trim() || updating}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 bg-indigo-600 rounded-full text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-110 active:scale-95 transition-all disabled:opacity-30"
                   >
                     <Send className="w-5 h-5 ml-0.5" />
                   </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default TicketDetailView;
