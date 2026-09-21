import { Link } from "react-router-dom";
import {
  TrendingUp,
  Cpu,
  Boxes,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Bot,
  Layers,
  FileSearch,
  Lock,
  Zap,
  Globe2,
  ChevronRight
} from "lucide-react";
import SEOHead from "../../components/common/SEOHead";

export default function LandingPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "EMOX AI-Supplychain SaaS",
    "headline": "Autonomous AI Intelligence for Resilient Global Supply Chains",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "Enterprise-grade local-AI platform for demand forecasting, inventory optimization, supplier intelligence, and autonomous supply chain risk management."
  };

  const kpis = [
    { label: "Forecast Accuracy", value: "98.4%", change: "+14.2% vs baseline" },
    { label: "Stockout Reduction", value: "42%", change: "Measured across 12,000 SKUs" },
    { label: "Working Capital Freed", value: "18.5%", change: "Optimal safety stock sizing" },
    { label: "Local AI Latency", value: "< 240ms", change: "Private local inference" },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: "Predictive Demand Forecasting",
      description: "Chronological Ridge machine learning with moving averages and seasonality to predict SKU velocity up to 90 days in advance.",
      link: "/forecasting"
    },
    {
      icon: Boxes,
      title: "Dynamic Inventory Optimization",
      description: "Automated Reorder Point (ROP = d × L + SS), safety stock buffer calculations, and stockout run-rate alerts.",
      link: "/inventory"
    },
    {
      icon: Cpu,
      title: "Deterministic Supplier Optimizer",
      description: "Multi-factor vendor scoring combining quote price (40%), quality reliability (30%), delivery lead-time (20%), and consistency (10%).",
      link: "/supplier-intelligence"
    },
    {
      icon: ShieldAlert,
      title: "Supply Chain Risk Radar",
      description: "Continuous vulnerability tracking for single-source dependencies, geopolitical delays, and material shortages.",
      link: "/risk-management"
    },
    {
      icon: FileSearch,
      title: "Enterprise Hybrid RAG",
      description: "Dense vector cosine similarity and BM25 keyword retrieval over uploaded contracts, SOPs, and vendor agreements with exact citations.",
      link: "/documentation"
    },
    {
      icon: Bot,
      title: "Human-in-the-Loop Procurement",
      description: "AI generates data-grounded restock recommendations, with financial authorization required before purchase orders are issued.",
      link: "/procurement"
    }
  ];

  const agents = [
    { name: "Demand Agent", role: "Time-series forecasting, trend slopes & seasonality models", status: "Active" },
    { name: "Inventory Agent", role: "Safety stock calculation, ROP thresholds & stockout alerts", status: "Active" },
    { name: "Supplier Agent", role: "Multi-factor vendor rankings & dual-sourcing recommendations", status: "Active" },
    { name: "Risk Agent", role: "Lead-time variance detection & single-source dependency audits", status: "Active" },
    { name: "Procurement Agent", role: "Purchase order formulation with financial impact analysis", status: "Active" }
  ];

  return (
    <div className="space-y-24 pb-20">
      <SEOHead
        title="AI Supply Chain Management Platform | EMOX"
        description="Enterprise AI platform for demand forecasting, inventory optimization, supplier intelligence, and autonomous supply chain risk management."
        canonical="https://emox.ai/"
        schema={schema}
      />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/40 via-slate-950 to-slate-950" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide uppercase animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Supply Chain Intelligence 3.0</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-tight sm:leading-none">
            Real AI for Resilient Global{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
              Supply Chains
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Eliminate stockouts, optimize purchase orders, forecast demand with Scikit-learn ML, and automate supplier selection using 100% private local Ollama LLMs and pgvector hybrid RAG.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/app/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Launch Enterprise Workspace</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/features"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Platform Features</span>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> 100% Private Local Inference</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Multi-Tenant SaaS Isolation</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Human-in-the-Loop Procurement</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Deterministic Business Grounding</span>
          </div>
        </div>
      </section>

      {/* Real-time KPI Metric Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-colors"
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-200">
                {kpi.value}
              </div>
              <div className="text-sm font-semibold text-slate-200 mt-1">{kpi.label}</div>
              <div className="text-xs text-cyan-400/90 mt-2 font-mono">{kpi.change}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Platform Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Comprehensive Supply Chain Intelligence Suite
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Built for enterprise procurement officers, inventory managers, and supply chain directors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/70 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
                </div>
                <div className="pt-6">
                  <Link
                    to={f.link}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Learn more</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Multi-Agent Architecture Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                Coordinated Intelligence
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Autonomous Multi-Agent Orchestration Layer
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl">
                Five specialized AI agents collaborate to evaluate inventory health, model future demand, compare vendor quotes, assess delivery risks, and draft purchase orders.
              </p>
            </div>
            <Link
              to="/ai-agents"
              className="px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/20 transition-colors whitespace-nowrap"
            >
              View Agent Specs
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-200">{agent.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {agent.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{agent.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-600 p-10 sm:p-14 text-center text-white space-y-6 shadow-2xl shadow-cyan-600/20">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Transform Your Supply Chain Operations?
          </h2>
          <p className="text-cyan-100 max-w-2xl mx-auto text-base sm:text-lg">
            Get started with our enterprise SaaS workspace today. Free tier available with full multi-agent simulation and demand forecasting.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/app/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-white text-slate-950 hover:bg-slate-100 shadow-lg transition-all"
            >
              Start Free Workspace
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-cyan-700/60 hover:bg-cyan-700 text-white border border-cyan-400/30 transition-all"
            >
              Schedule Enterprise Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
