import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cpu, ArrowRight } from "lucide-react";


function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user"); // "user" or "admin"
  const [email, setEmail] = useState("admin@supplyai.io");
  const [password, setPassword] = useState("••••••••");

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/shop");
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center px-6 py-12">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5 text-xl font-bold text-white tracking-tight justify-center mb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Cpu size={20} />
          </span>
          <span>
            Supply<span className="text-blue-500">AI</span>
          </span>
        </Link>

        <h1 className="text-2xl font-bold text-center text-white">System Authentication</h1>
        <p className="mt-1 text-center text-xs text-slate-400">
          Sign in to access Multi-Agent Supply Chain Intelligence
        </p>

        {/* Role toggle */}
        <div className="mt-6 grid grid-cols-2 rounded-xl border border-slate-800 bg-slate-950 p-1">
          <button
            type="button"
            onClick={() => {
              setRole("user");
              setEmail("customer@enterprise.io");
            }}
            className={`rounded-lg py-2 text-xs font-semibold transition ${
              role === "user"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Customer Store
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("admin");
              setEmail("admin@supplyai.io");
            }}
            className={`rounded-lg py-2 text-xs font-semibold transition ${
              role === "admin"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Admin / Supply Hub
          </button>
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Access Token / Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition ${
              role === "admin"
                ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
                : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"
            }`}
          >
            <span>Sign In as {role === "admin" ? "Supply Administrator" : "Verified Customer"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          <Link to="/" className="hover:text-blue-400 transition">
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;