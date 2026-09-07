import React, { useEffect, useState } from "react";
import {
  History,
  Search,
  ShieldCheck,
  Calendar,
  User,
  Activity,
  Layers,
  CheckCircle2,
  Filter,
  Eye,
  X
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.auditLogs.list({ limit: 100 });
      setLogs(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      console.error("Audit logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.action || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entity_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user_email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "all" || (log.action || "").toLowerCase() === actionFilter.toLowerCase();
    return matchesSearch && matchesAction;
  });

  return (
    <AdminLayout
      title="Enterprise Audit Trail"
      subtitle="Immutable compliance event record tracking all database updates, stock adjustments, role changes, and AI actions."
      onRefresh={loadLogs}
      refreshing={loading}
    >
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by action, entity, or actor email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="stock_adjust">Stock Adjust</option>
            <option value="order_checkout">Order Checkout</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Logged Events: <strong className="text-slate-800">{logs.length}</strong>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Record ID</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mr-2" />
                    Loading audit stream...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {log.timestamp || log.created_at
                        ? new Date(log.timestamp || log.created_at).toLocaleString()
                        : "Just now"}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{log.user_email || "system_worker"}</div>
                      <div className="text-[10px] text-slate-400">Actor #{log.user_id || "SYS"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700 border border-slate-200 uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{log.entity_name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">#{log.entity_id || "N/A"}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        title="View Payload"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-black text-slate-900 font-heading">Audit Event Payload</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs mb-4">
              <div>
                <span className="text-slate-400 block">Action:</span>
                <span className="font-bold text-slate-900">{selectedLog.action} on {selectedLog.entity_name} (#{selectedLog.entity_id})</span>
              </div>
              <div>
                <span className="text-slate-400 block">Actor:</span>
                <span className="font-bold text-slate-900">{selectedLog.user_email || "System"} (ID: {selectedLog.user_id || "SYS"})</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Payload / State Changes:</span>
                <pre className="p-3 rounded-xl bg-slate-900 text-amber-400 font-mono text-[11px] overflow-x-auto max-h-48">
                  {JSON.stringify(selectedLog.details || selectedLog.payload || selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
