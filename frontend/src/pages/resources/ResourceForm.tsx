import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { resourceService } from '../../services/resourceService';
import type { CreateResourceRequest } from '../../services/resourceService';

const DAYS = [
  { key: 'MON', label: 'Monday' },
  { key: 'TUE', label: 'Tuesday' },
  { key: 'WED', label: 'Wednesday' },
  { key: 'THU', label: 'Thursday' },
  { key: 'FRI', label: 'Friday' },
  { key: 'SAT', label: 'Saturday' },
  { key: 'SUN', label: 'Sunday' },
];

type DaySchedule = { enabled: boolean; start: string; end: string };
type ScheduleMap = Record<string, DaySchedule>;

const DEFAULT_SCHEDULE: ScheduleMap = Object.fromEntries(
  DAYS.map(d => [d.key, { enabled: false, start: '08:00', end: '17:00' }])
);

function parseDaySchedules(encoded: string | null | undefined): ScheduleMap {
  const result: ScheduleMap = JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
  if (!encoded) return result;

  if (encoded.includes(':')) {
    // New format: MON:08:00-17:00,SAT:10:00-14:00
    encoded.split(',').forEach(part => {
      const colonIdx = part.indexOf(':');
      if (colonIdx === -1) return;
      const day = part.slice(0, colonIdx).trim();
      const times = part.slice(colonIdx + 1).trim();
      const dashIdx = times.indexOf('-');
      if (dashIdx === -1) return;
      const start = times.slice(0, dashIdx);
      const end = times.slice(dashIdx + 1);
      if (result[day]) result[day] = { enabled: true, start, end };
    });
  } else {
    // Old format: MON,TUE,WED
    encoded.split(',').forEach(day => {
      const key = day.trim();
      if (result[key]) result[key].enabled = true;
    });
  }
  return result;
}

function encodeDaySchedules(schedules: ScheduleMap): string {
  return DAYS
    .filter(d => schedules[d.key]?.enabled)
    .map(d => `${d.key}:${schedules[d.key].start}-${schedules[d.key].end}`)
    .join(',');
}

