import { Link } from "react-router-dom";
import { Boxes, CheckCircle2, ArrowRight } from "lucide-react";

export default function VerifyEmail() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-2xl text-center">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">EMOX SaaS</span>
        </Link>

        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Account Verified</h2>
          <p className="text-xs text-slate-400">
            Your workspace email has been verified. You can now access your organization dashboard.
          </p>
          <div className="pt-4">
            <Link
              to="/app/dashboard"
              className="w-full py-3 rounded-xl text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center justify-center gap-2"
            >
              <span>Go to App Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
