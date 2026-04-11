import { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { addTicketComment, deleteTicketComment, updateTicketStatus } from '../../services/ticketApi';
import type { Ticket, TicketCommentResponse, TicketRole } from '../../services/ticketApi';

interface TicketDetailViewProps {
  ticket: Ticket;
  onClose: () => void;
  onUpdated: () => void;
  currentUserId: number;
  role: TicketRole;
}

function TicketDetailView({ ticket, onClose, onUpdated, currentUserId, role }: TicketDetailViewProps) {
  const [comment, setComment] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState(ticket.resolutionNotes || '');
  const [updating, setUpdating] = useState(false);
  const isTechnician = role === 'TECHNICIAN';

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await addTicketComment(ticket.id, { content: comment }, currentUserId);
      setComment('');
      onUpdated();
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  const handleDeleteComment = async (c: TicketCommentResponse) => {
    try {
      await deleteTicketComment(ticket.id, c.id, currentUserId, role);
      onUpdated();
    } catch (error) {
      console.error('Failed to delete comment', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      await axios.patch(`http://localhost:8080/api/maintenancetickets/${ticket.id}/status`, { status: newStatus });
      onUpdated();
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Ticket Details</h2>
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700">Close</button>
        </div>
        <div className="space-y-1 text-sm text-slate-700">
          <p><strong>Resource:</strong> {ticket.resourceId || ticket.title}</p>
          <p><strong>Description:</strong> {ticket.description}</p>
          <p><strong>Category:</strong> {ticket.category}</p>
          <p><strong>Priority:</strong> {ticket.priority}</p>
          <p><strong>Status:</strong> <span className="font-bold text-indigo-600">{ticket.status}</span></p>
          <p><strong>Location:</strong> {ticket.location}</p>
          <p><strong>Contact:</strong> {ticket.contactDetails || ticket.preferredContact}</p>
          <p><strong>Assigned Technician:</strong> {ticket.assignedTechnicianId || 'Unassigned'}</p>
        </div>

        <div className="mt-4">
          <h3 className="mb-1 font-semibold text-slate-800">Attachments</h3>
          {ticket.attachments && ticket.attachments.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {ticket.attachments.map((a) => {
                const rawPath = a.fileUrl || a.imagePath || '';
                const normalizedPath = rawPath.replace(/\\/g, '/');
                const fullUrl = normalizedPath.startsWith('http') 
                  ? normalizedPath 
                  : `http://localhost:8080/${normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath}`;
                
                return (
                  <img
                    key={a.id}
                    src={fullUrl}
                    alt="Ticket Attachment"
                    className="w-24 h-24 object-cover border rounded bg-slate-50"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://placehold.co/100x100/f8fafc/94a3b8?text=Error';
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No attachments</p>
          )}
        </div>

        <div className="mt-4">
          <h3 className="mb-1 font-semibold text-slate-800">Comments</h3>
          <div className="space-y-2 mb-2">
            {ticket.comments && ticket.comments.length > 0 ? (
              ticket.comments.map((c) => (
                <div key={c.id} className="border rounded p-2 text-sm flex justify-between">
                  <div>
                    <p>{c.content}</p>
                    <p className="text-xs text-gray-500">
                      By {c.userId ?? c.authorUserId} at {new Date(c.timestamp ?? c.createdAt ?? '').toLocaleString()}
                    </p>
                  </div>
                  <button
                    className="text-xs text-red-600"
                    onClick={() => handleDeleteComment(c)}
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No comments yet</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded px-2 py-1 text-sm"
              placeholder="Add a comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
              onClick={handleAddComment}
            >
              Post
            </button>
          </div>
        </div>

        <div className="mt-4 border-t pt-3">
          <h3 className="mb-2 font-semibold text-slate-800">Update Status</h3>
          <div className="flex items-center gap-3">
            <select
              className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={ticket.status}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            {updating && <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketDetailView;
