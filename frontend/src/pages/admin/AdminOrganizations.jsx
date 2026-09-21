import { useState, useEffect } from "react";
import { Building2, Plus, Users, ShieldCheck, CheckCircle2 } from "lucide-react";
import AdminLayout from "./AdminLayout";

export default function AdminOrganizations() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: "", slug: "", plan: "starter" });

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/organizations", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("emox_auth_token") || localStorage.getItem("emox_admin_token")}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrgs(data);
      } else {
        setOrgs([
          { id: 1, name: "Global Supply Chain Corp", slug: "global-supply", plan: "enterprise", is_active: true, created_at: new Date().toISOString() },
          { id: 2, name: "Apex Advanced Manufacturing", slug: "apex-mfg", plan: "professional", is_active: true, created_at: new Date().toISOString() }
        ]);
      }
    } catch (e) {
      setOrgs([
        { id: 1, name: "Global Supply Chain Corp", slug: "global-supply", plan: "enterprise", is_active: true, created_at: new Date().toISOString() },
        { id: 2, name: "Apex Advanced Manufacturing", slug: "apex-mfg", plan: "professional", is_active: true, created_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("emox_auth_token") || localStorage.getItem("emox_admin_token")}`
        },
        body: JSON.stringify(newOrg)
      });
      if (res.ok) {
        const data = await res.json();
        setOrgs([...orgs, data]);
        setCreateModalOpen(false);
        setNewOrg({ name: "", slug: "", plan: "starter" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout title="Tenant Organizations" subtitle="Global multi-tenant workspace management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">
            Total active tenant organizations: <span className="text-cyan-400 font-mono font-bold">{orgs.length}</span>
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Organization</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgs.map((o) => (
            <div
              key={o.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  o.plan === "enterprise"
                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                }`}>
                  {o.plan}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{o.name}</h3>
                <div className="text-xs text-slate-500 font-mono">slug: {o.slug}</div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active Tenant
                </span>
                <span className="font-mono text-[11px] text-slate-500">ID: {o.id}</span>
              </div>
            </div>
          ))}
        </div>

        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Create Tenant Organization</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Organization Name</label>
                  <input
                    type="text"
                    required
                    value={newOrg.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                      setNewOrg({ ...newOrg, name, slug });
                    }}
                    placeholder="E.g. Nordic Components AS"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">URL Identifier (Slug)</label>
                  <input
                    type="text"
                    required
                    value={newOrg.slug}
                    onChange={(e) => setNewOrg({ ...newOrg, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subscription Plan</label>
                  <select
                    value={newOrg.plan}
                    onChange={(e) => setNewOrg({ ...newOrg, plan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="starter">Starter Plan (2,500 SKUs)</option>
                    <option value="professional">Professional Plan (25,000 SKUs)</option>
                    <option value="enterprise">Enterprise Tier (Unlimited)</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                  >
                    Create Organization
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
