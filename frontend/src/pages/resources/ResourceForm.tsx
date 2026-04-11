import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { resourceService } from '../../services/resourceService';
import type { CreateResourceRequest } from '../../services/resourceService';

const DAYS = [
  { key: 'MON', label: 'Mon' },
  { key: 'TUE', label: 'Tue' },
  { key: 'WED', label: 'Wed' },
  { key: 'THU', label: 'Thu' },
  { key: 'FRI', label: 'Fri' },
  { key: 'SAT', label: 'Sat' },
  { key: 'SUN', label: 'Sun' },
];

function DayPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const selected = value ? value.split(',').filter(Boolean) : [];

  const toggle = (day: string) => {
    const next = selected.includes(day)
      ? selected.filter(d => d !== day)
      : [...selected, day];
    // preserve order
    onChange(DAYS.filter(d => next.includes(d.key)).map(d => d.key).join(','));
  };

  const selectAll = () => onChange(DAYS.map(d => d.key).join(','));
  const clearAll = () => onChange('');
  const selectWeekdays = () => onChange('MON,TUE,WED,THU,FRI');
  const selectWeekend = () => onChange('SAT,SUN');

  return (
    <div className="space-y-3">
      {/* Quick presets */}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={selectAll}
          className="text-xs px-3 py-1 rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors">
          All Days
        </button>
        <button type="button" onClick={selectWeekdays}
          className="text-xs px-3 py-1 rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors">
          Weekdays
        </button>
        <button type="button" onClick={selectWeekend}
          className="text-xs px-3 py-1 rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors">
          Weekend
        </button>
        <button type="button" onClick={clearAll}
          className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          Clear
        </button>
      </div>

      {/* Day toggle buttons */}
      <div className="flex gap-2">
        {DAYS.map(({ key, label }) => {
          const active = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                active
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-500 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Selected summary */}
      {selected.length > 0 ? (
        <p className="text-xs text-indigo-600 font-medium">
          {selected.length === 7
            ? 'Available every day'
            : selected.length === 5 && !selected.includes('SAT') && !selected.includes('SUN')
            ? 'Available on weekdays'
            : `Available on: ${selected.join(', ')}`}
        </p>
      ) : (
        <p className="text-xs text-gray-400">No days selected</p>
      )}
    </div>
  );
}

function TimeRangeInput({
  startValue, endValue,
  onStartChange, onEndChange,
}: {
  startValue: string; endValue: string;
  onStartChange: (v: string) => void; onEndChange: (v: string) => void;
}) {
  const toMinutes = (t: string) => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const toPercent = (t: string) => (toMinutes(t) / (24 * 60)) * 100;

  const startMin = startValue ? toMinutes(startValue) : 0;
  const endMin = endValue ? toMinutes(endValue) : 0;
  const duration = endMin > startMin ? endMin - startMin : 0;
  const durationHrs = Math.floor(duration / 60);
  const durationMins = duration % 60;

  const left = startValue ? toPercent(startValue) : 0;
  const width = startValue && endValue && endMin > startMin
    ? toPercent(endValue) - toPercent(startValue)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Opens At</label>
          <input
            type="time"
            value={startValue}
            onChange={e => onStartChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Closes At</label>
          <input
            type="time"
            value={endValue}
            onChange={e => onEndChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Visual timeline bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>12 AM</span>
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>12 AM</span>
        </div>
        <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          {width > 0 && (
            <div
              className="absolute top-0 h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          )}
        </div>

        {/* Duration badge */}
        {duration > 0 ? (
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-indigo-600 font-medium">
              {startValue} → {endValue}
            </p>
            <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">
              {durationHrs > 0 ? `${durationHrs}h ` : ''}{durationMins > 0 ? `${durationMins}m` : ''} window
            </span>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-2">Select start and end times to preview</p>
        )}
      </div>

      {/* Quick presets */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">Quick presets:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Morning (8 AM – 12 PM)', start: '08:00', end: '12:00' },
            { label: 'Afternoon (1 PM – 5 PM)', start: '13:00', end: '17:00' },
            { label: 'Business Hours (8 AM – 5 PM)', start: '08:00', end: '17:00' },
            { label: 'Full Day (7 AM – 10 PM)', start: '07:00', end: '22:00' },
          ].map(preset => (
            <button
              key={preset.label}
              type="button"
              onClick={() => { onStartChange(preset.start); onEndChange(preset.end); }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                startValue === preset.start && endValue === preset.end
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ResourceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const { register, handleSubmit, reset, control, setValue, formState: { errors, isSubmitting } } = useForm<CreateResourceRequest>();

  useEffect(() => {
    if (isEdit && id) {
      resourceService.getById(Number(id)).then(res => {
        const r = res.data;
        reset({
          name: r.name,
          type: r.type,
          capacity: r.capacity ?? undefined,
          location: r.location,
          description: r.description,
          status: r.status,
          availabilityStart: r.availabilityStart ?? undefined,
          availabilityEnd: r.availabilityEnd ?? undefined,
          availableDays: r.availableDays ?? undefined,
          imageUrl: r.imageUrl ?? undefined,
        });
        setStartTime(r.availabilityStart ?? '');
        setEndTime(r.availabilityEnd ?? '');
        setPageLoading(false);
      }).catch(() => {
        alert('Failed to load resource.');
        navigate('/resources');
      });
    }
  }, [id]);

  const handleStartChange = (v: string) => {
    setStartTime(v);
    setValue('availabilityStart', v);
  };

  const handleEndChange = (v: string) => {
    setEndTime(v);
    setValue('availabilityEnd', v);
  };

  const onSubmit = async (data: CreateResourceRequest) => {
    const payload = { ...data, availabilityStart: startTime || undefined, availabilityEnd: endTime || undefined };
    try {
      if (isEdit && id) {
        await resourceService.update(Number(id), payload);
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

          {/* Availability Window */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Availability Window</h2>
                <span className="text-xs text-gray-400">Optional</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Set when this resource can be booked</p>
            </div>
            <div className="p-6 space-y-6">

              {/* Time Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Daily Hours</label>
                <TimeRangeInput
                  startValue={startTime}
                  endValue={endTime}
                  onStartChange={handleStartChange}
                  onEndChange={handleEndChange}
                />
              </div>

              <div className="border-t border-gray-100 pt-5">
                <label className="block text-sm font-medium text-gray-700 mb-3">Available Days</label>
                <Controller
                  name="availableDays"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <DayPicker value={field.value ?? ''} onChange={field.onChange} />
                  )}
                />
              </div>
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
