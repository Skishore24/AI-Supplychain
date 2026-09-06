import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight, Lock, Eye, EyeOff, Sparkles } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("customer@ekart.io");
  const [password, setPassword] = useState("••••••••");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/shop");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl animate-pulse-slow" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl animate-pulse-slow" style={{ animationDelay: "1.5s" }} />

      <div className="w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="rounded-3xl border border-white/80 bg-white/80 backdrop-blur-xl p-8 shadow-[0_24px_64px_rgba(0,0,0,0.1)]">

          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2.5 text-2xl font-black text-slate-900 tracking-tight justify-center mb-6"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <ShoppingBag size={22} />
            </span>
            <span>E<span className="text-blue-600">kart</span></span>
          </Link>

          <h1 className="text-2xl font-extrabold text-center text-slate-900">Welcome back</h1>
          <p className="mt-1 text-center text-xs text-slate-500">
            Sign in to access your orders, wishlist & fast checkout
          </p>

          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-smooth w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-smooth w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-press w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all duration-200 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 border-t border-slate-100 pt-4">
            <Lock size={12} className="text-emerald-600" />
            <span>256-Bit Encrypted Secure Authentication</span>
          </div>

          <div className="mt-4 text-center text-xs text-slate-500">
            <Link to="/" className="text-blue-600 font-semibold hover:underline">
              ← Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;