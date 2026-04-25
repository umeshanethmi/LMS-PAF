// src/components/Notifications/NotificationBell.jsx
// Navbar bell icon with unread badge and dropdown panel toggle.

import React, { useState, useRef, useEffect, useCallback } from "react";
import useNotifications from "../../hooks/useNotifications";
import NotificationList from "./NotificationList";
import "./NotificationBell.css";

/**
 * NotificationBell
 *
 * Drop this component inside your Navbar. It:
 *  - Shows a bell icon with an animated unread badge
 *  - Toggles a NotificationList dropdown panel on click
 *  - Closes the panel when the user clicks outside
 *  - Polls the backend every 30s for new notifications
 *
 * Usage:
 *   <NotificationBell />
 *
 * No props required – state is managed internally via useNotifications().
 */
const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    deleteNotif,
  } = useNotifications();

  // ── Toggle panel ──────────────────────────────────────────────────────────
  const togglePanel = useCallback(() => setIsOpen((prev) => !prev), []);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // ── Close on Escape key ───────────────────────────────────────────────────
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="notif-dropdown-wrapper" ref={wrapperRef}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        className={`notif-bell-btn ${unreadCount > 0 ? "has-unread" : ""}`}
        onClick={togglePanel}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notifications`
            : "No new notifications"
        }
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {/* Bell SVG icon */}
        <svg
          className="bell-icon"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="notif-badge" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <NotificationList
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          error={error}
          onMarkRead={markAsRead}
          onDelete={deleteNotif}
        />
      )}
    </div>
  );
};

export default NotificationBell;
