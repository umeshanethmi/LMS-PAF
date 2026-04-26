import React, { useState, useEffect } from 'react';
import { Users, X, User as UserIcon, ShieldCheck, Clock, MapPin, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTechnicians, assignTechnician } from '../../services/ticketApi';
import type { Ticket, TicketRole } from '../../services/ticketApi';

interface AssignTechnicianModalProps {
  ticketId: string;
  ticketCategory?: string;
  ticketLocation?: string;
  currentUserId: string;
  role: TicketRole;
  onClose: () => void;
  onAssign: () => void;
}

const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({ 
  ticketId, 
  ticketCategory, 
  ticketLocation,
  currentUserId,
  role,
  onClose, 
  onAssign 
}) => {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setFetching(true);
        const data = await getTechnicians();
        setTechnicians(data);
      } catch (err) {
        setError('Failed to fetch experts list.');
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchTechnicians();
  }, []);

  const handleAssign = async () => {
    if (!selectedTechnician) {
      setError('Please select an expert from the registry.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await assignTechnician(ticketId, selectedTechnician, currentUserId, role);
      onAssign();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete assignment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md overflow-hidden bg-white rounded-[2.5rem] shadow-2xl border border-slate-100"
      >
        {/* Animated Accent */}
        <div className="absolute top-0 right-0 h-3 w-40 bg-indigo-600 rounded-bl-[2.5rem]"></div>
        
        <div className="p-10">
          {/* Header */}
          <div className="flex items-center gap-6 mb-10">
            <div className="flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100 ring-4 ring-indigo-50 transition-transform hover:rotate-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Assign Expert</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">
                TICKET #{ticketId.substring(0, 12)}...
              </p>
            </div>
          </div>

          {/* Ticket Context */}
          {(ticketCategory || ticketLocation) && (
            <div className="flex flex-wrap gap-2 mb-8">
              {ticketCategory && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                  <Tag size={12} className="text-indigo-500" />
                  <span className="text-[11px] font-bold text-slate-600">{ticketCategory}</span>
                </div>
              )}
              {ticketLocation && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                  <MapPin size={12} className="text-rose-500" />
                  <span className="text-[11px] font-bold text-slate-600">{ticketLocation}</span>
                </div>
              )}
            </div>
          )}

          {/* Selection Area */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Registry Selection</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 pointer-events-none transition-colors">
                  <UserIcon />
                </div>
                <select
                  disabled={fetching || loading}
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select Technician...</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.username} (ID: {tech.id.substring(0,6)})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              {technicians.length === 0 && !fetching && !error && (
                <p className="text-[10px] text-amber-600 font-bold mt-1 ml-1 flex items-center gap-1">
                  <Clock size={10} /> No active technicians available in the registry.
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
              <button
                disabled={loading || fetching}
                onClick={handleAssign}
                className="w-full bg-indigo-600 hover:bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group uppercase tracking-widest text-xs"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Confirm Deployment
                    <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
              
              <button
                onClick={onClose}
                disabled={loading}
                className="w-full py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AssignTechnicianModal;
