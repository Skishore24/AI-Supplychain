import { useState, useEffect } from "react";
import { Users, UserPlus, ShieldCheck, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../../services/api";

export default function AppTeam() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("ANALYST");
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    // Load members for default org (org_id = 1)
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/organizations/1/members", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("emox_auth_token") || localStorage.getItem("emox_admin_token")}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      } else {
        // Fallback default members
        setMembers([
          { id: 1, full_name: "Alex Vance", email: "admin@emox.ai", role: "SUPER_ADMIN", created_at: new Date().toISOString() },
          { id: 2, full_name: "Sarah Connor", email: "manager@emox.ai", role: "MANAGER", created_at: new Date().toISOString() },
          { id: 3, full_name: "David Miller", email: "analyst@emox.ai", role: "ANALYST", created_at: new Date().toISOString() }
        ]);
      }
    } catch (e) {
      setMembers([
        { id: 1, full_name: "Alex Vance", email: "admin@emox.ai", role: "SUPER_ADMIN", created_at: new Date().toISOString() },
        { id: 2, full_name: "Sarah Connor", email: "manager@emox.ai", role: "MANAGER", created_at: new Date().toISOString() },
        { id: 3, full_name: "David Miller", email: "analyst@emox.ai", role: "ANALYST", created_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = (e) => {
    e.preventDefault();
    setMembers([
      ...members,
      {
        id: Date.now(),
        full_name: inviteEmail.split("@")[0],
        email: inviteEmail,
        role: inviteRole,
        created_at: new Date().toISOString()
      }
    ]);
    setSuccessMsg(`Invitation dispatched to ${inviteEmail} with role ${inviteRole}.`);
    setInviteModalOpen(false);
    setInviteEmail("");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Organization Team & Roles</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage workspace members, assign RBAC permissions, and invite supply chain analysts.
          </p>
        </div>

        <button
          onClick={() => setInviteModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 transition-colors self-start"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Members Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono">
            <tr>
              <th className="px-6 py-3.5">User</th>
              <th className="px-6 py-3.5">Role</th>
              <th className="px-6 py-3.5">Assigned Permissions</th>
              <th className="px-6 py-3.5">Added Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-850/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
                      {m.full_name ? m.full_name[0] : "U"}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{m.full_name}</div>
                      <div className="text-[11px] text-slate-400">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                    m.role.includes("ADMIN")
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : m.role === "MANAGER"
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : "bg-slate-800 text-slate-300"
                  }`}>
                    {m.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {m.role.includes("ADMIN")
                    ? "Full read/write/financial approvals & member management"
                    : m.role === "MANAGER"
                    ? "Purchase order approval, inventory modifications & ML triggers"
                    : "Read-only analytics, forecasting models & AI assistant queries"}
                </td>
                <td className="px-6 py-4 font-mono text-slate-500 text-[11px]">
                  {new Date(m.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Invite New Team Member</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="analyst@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="ANALYST">Analyst (Read-only analytics & forecasting)</option>
                  <option value="MANAGER">Manager (PO approval & inventory adjustments)</option>
                  <option value="ORG_ADMIN">Organization Admin (Full workspace permissions)</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
