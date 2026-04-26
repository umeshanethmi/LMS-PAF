// src/hooks/useNotifications.js
// Custom hook – manages notification state, polling, and API interactions.

import { useState, useEffect, useCallback, useRef } from "react";
import notificationService from "../services/notificationService";

const POLL_INTERVAL_MS = 30_000; // Poll every 30 seconds

/**
 * useNotifications
 *
 * Returns:
 *  notifications  – array of Notification objects (newest first)
 *  unreadCount    – integer count of unread notifications (for the badge)
 *  loading        – boolean, true while the initial fetch is in progress
 *  error          – error message string or null
 *  markAsRead     – fn(id) marks a notification read and updates local state
 *  deleteNotif    – fn(id) deletes a notification and updates local state
 *  refresh        – fn() manually re-fetches notifications
 */
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const intervalRef                       = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const { data, unreadCount: count } = await notificationService.getAll();
      setNotifications(data);
      setUnreadCount(count);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [fetchNotifications]);

  // ── Mark As Read ──────────────────────────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    // Optimistic UI update – flip locally before the API call
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      // Rollback on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
      setError("Could not mark notification as read.");
    }
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteNotif = useCallback(async (id) => {
    const removed = notifications.find((n) => n.id === id);

    // Optimistic removal
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (removed && !removed.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await notificationService.delete(id);
    } catch (err) {
      // Rollback
      setNotifications((prev) => [removed, ...prev].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ));
      if (removed && !removed.isRead) setUnreadCount((prev) => prev + 1);
      setError("Could not delete notification.");
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    deleteNotif,
    refresh: fetchNotifications,
  };
};

export default useNotifications;
