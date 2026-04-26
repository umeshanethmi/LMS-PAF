// src/components/Notifications/NotificationList.jsx
// Dropdown panel that renders the list of notifications.

import React from "react";
import "./NotificationList.css";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format a notification's createdAt timestamp into a human-readable relative
 * time string (e.g. "2 min ago", "3 hours ago", "Yesterday").
 */
function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const now  = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000); // seconds

  if (diff < 60)         return "Just now";
  if (diff < 3600)       return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 172800)     return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TYPE_META = {
  BOOKING: { icon: "📅", label: "Booking", className: "booking" },
  TICKET:  { icon: "🔧", label: "Ticket",  className: "ticket"  },
};

// ── NotificationItem ──────────────────────────────────────────────────────────

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
  const { id, message, type, isRead, createdAt } = notification;
  const meta = TYPE_META[type] || { icon: "🔔", label: type, className: "booking" };

  return (
    <div
      className={`notif-item ${!isRead ? "unread" : ""}`}
      role="listitem"
      aria-label={`${isRead ? "Read" : "Unread"} notification: ${message}`}
    >
      {/* Type icon */}
      <div className={`notif-type-icon ${meta.className}`} aria-hidden="true">
        {meta.icon}
      </div>

      {/* Body */}
      <div className="notif-item-body">
        <p className="notif-item-message">{message}</p>
        <div className="notif-item-meta">
          <span className="notif-item-time">{formatRelativeTime(createdAt)}</span>
          <span className={`notif-type-tag ${meta.className}`}>{meta.label}</span>
        </div>
      </div>

      {/* Action buttons (appear on hover) */}
      <div className="notif-item-actions">
        {!isRead && (
          <button
            id={`notif-read-${id}`}
            className="notif-action-btn"
            title="Mark as read"
            aria-label="Mark as read"
            onClick={() => onMarkRead(id)}
          >
            ✓
          </button>
        )}
        <button
          id={`notif-delete-${id}`}
          className="notif-action-btn delete"
          title="Delete notification"
          aria-label="Delete notification"
          onClick={() => onDelete(id)}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// ── NotificationList ──────────────────────────────────────────────────────────

/**
 * NotificationList
 *
 * Props:
 *  notifications  – array of Notification objects
 *  unreadCount    – integer used in the panel header badge
 *  loading        – boolean
 *  error          – string or null
 *  onMarkRead     – fn(id)
 *  onDelete       – fn(id)
 */
const NotificationList = ({
  notifications,
  unreadCount,
  loading,
  error,
  onMarkRead,
  onDelete,
}) => {
  return (
    <div
      className="notif-panel"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {/* Header */}
      <div className="notif-panel-header">
        <span className="notif-panel-title">Notifications</span>
        {unreadCount > 0 && (
          <span className="notif-panel-count" aria-label={`${unreadCount} unread`}>
            {unreadCount} new
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <p className="notif-state-msg" aria-busy="true">Loading…</p>
      ) : error ? (
        <p className="notif-error-msg" role="alert">{error}</p>
      ) : notifications.length === 0 ? (
        <div className="notif-empty" role="status">
          <span className="notif-empty-icon">🔔</span>
          <span className="notif-empty-text">You're all caught up!</span>
        </div>
      ) : (
        <div className="notif-list" role="list">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={onMarkRead}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;
