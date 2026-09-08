import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Shield,
  Store
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdmin, isAdminAuthenticated } = useAdminAuth();

  const [email, setEmail] = useState(() => localStorage.getItem("emox_saved_admin_email") || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem("emox_saved_admin_email"));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const destination = location.state?.from?.pathname || "/admin";

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [isAdminAuthenticated, destination, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem("emox_saved_admin_email", email.trim());
      } else {
        localStorage.removeItem("emox_saved_admin_email");
      }

      const res = await loginAdmin(email.trim(), password);
      if (res.success) {
        navigate(destination, { replace: true });
      } else {
        setErrorMsg(res.error || "Invalid credentials. Please verify your email and password.");
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-poppins relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[140px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-8 sm:p-9 shadow-2xl shadow-black/70">
          
          {/* Header & Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 mb-4 shadow-inner">
              <Shield size={24} className="text-amber-400" />
            </div>

            <h1 className="font-heading font-black text-2xl text-white tracking-tight flex items-center justify-center gap-1">
              <span>emox</span>
              <span className="text-amber-400">.</span>
              <span className="text-slate-400 font-light text-xl">admin</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 font-normal">
              Supply Chain Operations &amp; Intelligence Console
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 animate-slide-down">
              <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
              <button
                type="button"
                onClick={() => setErrorMsg("")}
                className="text-rose-400 hover:text-rose-200 text-xs font-bold transition"
              >
                &times;
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold text-xs">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@emox.ai"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/90 pl-10 pr-3.5 py-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-slate-300 font-semibold text-xs">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-slate-500 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/90 pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>Remember email</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-press w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent animate-spin rounded-full" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-medium transition"
            >
              <Store size={14} />
              <span>Switch to Customer Storefront</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
