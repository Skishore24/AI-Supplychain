import { Link } from "react-router-dom";
import { Cpu, ShieldCheck, Zap, Activity } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white tracking-tight">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30">
                <Cpu size={20} />
              </span>
              <span>Supply<span className="text-blue-500">AI</span></span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              Next-generation autonomous supply chain intelligence system. Seamlessly combining multi-agent decision models, real-time demand forecasting, and smart inventory optimization.
            </p>
            <div className="mt-6 flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 font-medium text-emerald-400 border border-emerald-500/20">
                <Activity size={12} className="animate-pulse" /> Multi-Agent AI Active
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 font-medium text-blue-400 border border-blue-500/20">
                <Zap size={12} /> Real-time Sync
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Marketplace</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/" className="transition hover:text-blue-400">Home</Link>
              </li>
              <li>
                <Link to="/shop" className="transition hover:text-blue-400">Browse Catalog</Link>
              </li>
              <li>
                <Link to="/cart" className="transition hover:text-blue-400">Shopping Cart</Link>
              </li>
              <li>
                <Link to="/orders" className="transition hover:text-blue-400">Track Orders</Link>
              </li>
            </ul>
          </div>

          {/* Admin & AI Hub */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Supply Chain Hub</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/admin" className="transition hover:text-indigo-400">Admin Dashboard</Link>
              </li>
              <li>
                <Link to="/admin/products" className="transition hover:text-indigo-400">Product Manager</Link>
              </li>
              <li>
                <Link to="/admin/suppliers" className="transition hover:text-indigo-400">Supplier AI Optimizer</Link>
              </li>
              <li>
                <Link to="/admin/inventory" className="transition hover:text-indigo-400">Stock & Reorder Alerts</Link>
              </li>
              <li>
                <Link to="/admin/ai-agents" className="transition hover:text-indigo-400">AI Agents Sandbox</Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-800/80 pt-8 sm:flex-row text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SupplyAI Intelligence Platform. All rights reserved.</p>
          <div className="mt-4 flex items-center gap-6 sm:mt-0">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck size={14} className="text-blue-400" /> Enterprise-Grade AI Safety
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
