import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, ArrowRight, Lock, Mail, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const destination = location.state?.from?.pathname || "/shop";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, destination, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!fullName.trim()) {
          setErrorMsg("Please enter your full name.");
          setLoading(false);
          return;
        }
        const res = await register({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          role: "customer"
        });
        if (res.success) {
          navigate(destination, { replace: true });
        } else {
          setErrorMsg(res.error || "Account registration failed. Please try again.");
        }
      } else {
        const res = await login(email.trim(), password);
        if (res.success) {
          navigate(destination, { replace: true });
        } else {
          setErrorMsg(res.error || "Invalid email or password.");
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/50 flex items-center justify-center px-4 py-12 relative overflow-hidden font-poppins">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Card */}
        <div className="rounded-3xl border border-white/80 bg-white/90 backdrop-blur-xl p-8 sm:p-9 shadow-xl shadow-slate-200/50">

          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2.5 text-2xl font-black text-slate-900 tracking-tight justify-center mb-6"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 transition-transform duration-300 group-hover:scale-105">
              <ShoppingBag size={20} />
            </span>
            <span>E<span className="text-blue-600">kart</span></span>
          </Link>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode("signin"); setErrorMsg(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === "signin"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setErrorMsg(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === "signup"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Create Account
            </button>
          </div>

          <h1 className="text-xl font-extrabold text-center text-slate-900">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-center text-xs text-slate-500">
            {mode === "signin"
              ? "Sign in to access your orders, wishlist, and fast checkout"
              : "Sign up for quick checkout and automated order tracking"}
          </p>

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 animate-slide-down">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
              <button
                type="button"
                onClick={() => setErrorMsg("")}
                className="text-rose-500 hover:text-rose-800 font-bold"
              >
                &times;
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
            {/* Full Name for Signup */}
            {mode === "signup" && (
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Full Name</label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Email Address</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Password</label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-press w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-200 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>{mode === "signup" ? "Creating account..." : "Signing in..."}</span>
                </span>
              ) : (
                <>
                  <span>{mode === "signup" ? "Create Account" : "Sign In"}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Bottom Links */}
          <div className="mt-7 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link to="/" className="hover:text-blue-600 transition font-medium">
              &larr; Back to Shop
            </Link>
            <Link to="/admin/login" className="text-slate-400 hover:text-slate-600 transition">
              Staff Portal
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;