import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { createTicket } from '../../services/ticketApi';
import FileUpload from '../common/FileUpload';
import { Clock, CirclePlus, PenLine, Settings, MapPin, Hash, Phone, Zap, Droplets, Monitor, Wind, Trash2, Armchair, Shield, MoreHorizontal, AlertCircle } from 'lucide-react';

interface TicketCreateFormProps {
  currentUserId: string;
  onCreated: () => void;
}

function TicketCreateForm({ currentUserId, onCreated }: TicketCreateFormProps) {
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [location, setLocation] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { name: 'Electrical', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Plumbing', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'IT / Network', icon: Monitor, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { name: 'HVAC', icon: Wind, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { name: 'Cleaning', icon: Trash2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: 'Furniture', icon: Armchair, color: 'text-orange-500', bg: 'bg-orange-50' },
    { name: 'Security', icon: Shield, color: 'text-rose-500', bg: 'bg-rose-50' },
    { name: 'Other', icon: MoreHorizontal, color: 'text-slate-500', bg: 'bg-slate-50' }
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    const cleanPhone = contactDetails.replace(/[\s\-\(\)]/g, '');
    if (!/^\+?\d{10,15}$/.test(cleanPhone)) {
      alert('Please enter a valid phone number (10-15 digits).');
      return;
    }

    if (files.length > 3) {
      alert('You can upload up to 3 images.');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('priority', priority);
    formData.append('location', location);
    formData.append('contactDetails', contactDetails);
    formData.append('currentUserId', currentUserId.toString());
    
    files.forEach((file) => {
      formData.append('files', file); 
    });

    setLoading(true);
    try {
      await createTicket(formData);
      alert('Incident ticket reported successfully!');
      setEmail('');
      setDescription('');
      setCategory('');
      setPriority('MEDIUM');
      setLocation('');
      setContactDetails('');
      setFiles([]);
      onCreated();
    } catch (error: any) {
      console.error('Failed to create ticket', error);
      const message = error.response?.data?.message || error.message || 'Failed to report incident. Please try again.';
      alert(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl transition-all duration-300">
      <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl"></div>
      
      <div className="relative z-10 flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner border border-indigo-100/50">
          <CirclePlus className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Report Incident</h2>
          <p className="text-xs font-medium text-slate-500 italic">Provide details about the issue</p>
        </div>
      </div>

      <div className="relative z-10 space-y-8">
        {/* Step 1: Incident Details */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">1. Incident Details</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[13px] font-black tracking-wide text-slate-700 uppercase">
              <Settings className="h-4 w-4 text-indigo-500" />
              Select Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100 scale-105' 
                        : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-3 rounded-xl mb-2 ${isSelected ? 'bg-white shadow-sm' : cat.bg}`}>
                      <Icon className={`h-6 w-6 ${isSelected ? 'text-indigo-600' : cat.color}`} />
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-tight ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[13px] font-black tracking-wide text-slate-700 uppercase">
                <AlertCircle className="h-4 w-4 text-indigo-500" />
                Set Priority
              </label>
              <div className="flex p-1.5 bg-slate-100 rounded-2xl gap-1">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      priority === p 
                        ? p === 'HIGH' ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 
                          p === 'MEDIUM' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 
                          'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                        : 'text-slate-500 hover:bg-white/50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[13px] font-black tracking-wide text-slate-700 uppercase">
                <MapPin className="h-4 w-4 text-indigo-500" />
                Exact Location
              </label>
              <input
                className="w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Library 2nd Floor, Room 204"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[13px] font-black tracking-wide text-slate-700 uppercase">
              <PenLine className="h-4 w-4 text-indigo-500" />
              Description
            </label>
            <textarea
              className="w-full min-h-[120px] rounded-2xl border-2 border-slate-100 bg-white px-4 py-4 text-sm font-bold text-slate-700 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about the maintenance issue..."
              required
            />
          </div>
        </section>

        {/* Step 2: Contact & Attachments */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">2. Contact & Evidence</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[13px] font-black tracking-wide text-slate-700 uppercase">
                <Hash className="h-4 w-4 text-indigo-500" />
                Notification Email
              </label>
              <input
                type="email"
                className="w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@campus.edu"
                pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                title="Please enter a valid email address (e.g., name@domain.com)"
                required
              />
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[13px] font-black tracking-wide text-slate-700 uppercase">
                <Phone className="h-4 w-4 text-indigo-500" />
                Contact Number
              </label>
              <input
                className="w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                value={contactDetails}
                onChange={(e) => setContactDetails(e.target.value)}
                placeholder="e.g. 0712345678"
                pattern="^\+?\d{10,15}$"
                title="Please enter a valid phone number (10-15 digits)"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[13px] font-black tracking-wide text-slate-700 uppercase">
              Visual Evidence <span className="normal-case font-bold text-slate-400 text-xs ml-1">(up to 3 images)</span>
            </label>
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition-colors p-2">
              <FileUpload
                maxFiles={3}
                accept={{ 'image/*': [] }}
                onFilesSelected={(selected) => setFiles(selected)}
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="group relative w-full overflow-hidden rounded-[2rem] bg-indigo-600 py-5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-indigo-600/30 transition-all hover:bg-indigo-700 hover:scale-[1.01] active:scale-95 disabled:opacity-70"
          disabled={loading || !category}
        >
          <div className="flex items-center justify-center gap-3">
            {loading ? (
              <>
                <Clock className="h-6 w-6 animate-spin" />
                <span>Synchronizing...</span>
              </>
            ) : (
              <>
                <span>Broadcast Incident</span>
                <CirclePlus className="h-6 w-6 transition-transform group-hover:rotate-90" />
              </>
            )}
          </div>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_2s_infinite]"></div>
        </button>
      </div>
    </form>
  );
}

export default TicketCreateForm;
