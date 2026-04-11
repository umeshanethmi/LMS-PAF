import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { resourceService } from '../../services/resourceService';
import type { Resource, ResourceStatus } from '../../services/resourceService';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_STYLES: Record<ResourceStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  OUT_OF_SERVICE: 'bg-red-100 text-red-700 border border-red-200',
};

const TYPE_ICONS: Record<string, string> = {
  LECTURE_HALL: '🏛️',
  LAB: '🔬',
  MEETING_ROOM: '🤝',
  EQUIPMENT: '📷',
};

const TYPE_LABELS: Record<string, string> = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment',
};

const DAY_LABELS: Record<string, string> = {
  MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday',
  FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday',
};

function parseSchedule(availableDays: string | null): { day: string; start?: string; end?: string }[] {
  if (!availableDays) return [];
  if (availableDays.includes(':')) {
    return availableDays.split(',').map(part => {
      const colonIdx = part.indexOf(':');
      const day = part.slice(0, colonIdx).trim();
      const times = part.slice(colonIdx + 1).trim();
      const dashIdx = times.indexOf('-');
      return { day, start: times.slice(0, dashIdx), end: times.slice(dashIdx + 1) };
    });
  }
  return availableDays.split(',').map(day => ({ day: day.trim() }));
}

function fmt(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}:00 ${ampm}` : `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      resourceService.getById(Number(id))
        .then(res => setResource(res.data))
        .catch(() => {
          alert('Resource not found.');
          navigate('/resources');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleToggleStatus = async () => {
    if (!resource) return;
    const newStatus: ResourceStatus = resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';
    try {
      const res = await resourceService.updateStatus(resource.id, newStatus);
      setResource(res.data);
    } catch {
      alert('Failed to update status.');
    }
  };

  const handleDelete = async () => {
    if (!resource || !confirm('Are you sure you want to delete this resource?')) return;
    try {
      await resourceService.delete(resource.id);
      navigate('/resources');
    } catch {
      alert('Failed to delete resource.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading resource...</p>
        </div>
      </div>
    );
  }

  if (!resource) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Link to="/resources" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-3">
            ← Back to Catalogue
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{TYPE_ICONS[resource.type]}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{resource.name}</h1>
                <p className="text-sm text-gray-500">{TYPE_LABELS[resource.type]}</p>
              </div>
            </div>
            <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${STATUS_STYLES[resource.status]}`}>
              {resource.status === 'ACTIVE' ? '✅ Active' : '🔴 Out of Service'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
        {/* Details Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Resource Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex gap-3 items-start">
              <span className="text-xl">📍</span>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase">Location</p>
                <p className="text-gray-900 font-medium mt-0.5">{resource.location}</p>
              </div>
            </div>

            {resource.capacity && (
              <div className="flex gap-3 items-start">
                <span className="text-xl">👥</span>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Capacity</p>
                  <p className="text-gray-900 font-medium mt-0.5">{resource.capacity} people</p>
                </div>
              </div>
            )}

            {resource.availableDays && (() => {
              const schedule = parseSchedule(resource.availableDays);
              const hasHours = schedule.some(s => s.start);
              return (
                <div className="flex gap-3 items-start sm:col-span-2">
                  <span className="text-xl">📅</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-400 uppercase mb-2">Weekly Schedule</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {schedule.map(({ day, start, end }) => (
                        <div key={day} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                          <span className="text-sm font-medium text-gray-700">{DAY_LABELS[day] ?? day}</span>
                          {hasHours && start && end ? (
                            <span className="text-sm text-indigo-600 font-medium">{fmt(start)} – {fmt(end)}</span>
                          ) : (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Open</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-3 items-start">
              <span className="text-xl">📆</span>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase">Added On</p>
                <p className="text-gray-900 font-medium mt-0.5">{new Date(resource.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <span className="text-xl">🔄</span>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase">Last Updated</p>
                <p className="text-gray-900 font-medium mt-0.5">{new Date(resource.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {resource.description && (
            <div className="px-6 pb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-400 uppercase mb-2">Description</p>
                <p className="text-gray-700 text-sm leading-relaxed">{resource.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions Card - instructor only */}
        {role === 'instructor' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/resources/${resource.id}/edit`}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Edit Resource
              </Link>
              <button
                onClick={handleToggleStatus}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  resource.status === 'ACTIVE'
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
              >
                {resource.status === 'ACTIVE' ? 'Mark Out of Service' : 'Mark as Active'}
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-50 text-red-600 border border-red-200 px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                Delete Resource
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
