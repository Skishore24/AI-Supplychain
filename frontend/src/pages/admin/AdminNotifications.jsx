import React, { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  CheckCheck,
  Filter,
  Trash2
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.notifications.list(100);
      setNotifications(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      console.error("Notifications load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered = notifications.filter((n) => {
    if (filterType === "unread") return !n.is_read;
    if (filterType === "alert") return n.type === "alert" || n.type === "warning";
    return true;
  });

  return (
    <AdminLayout
      title="Notification Dispatch Center"
      subtitle="Real-time alerts for procurement orders, low stock thresholds, and system events."
      onRefresh={loadNotifications}
      refreshing={loading}
    >
      {/* Control bar */}
      <div className="flex items-center justify-between gap-4 mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Filter:</span>
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-lg transition ${
                filterType === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType("unread")}
              className={`px-3 py-1 rounded-lg transition ${
                filterType === "unread" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="btn-press flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition"
          >
            <CheckCheck size={14} className="text-emerald-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mr-2" />
            Loading notification feed...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            <Bell size={36} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-600">No Notifications</h3>
            <p className="text-xs text-slate-400 mt-1">You are all caught up.</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl border p-4 transition-all flex items-start justify-between gap-4 ${
                n.is_read
                  ? "border-slate-200 bg-white"
                  : "border-amber-300 bg-amber-50/40 shadow-xs"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    n.type === "alert" || n.type === "critical"
                      ? "bg-rose-100 text-rose-600"
                      : n.type === "warning"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <Bell size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-black text-slate-900 text-xs">{n.title}</h4>
                    {!n.is_read && (
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <span className="mt-1.5 inline-block text-[10px] font-mono text-slate-400">
                    {n.created_at ? new Date(n.created_at).toLocaleString() : "Recently"}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  title="Mark as Read"
                >
                  <CheckCircle2 size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
