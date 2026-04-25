import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resourceService } from '../../services/resourceService';
import type { Resource, ResourceType, ResourceStatus, ResourceFilters } from '../../services/resourceService';
import { useAuth } from '../../contexts/AuthContext';

const TYPE_LABELS: Record<ResourceType, string> = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment',
};

const TYPE_ICONS: Record<ResourceType, string> = {
  LECTURE_HALL: '🏛️',
  LAB: '🔬',
  MEETING_ROOM: '🤝',
  EQUIPMENT: '📷',
};

const TYPE_HEADER_STYLES: Record<ResourceType, string> = {
  LECTURE_HALL: 'bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-100',
  LAB: 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100',
  MEETING_ROOM: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-100',
  EQUIPMENT: 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-100',
};

const STATUS_STYLES: Record<ResourceStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  OUT_OF_SERVICE: 'bg-red-100 text-red-700 border border-red-200',
};

const DAY_LABELS: Record<string, string> = {
  MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu',
  FRI: 'Fri', SAT: 'Sat', SUN: 'Sun',
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
  return m === 0 ? `${hour}${ampm}` : `${hour}:${String(m).padStart(2, '0')}${ampm}`;
}

export default function ResourceCatalogue() {
  const { role } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<ResourceFilters>({});
  const [typeFilter, setTypeFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchResources = async (activeFilters: ResourceFilters) => {
    setLoading(true);
    setError('');
    try {
      const res = await resourceService.getAll(activeFilters);
      setResources(res.data);
    } catch {
      setError('Failed to load resources. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources(filters);
  }, [filters]);

  const handleSearch = () => {
    setFilters({
      type: (typeFilter as ResourceType) || undefined,
      minCapacity: capacityFilter ? Number(capacityFilter) : undefined,
      location: locationFilter || undefined,
      status: (statusFilter as ResourceStatus) || undefined,
    });
  };

  const handleClear = () => {
    setTypeFilter('');
    setCapacityFilter('');
    setLocationFilter('');
    setStatusFilter('');
    setFilters({});
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      await resourceService.delete(id);
      setResources(prev => prev.filter(r => r.id !== id));
    } catch {
      alert('Failed to delete resource.');
    }
  };

  const handleToggleStatus = async (resource: Resource) => {
    const newStatus: ResourceStatus = resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';
    try {
      const res = await resourceService.updateStatus(resource.id, newStatus);
      setResources(prev => prev.map(r => r.id === resource.id ? res.data : r));
    } catch {
      alert('Failed to update status.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Facilities & Assets Catalogue</h1>
            <p className="text-sm text-gray-500 mt-1">Browse and manage bookable resources</p>
          </div>
          {role === 'instructor' && (
            <Link
              to="/resources/new"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm transition-colors"
            >
              <span className="text-lg leading-none">+</span> Add Resource
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filter Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Filter & Search</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Resource Type</label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="LECTURE_HALL">🏛️ Lecture Hall</option>
                <option value="LAB">🔬 Lab</option>
                <option value="MEETING_ROOM">🤝 Meeting Room</option>
                <option value="EQUIPMENT">📷 Equipment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min Capacity</label>
              <input
                type="number"
                placeholder="e.g. 30"
                value={capacityFilter}
                onChange={e => setCapacityFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g. Block A"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">✅ Active</option>
                <option value="OUT_OF_SERVICE">🔴 Out of Service</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSearch}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Search
            </button>
            <button
              onClick={handleClear}
              className="bg-white text-gray-600 px-5 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        {!loading && !error && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-900">{resources.length}</span> resource{resources.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-3 text-xs">
              <span className="text-emerald-600 font-medium">
                {resources.filter(r => r.status === 'ACTIVE').length} Active
              </span>
              <span className="text-red-500 font-medium">
                {resources.filter(r => r.status === 'OUT_OF_SERVICE').length} Out of Service
              </span>
            </div>
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Loading resources...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center text-red-700 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && resources.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-700 font-medium">No resources found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or add a new resource.</p>
            {role === 'instructor' && (
              <Link to="/resources/new" className="inline-block mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                + Add First Resource
              </Link>
            )}
          </div>
        )}

        {/* Resource Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map(resource => (
            <div
              key={resource.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Card Header */}
              <div className={`px-5 py-4 border-b flex justify-between items-start ${TYPE_HEADER_STYLES[resource.type]}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{TYPE_ICONS[resource.type]}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base leading-tight">{resource.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{TYPE_LABELS[resource.type]}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[resource.status]}`}>
                  {resource.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
                </span>
              </div>

              {/* Card Body */}
              <div className="px-5 py-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📍</span>
                  <span>{resource.location}</span>
                </div>
                {resource.capacity && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>👥</span>
                    <span>{resource.capacity} people</span>
                  </div>
                )}
                {resource.availableDays && (() => {
                  const schedule = parseSchedule(resource.availableDays);
                  const hasHours = schedule.some(s => s.start);
                  return (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-0.5">📅</span>
                      {hasHours ? (
                        <div className="flex flex-col gap-1 w-full">
                          {schedule.map(({ day, start, end }) => (
                            <div key={day} className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-500 w-8">{DAY_LABELS[day] ?? day}</span>
                              <span className="text-xs text-gray-600">{fmt(start!)} – {fmt(end!)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {schedule.map(({ day }) => (
                            <span key={day} className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-medium px-1.5 py-0.5 rounded">
                              {DAY_LABELS[day] ?? day}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
                {resource.description && (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{resource.description}</p>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <Link
                  to={`/resources/${resource.id}`}
                  className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                >
                  View Details →
                </Link>
                {role === 'instructor' && (
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/resources/${resource.id}/edit`}
                      className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(resource)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      title={resource.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                    >
                      {resource.status === 'ACTIVE' ? '🔒' : '🔓'}
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
