import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Fingerprint
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdmin, isAdminAuthenticated } = useAdminAuth();

  const [email, setEmail] = useState("admin@emox.ai");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const destination = location.state?.from?.pathname || "/admin";

  // If already logged in, redirect immediately to admin dashboard
  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [isAdminAuthenticated, destination, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    // Simulate cryptographic verification delay
    setTimeout(async () => {
      const res = await loginAdmin(email, password);
      setLoading(false);
      if (res.success) {
        navigate(destination, { replace: true });
      } else {
        setErrorMsg(res.error || "Authentication failed.");
      }
    }, 600);
  };

  const handleUseDemo = () => {
    setEmail("admin@emox.ai");
    setPassword("admin123");
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center p-4 font-poppins relative overflow-hidden">
      {/* Background Decorative Tech Elements */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 backdrop-blur-2xl p-7 sm:p-8 shadow-2xl shadow-black/80">
          
          {/* Top Brand & Security Badges */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-slate-950 to-slate-900 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10 mb-3.5">
              <ShieldCheck size={30} className="text-amber-400" />
            </div>

            <div className="flex items-center justify-center gap-1.5 font-heading font-black text-2xl text-white tracking-tight">
              <span>emox</span>
              <span className="text-amber-400">.</span>
              <span className="text-slate-400 font-light text-xl">admin</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Enterprise Supply Chain Security Gateway
            </p>

            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                256-Bit SSL Active
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 border border-slate-700 px-2.5 py-0.5 text-[10px] font-mono text-slate-300">
                <Cpu size={10} className="text-amber-400" />
                RBAC Level-3
              </span>
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-400 animate-shake">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Admin Email */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">
                Administrator Identifier / Email
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@emox.ai"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Admin Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-slate-300 font-bold">
                  Security Passkey
                </label>
                <button
                  type="button"
                  onClick={handleUseDemo}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold hover:underline"
                >
                  Fill Default Credentials
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Quick Helper Credentials Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-[11px] text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono">
                <KeyRound size={12} className="text-amber-400 shrink-0" />
                <span>admin@emox.ai &middot; admin123</span>
              </div>
              <button
                type="button"
                onClick={handleUseDemo}
                className="text-[10px] font-bold text-amber-400 hover:underline shrink-0"
              >
                Auto-fill
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-press w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent animate-spin rounded-full" />
                  <span>Verifying Cryptographic Credentials...</span>
                </>
              ) : (
                <>
                  <Fingerprint size={16} />
                  <span>Authenticate &amp; Unlock Admin Console</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Strict Isolation Protocol: Access restricted exclusively to verified supply chain personnel. All session events logged and audited.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
