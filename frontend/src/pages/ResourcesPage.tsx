import { useEffect, useState } from 'react';
import { Building2, Layers, Users, Loader2, Search } from 'lucide-react';
import apiClient from '../services/apiClient';
import { Link } from 'react-router-dom';

type ResourceType = 'HALL' | 'LAB' | 'EQUIPMENT';

interface CampusResource {
  id: string;
  code: string;
  name: string;
  type: ResourceType;
  capacity: number;
  floor: number | null;
  description: string | null;
  building: string;
  active: boolean;
}

const TYPE_BADGE: Record<ResourceType, string> = {
  HALL: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  LAB: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  EQUIPMENT: 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<CampusResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ResourceType | 'ALL'>('ALL');
  const [query, setQuery] = useState('');

  useEffect(() => {
    apiClient.get<CampusResource[]>('/resources')
      .then(res => setResources(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = resources.filter(r => {
    if (filter !== 'ALL' && r.type !== filter) return false;
    if (query && !`${r.code} ${r.name}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Campus Resources</h1>
          <p className="text-slate-500 mt-1">Browse halls, labs and equipment across the campus.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by code or name (e.g. A101)"
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
            {(['ALL', 'HALL', 'LAB', 'EQUIPMENT'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === t
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            No resources match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(r => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">{r.code}</p>
                    <h3 className="font-semibold text-slate-900 mt-0.5">{r.name}</h3>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${TYPE_BADGE[r.type]}`}>
                    {r.type}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{r.building}</span>
                  </div>
                  {r.floor != null && (
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-400" />
                      <span>Floor {r.floor}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Capacity {r.capacity}</span>
                  </div>
                </div>

                {r.description && (
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{r.description}</p>
                )}

                <Link
                  to="/booking"
                  className="block text-center bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-sm py-2 rounded-lg transition-colors"
                >
                  Book this resource
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