function DayScheduleEditor({
  value,
  onChange,
}: {
  value: ScheduleMap;
  onChange: (v: ScheduleMap) => void;
}) {
  const toggle = (key: string) =>
    onChange({ ...value, [key]: { ...value[key], enabled: !value[key].enabled } });

  const setTime = (key: string, field: 'start' | 'end', time: string) =>
    onChange({ ...value, [key]: { ...value[key], [field]: time } });

  const applyToAll = (start: string, end: string) => {
    const next: ScheduleMap = {};
    DAYS.forEach(d => { next[d.key] = { ...value[d.key], start, end }; });
    onChange(next);
  };

  const applyPreset = (keys: string[], start: string, end: string) => {
    const next = { ...value };
    DAYS.forEach(d => { next[d.key] = { ...next[d.key], enabled: false }; });
    keys.forEach(k => { next[k] = { ...next[k], enabled: true, start, end }; });
    onChange(next);
  };

  const enabledCount = DAYS.filter(d => value[d.key]?.enabled).length;

  // Find if there's a "reference" time from any enabled day for "apply to all"
  const firstEnabled = DAYS.find(d => value[d.key]?.enabled);

  return (
    <div className="space-y-4">
      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyPreset(['MON','TUE','WED','THU','FRI'], '08:00', '17:00')}
          className="text-xs px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
        >
          Weekdays (8–5)
        </button>
        <button
          type="button"
          onClick={() => applyPreset(['SAT','SUN'], '10:00', '14:00')}
          className="text-xs px-3 py-1.5 rounded-full border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors font-medium"
        >
          Weekend (10–2)
        </button>
        <button
          type="button"
          onClick={() => applyPreset(DAYS.map(d => d.key), '08:00', '17:00')}
          className="text-xs px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors font-medium"
        >
          All Days (8–5)
        </button>
        {firstEnabled && (
          <button
            type="button"
            onClick={() => applyToAll(value[firstEnabled.key].start, value[firstEnabled.key].end)}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors font-medium"
          >
            Copy first to all
          </button>
        )}
        <button
          type="button"
          onClick={() => onChange(JSON.parse(JSON.stringify(DEFAULT_SCHEDULE)))}
          className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors font-medium"
        >
          Clear all
        </button>
      </div>

      {/* Per-day rows */}
      <div className="space-y-2">
        {DAYS.map(({ key, label }) => {
          const s = value[key];
          const isWeekend = key === 'SAT' || key === 'SUN';
          return (
            <div
              key={key}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                s.enabled
                  ? isWeekend
                    ? 'border-amber-200 bg-amber-50/40'
                    : 'border-indigo-200 bg-indigo-50/30'
                  : 'border-gray-100 bg-gray-50'
              }`}
            >
              {/* Toggle */}
              <button
                type="button"
                onClick={() => toggle(key)}
                className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 relative ${
                  s.enabled ? (isWeekend ? 'bg-amber-400' : 'bg-indigo-500') : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    s.enabled ? 'left-4' : 'left-0.5'
                  }`}
                />
              </button>

              {/* Day label */}
              <span className={`w-24 text-sm font-medium flex-shrink-0 ${s.enabled ? 'text-gray-800' : 'text-gray-400'}`}>
                {label}
              </span>

              {s.enabled ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={s.start}
                    onChange={e => setTime(key, 'start', e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent w-32"
                  />
                  <span className="text-gray-400 text-sm">–</span>
                  <input
                    type="time"
                    value={s.end}
                    onChange={e => setTime(key, 'end', e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent w-32"
                  />
                  {s.start && s.end && s.end > s.start && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      isWeekend ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {(() => {
                        const [sh, sm] = s.start.split(':').map(Number);
                        const [eh, em] = s.end.split(':').map(Number);
                        const mins = (eh * 60 + em) - (sh * 60 + sm);
                        const h = Math.floor(mins / 60);
                        const m = mins % 60;
                        return `${h > 0 ? `${h}h` : ''}${m > 0 ? ` ${m}m` : ''}`;
                      })()}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">Closed</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {enabledCount > 0 ? (
        <p className="text-xs text-indigo-600 font-medium">
          Open {enabledCount} day{enabledCount !== 1 ? 's' : ''} per week
        </p>
      ) : (
        <p className="text-xs text-gray-400">No days selected — toggle days to set availability</p>
      )}
    </div>
  );
}

export default function ResourceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [daySchedules, setDaySchedules] = useState<ScheduleMap>(JSON.parse(JSON.stringify(DEFAULT_SCHEDULE)));

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateResourceRequest>();

  useEffect(() => {
    if (isEdit && id) {
      resourceService.getById(id).then(res => {
        const r = res.data;
        reset({
          name: r.name,
          type: r.type,
          capacity: r.capacity ?? undefined,
          location: r.location,
          description: r.description,
          status: r.status,
          imageUrl: r.imageUrl ?? undefined,
        });
        setDaySchedules(parseDaySchedules(r.availableDays));
        setPageLoading(false);
      }).catch(() => {
        alert('Failed to load resource.');
        navigate('/resources');
      });
    }
  }, [id]);

  const onSubmit = async (data: CreateResourceRequest) => {
    const encoded = encodeDaySchedules(daySchedules);
    const payload: CreateResourceRequest = {
      ...data,
      availableDays: encoded || undefined,
      availabilityStart: undefined,
      availabilityEnd: undefined,
    };
    try {
      if (isEdit && id) {
        await resourceService.update(id, payload);
      } else {
        await resourceService.create(payload);
      }
      navigate('/resources');
    } catch {
      alert(`Failed to ${isEdit ? 'update' : 'create'} resource.`);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <Link to="/resources" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-2">
            ← Back to Catalogue
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Resource' : 'Add New Resource'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit ? 'Update the details of this resource.' : 'Fill in the details to add a new bookable resource.'}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Basic Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g. Computer Lab 101"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
                  <select
                    {...register('type', { required: 'Type is required' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="LECTURE_HALL">🏛️ Lecture Hall</option>
                    <option value="LAB">🔬 Lab</option>
                    <option value="MEETING_ROOM">🤝 Meeting Room</option>
                    <option value="EQUIPMENT">📷 Equipment</option>
                  </select>
                  {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
                  <select
                    {...register('status', { required: 'Status is required' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select status</option>
                    <option value="ACTIVE">✅ Active</option>
                    <option value="OUT_OF_SERVICE">🔴 Out of Service</option>
                  </select>
                  {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    {...register('location', { required: 'Location is required' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g. Block A, Floor 2"
                  />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity <span className="text-gray-400 text-xs">(optional)</span></label>
                  <input
                    type="number"
                    {...register('capacity', { min: { value: 1, message: 'Must be at least 1' } })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g. 50"
                  />
                  {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 text-xs">(optional)</span></label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Brief description of this resource..."
                />
              </div>
            </div>
          </div>

          {/* Availability Schedule */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Weekly Schedule</h2>
                <span className="text-xs text-gray-400">Optional</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Set opening hours per day — weekdays and weekends can differ</p>
            </div>
            <div className="p-6">
              <DayScheduleEditor value={daySchedules} onChange={setDaySchedules} />
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Media</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL <span className="text-gray-400 text-xs">(optional)</span></label>
              <input
                type="url"
                {...register('imageUrl')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pb-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Resource' : 'Create Resource'}
            </button>
            <Link
              to="/resources"
              className="px-6 py-2.5 bg-white text-gray-600 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
