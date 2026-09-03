import { Link } from "react-router-dom";
import { ShieldCheck, ShoppingBag, LayoutDashboard, Key } from "lucide-react";
import Navbar from "../../components/user/Navbar";

import Footer from "../../components/user/Footer";
import { useCart } from "../../context/CartContext";

function Profile() {
  const { orders } = useCart();


  const user = {
    name: "Alex Johnson",
    email: "alex.johnson@enterprise-ai.io",
    role: "Supply Chain Manager & Verified Buyer",
    joinedDate: "March 2026",
    company: "Apex Automation Robotics Ltd"
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-extrabold text-white mb-8">My Account & Organization</h1>

        <div className="grid gap-8 md:grid-cols-3">
          {/* User Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-center backdrop-blur-md shadow-xl">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 text-4xl mb-4 font-bold">
              AJ
            </div>
            <h2 className="text-lg font-bold text-white">{user.name}</h2>
            <p className="text-xs text-blue-400 font-medium">{user.role}</p>
            <p className="mt-1 text-xs text-slate-400">{user.email}</p>

            <div className="mt-6 pt-6 border-t border-slate-800 text-left space-y-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block">Organization:</span>
                <span className="font-semibold text-white">{user.company}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Member Since:</span>
                <span className="font-semibold text-white">{user.joinedDate}</span>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <Link
                to="/admin"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20"
              >
                <LayoutDashboard size={14} /> Switch to Admin Hub
              </Link>
            </div>
          </div>

          {/* Activity Overview */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl">
              <h3 className="text-base font-bold text-white mb-4">Account Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                  <span className="text-xs text-slate-400">Total Orders Placed</span>
                  <div className="text-2xl font-bold text-white mt-1">{orders.length}</div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                  <span className="text-xs text-slate-400">Security Clearance</span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5 text-lg">
                    <ShieldCheck size={18} /> Tier 1 Verified
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl">
              <h3 className="text-base font-bold text-white mb-4">Quick Navigation</h3>
              <div className="space-y-3">
                <Link
                  to="/orders"
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-slate-700 hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={18} className="text-blue-400" />
                    <div>
                      <div className="text-sm font-semibold text-white">My Orders</div>
                      <div className="text-xs text-slate-400">Track and review previous orders</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-400">View</span>
                </Link>

                <Link
                  to="/admin/suppliers"
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-slate-700 hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <Key size={18} className="text-indigo-400" />
                    <div>
                      <div className="text-sm font-semibold text-white">AI Supplier Scoring</div>
                      <div className="text-xs text-slate-400">Run multi-criteria supplier optimization</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-indigo-400">Inspect</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Profile;