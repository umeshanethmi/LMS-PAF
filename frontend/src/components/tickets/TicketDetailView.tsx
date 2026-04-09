import { useState } from 'react';
import { Ticket, TicketCommentResponse, addTicketComment, deleteTicketComment, updateTicketStatus } from '../../services/ticketApi';

interface TicketDetailViewProps {
  ticket: Ticket;
  onClose: () => void;
  onUpdated: () => void;
  currentUserId: number;
}

function TicketDetailView({ ticket, onClose, onUpdated, currentUserId }: TicketDetailViewProps) {
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);

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
      await deleteTicketComment(ticket.id, c.id, currentUserId, true);
      onUpdated();
    } catch (error) {
      console.error('Failed to delete comment', error);
    }
  };

  const handleStatusChange = async (newStatus: Ticket['status']) => {
    setUpdating(true);
    try {
      await updateTicketStatus(ticket.id, { newStatus }, currentUserId, true);
      onUpdated();
    } catch (error) {
      console.error('Failed to update status', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg max-w-2xl w-full p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Ticket Details</h2>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>
        <div className="space-y-1 text-sm">
          <p><strong>Title:</strong> {ticket.title}</p>
          <p><strong>Description:</strong> {ticket.description}</p>
          <p><strong>Category:</strong> {ticket.category}</p>
          <p><strong>Priority:</strong> {ticket.priority}</p>
          <p><strong>Status:</strong> {ticket.status}</p>
          <p><strong>Location:</strong> {ticket.location}</p>
          <p><strong>Preferred Contact:</strong> {ticket.preferredContact}</p>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-1">Attachments</h3>
          {ticket.attachments && ticket.attachments.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {ticket.attachments.map((a) => (
                <img
                  key={a.id}
                  src={`http://localhost:8080/files/${a.fileUrl}`}
                  alt={a.fileName}
                  className="w-24 h-24 object-cover border rounded"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No attachments</p>
          )}
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-1">Comments</h3>
          <div className="space-y-2 mb-2">
            {ticket.comments && ticket.comments.length > 0 ? (
              ticket.comments.map((c) => (
                <div key={c.id} className="border rounded p-2 text-sm flex justify-between">
                  <div>
                    <p>{c.content}</p>
                    <p className="text-xs text-gray-500">By {c.authorUserId} at {new Date(c.createdAt).toLocaleString()}</p>
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
          <h3 className="font-semibold mb-1">Status Actions (Technician/Admin)</h3>
          <div className="flex gap-2 flex-wrap">
            {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map((s) => (
              <button
                key={s}
                className="px-3 py-1 border rounded text-sm"
                disabled={updating}
                onClick={() => handleStatusChange(s as Ticket['status'])}
              >
                Set {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketDetailView;
