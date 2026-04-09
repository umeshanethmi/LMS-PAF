import { useState } from 'react';
import type { FormEvent } from 'react';
import { createTicket } from '../../services/ticketApi';
import FileUpload from '../common/FileUpload';

interface TicketCreateFormProps {
  currentUserId: number;
  onCreated: () => void;
}

function TicketCreateForm({ currentUserId, onCreated }: TicketCreateFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [location, setLocation] = useState('');
  const [preferredContact, setPreferredContact] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (files.length > 3) {
      alert('You can upload up to 3 images.');
      return;
    }

    const formData = new FormData();
    formData.append('currentUserId', String(currentUserId));
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('priority', priority);
    formData.append('location', location);
    formData.append('preferredContact', preferredContact);
    files.forEach((file) => {
      formData.append('files', file);
    });

    setLoading(true);
    try {
      await createTicket(formData);
      setTitle('');
      setDescription('');
      setCategory('');
      setPriority('MEDIUM');
      setLocation('');
      setPreferredContact('');
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
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded">
      <h2 className="text-xl font-semibold">Create Ticket</h2>
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          className="mt-1 w-full border rounded px-2 py-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          className="mt-1 w-full border rounded px-2 py-1"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Category</label>
          <input
            className="mt-1 w-full border rounded px-2 py-1"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Priority</label>
          <select
            className="mt-1 w-full border rounded px-2 py-1"
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Location / Resource</label>
          <input
            className="mt-1 w-full border rounded px-2 py-1"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Preferred Contact</label>
        <input
          className="mt-1 w-full border rounded px-2 py-1"
          value={preferredContact}
          onChange={(e) => setPreferredContact(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Attachments (up to 3 images)</label>
        <FileUpload
          maxFiles={3}
          accept={{ 'image/*': [] }}
          onFilesSelected={setFiles}
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Ticket'}
      </button>
    </form>
  );
}

export default TicketCreateForm;
