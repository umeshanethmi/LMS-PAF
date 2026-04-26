import { useEffect, useState } from 'react';
import { CalendarCheck, Clock, MapPin, Loader2, XCircle, Users, CheckCircle2, AlertCircle, Ban } from 'lucide-react';
import { bookingApi, type BookingRecord } from '../services/bookingApi';

const STATUS_CONFIG = {
  PENDING:   { color: 'bg-amber-100 text-amber-700 border-amber-200',    icon: AlertCircle,   label: 'Pending' },
  APPROVED:  { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Approved' },
  REJECTED:  { color: 'bg-rose-100 text-rose-700 border-rose-200',       icon: XCircle,       label: 'Rejected' },
  CANCELLED: { color: 'bg-slate-100 text-slate-500 border-slate-200',    icon: Ban,           label: 'Cancelled' },
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await bookingApi.myBookings();
      setBookings(data);
    } catch {
      setError('Could not load bookings. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await bookingApi.cancel(id);
      load();
    } catch {
      alert('Could not cancel booking.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-6 text-white shadow-xl"
        style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
            <CalendarCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter">My Bookings</h1>
            <p className="text-slate-300 text-sm font-medium">Manage your campus resource reservations</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-bold">
          {error}
        </div>
      )}

      {!loading && bookings.length === 0 && !error && (
        <div className="text-center py-16 text-slate-400">
          <CalendarCheck className="w-14 h-14 mx-auto mb-4 opacity-30" />
          <p className="font-bold text-lg">No bookings yet</p>
          <p className="text-sm mt-1">Use the Booking Assistant to find and reserve a room.</p>
        </div>
      )}

      <div className="space-y-3">
        {bookings.map(b => {
          const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING;
          const Icon = cfg.icon;
          return (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg">
                      {b.resourceCode}
                    </span>
                    <span className="font-bold text-slate-800">{b.resourceName}</span>
                    <span className={`flex items-center gap-1 text-xs font-bold border rounded-lg px-2 py-0.5 ${cfg.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {b.building}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {new Date(b.startTime).toLocaleString()} → {new Date(b.endTime).toLocaleTimeString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-purple-400" /> {b.partySize} person(s)
                    </span>
                  </div>
                  {b.purpose && <p className="text-xs text-slate-400 italic">"{b.purpose}"</p>}
                </div>

                {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                  <button
                    onClick={() => handleCancel(b.id)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 border border-rose-100 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
