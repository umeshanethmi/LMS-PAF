import { useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import FileUpload from '../common/FileUpload';
import { Loader2, PlusCircle, PenLine, Settings, MapPin, Hash, Phone } from 'lucide-react';

interface TicketCreateFormProps {
  currentUserId: number;
  onCreated: () => void;
}

function TicketCreateForm({ currentUserId, onCreated }: TicketCreateFormProps) {
  const [resourceId, setResourceId] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [location, setLocation] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (files.length > 3) {
      alert('You can upload up to 3 images.');
      return;
    }

    const formData = new FormData();
    formData.append('resourceId', resourceId);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('priority', priority);
    formData.append('location', location);
    formData.append('contactDetails', contactDetails);
    files.forEach((file) => {
      formData.append('images', file); // 'files' වෙනුවට 'images' දාන්න
    });

    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Incident ticket saved successfully!');
      setResourceId('');
      setDescription('');
      setCategory('');
      setPriority('MEDIUM');
      setLocation('');
      setContactDetails('');
      setFiles([]);
      onCreated();
    } catch (error) {
      console.error('Failed to create ticket', error);
      alert('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl transition-all duration-300">
      <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl"></div>
      
      <div className="relative z-10 flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner">
          <PlusCircle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">New Incident Map</h2>
          <p className="text-xs font-medium text-slate-500">Report an issue immediately</p>
        </div>
      </div>

      <div className="relative z-10 space-y-5">
        <div className="space-y-1.5 border border-slate-100 rounded-2xl p-4 bg-slate-50/50 shadow-sm">
          <label className="flex items-center gap-2 text-[13px] font-semibold tracking-wide text-slate-600 uppercase">
            <Hash className="h-4 w-4 text-indigo-500" />
            Resource ID
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            placeholder="e.g. PC-Lab-01"
            required
          />
        </div>

        <div className="space-y-1.5 border border-slate-100 rounded-2xl p-4 bg-slate-50/50 shadow-sm">
          <label className="flex items-center gap-2 text-[13px] font-semibold tracking-wide text-slate-600 uppercase">
            <PenLine className="h-4 w-4 text-indigo-500" />
            Description
          </label>
          <textarea
            className="w-full min-h-[100px] resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border border-slate-100 rounded-2xl p-4 bg-slate-50/50 shadow-sm">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[13px] font-semibold tracking-wide text-slate-600 uppercase">
              <Settings className="h-4 w-4 text-indigo-500" />
              Category
            </label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Hardware"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[13px] font-semibold tracking-wide text-slate-600 uppercase">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${priority === 'HIGH' ? 'bg-rose-400' : priority === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${priority === 'HIGH' ? 'bg-rose-500' : priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
              Priority
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
            </select>
          </div>
          <div className="col-span-1 md:col-span-2 space-y-1.5">
            <label className="flex items-center gap-2 text-[13px] font-semibold tracking-wide text-slate-600 uppercase">
              <MapPin className="h-4 w-4 text-indigo-500" />
              Location
            </label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Building A, Room 204"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5 border border-slate-100 rounded-2xl p-4 bg-slate-50/50 shadow-sm">
          <label className="flex items-center gap-2 text-[13px] font-semibold tracking-wide text-slate-600 uppercase">
            <Phone className="h-4 w-4 text-indigo-500" />
            Contact Details
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={contactDetails}
            onChange={(e) => setContactDetails(e.target.value)}
            placeholder="Your phone or email"
            required
          />
        </div>

        <div className="space-y-1.5 border border-slate-100 rounded-2xl p-4 bg-slate-50/50 shadow-sm">
          <label className="block text-[13px] font-semibold tracking-wide text-slate-600 uppercase">
            Attachments <span className="normal-case font-normal text-slate-400 text-xs ml-1">(up to 3 images)</span>
          </label>
          <div className="mt-2 rounded-xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <FileUpload
              maxFiles={3}
              accept={{ 'image/*': [] }}
              onFilesSelected={setFiles}
            />
          </div>
        </div>

        <button
          type="submit"
          className="group relative w-full overflow-hidden rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/40 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading}
        >
          <div className="flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Submitting Incident...</span>
              </>
            ) : (
              <>
                <span>Submit Incident Ticket</span>
                <PlusCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
              </>
            )}
          </div>
        </button>
      </div>
    </form>
  );
}

export default TicketCreateForm;
