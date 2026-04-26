import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import apiClient from '../../services/apiClient';

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

interface FormState {
  id: string | null;
  code: string;
  name: string;
  type: ResourceType;
  capacity: string;
  floor: string;
  description: string;
  active: boolean;
}

const EMPTY_FORM: FormState = {
  id: null,
  code: '',
  name: '',
  type: 'HALL',
  capacity: '1',
  floor: '',
  description: '',
  active: true,
};

const TYPE_BADGE: Record<ResourceType, string> = {
  HALL: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  LAB: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  EQUIPMENT: 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function ManageResourcesPage() {
  const [resources, setResources] = useState<CampusResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<ResourceType | 'ALL'>('ALL');
  const [query, setQuery] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const isEdit = form.id !== null;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get<CampusResource[]>('/resources');
      setResources(data);
    } catch {
      setError('Could not load resources. Make sure you are signed in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return resources.filter(r => {
      if (filter !== 'ALL' && r.type !== filter) return false;
      if (query && !`${r.code} ${r.name}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [resources, filter, query]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setDrawerOpen(true);
  };

  const openEdit = (r: CampusResource) => {
    setForm({
      id: r.id,
      code: r.code,
      name: r.name,
      type: r.type,
      capacity: String(r.capacity),
      floor: r.floor != null ? String(r.floor) : '',
      description: r.description ?? '',
      active: r.active,
    });
    setFormError('');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const capacity = Number(form.capacity);
    if (!form.code.trim() || !form.name.trim()) {
      setFormError('Code and name are required.');
      return;
    }
    if (!Number.isFinite(capacity) || capacity < 1) {
      setFormError('Capacity must be a positive number.');
      return;
    }

    const floor = form.floor.trim() === '' ? null : Number(form.floor);
    if (floor !== null && !Number.isFinite(floor)) {
      setFormError('Floor must be a number or empty.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && form.id) {
        await apiClient.put(`/resources/${form.id}`, {
          name: form.name.trim(),
          type: form.type,
          capacity,
          floor,
          description: form.description.trim() || null,
          active: form.active,
        });
      } else {
        await apiClient.post('/resources', {
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          type: form.type,
          capacity,
          floor,
          description: form.description.trim() || null,
        });
      }
      closeDrawer();
      load();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ??
              'Save failed.')
          : 'Save failed.';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (r: CampusResource) => {
    if (!window.confirm(`Deactivate resource ${r.code} (${r.name})?`)) return;
    try {
      await apiClient.delete(`/resources/${r.id}`);
      load();
    } catch {
      alert('Could not delete. You may not have permission.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Resources</h1>
          <p className="text-sm text-slate-500 mt-1">
            Add, edit and deactivate halls, labs and equipment used for bookings.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Resource
        </button>
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
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

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm py-3 px-4 rounded-xl mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-200">
          No resources match your search.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Building</th>
                <th className="px-5 py-3">Floor</th>
                <th className="px-5 py-3">Capacity</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-bold text-slate-900">{r.code}</td>
                  <td className="px-5 py-3 text-slate-700">{r.name}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md border ${TYPE_BADGE[r.type]}`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {r.building}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {r.floor != null ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {r.floor}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {r.capacity}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {r.active ? (
                      <span className="inline-block text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md border bg-slate-100 text-slate-500 border-slate-200">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(r)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Deactivate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeDrawer}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                {isEdit ? 'Edit Resource' : 'Add Resource'}
              </h2>
              <button
                onClick={closeDrawer}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Code</label>
                  <input
                    value={form.code}
                    onChange={e => setForm(s => ({ ...s, code: e.target.value }))}
                    disabled={isEdit}
                    placeholder="A101"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    required
                  />
                  {isEdit && (
                    <p className="text-[10px] text-slate-400 mt-1">Code cannot be changed after creation.</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(s => ({ ...s, type: e.target.value as ResourceType }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="HALL">Hall</option>
                    <option value="LAB">Lab</option>
                    <option value="EQUIPMENT">Equipment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
                  placeholder="Lecture Hall A101"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={e => setForm(s => ({ ...s, capacity: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Floor (optional)</label>
                  <input
                    type="number"
                    value={form.floor}
                    onChange={e => setForm(s => ({ ...s, floor: e.target.value }))}
                    placeholder="1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(s => ({ ...s, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
                />
              </div>

              {isEdit && (
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={e => setForm(s => ({ ...s, active: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium">Active</span>
                </label>
              )}

              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm py-2.5 px-3 rounded-lg">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg shadow-indigo-200 transition-colors disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEdit ? 'Save Changes' : 'Create Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
