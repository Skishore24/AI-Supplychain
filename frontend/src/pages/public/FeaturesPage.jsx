import { Link } from "react-router-dom";
import {
  TrendingUp,
  Boxes,
  Cpu,
  ShieldAlert,
  FileSearch,
  Bot,
  CheckCircle2,
  Zap,
  ArrowRight,
  Database,
  BarChart,
  GitBranch
} from "lucide-react";
import SEOHead from "../../components/common/SEOHead";

export default function FeaturesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Features - AI Supply Chain Platform",
    "description": "Explore comprehensive AI supply chain features: ML demand forecasting, dynamic ROP calculations, supplier optimization scorecards, and pgvector RAG."
  };

  const modules = [
    {
      id: "forecasting",
      title: "Predictive Demand Forecasting",
      subtitle: "Machine Learning Velocity Engine",
      formula: "Ridge(X_{7d, 30d, dow, trend}) \\rightarrow \\hat{y}_{t+h}",
      description: "Our time-series machine learning model continuously evaluates sales velocity, historical transactions, day-of-week seasonality, and trend slopes with 70/15/15 chronological validation splits.",
      bullets: [
        "Dynamic 7, 30, and 90-day forecast horizons",
        "MAE, RMSE, and MAPE model evaluation metrics",
        "Confidence interval bands (lower / upper bounds)",
        "Zero LLM hallucination: Pure Scikit-learn regression"
      ],
      icon: TrendingUp,
      badge: "Machine Learning"
    },
    {
      id: "inventory",
      title: "Dynamic Inventory Optimization",
      subtitle: "Deterministic Reorder Buffer",
      formula: "ROP = (d \\times L) + SS, \\quad SS = Z \\times \\sigma_d \\times \\sqrt{L}",
      description: "Calculate exact stockout risk, days of coverage, and replenishment triggers based on dynamic lead times and demand variability.",
      bullets: [
        "Real-time safety stock and ROP evaluation",
        "Stockout velocity warnings with days-to-depletion",
        "Excess inventory and holding cost minimization",
        "Multi-warehouse physical stock tracking"
      ],
      icon: Boxes,
      badge: "Deterministic Formulas"
    },
    {
      id: "suppliers",
      title: "Supplier Intelligence & Scorecards",
      subtitle: "Explainable Multi-Factor Ranking",
      formula: "Score = (Price \\times 0.40) + (Quality \\times 0.30) + (Delivery \\times 0.20) + (Reliability \\times 0.10)",
      description: "Evaluate supplier proposals and historical purchase order fulfillments across price competitiveness, return rates, on-time delivery rates, and reliability.",
      bullets: [
        "Automated vendor trade-off matrix",
        "Dual-sourcing recommendations to mitigate bottlenecks",
        "Ollama natural language scorecard rationales",
        "Full historical fulfillment auditing"
      ],
      icon: Cpu,
      badge: "Supplier Analytics"
    },
    {
      id: "procurement",
      title: "Human-in-the-Loop Procurement",
      subtitle: "Financial Authorization Safeguards",
      formula: "Restock\\_Qty = (ROP \\times 2) - CurrentStock - ReservedStock",
      description: "AI autonomously analyzes replenishment needs and prepares actionable purchase orders, but will never execute financial commitments without explicit Manager or Admin authorization.",
      bullets: [
        "Automated PO drafting with optimal batch sizes",
        "Role-based authorization checks (Admin/Manager)",
        "Line-item cost projection and cash flow analysis",
        "Complete immutable audit logging"
      ],
      icon: Bot,
      badge: "Procurement Guardrails"
    },
    {
      id: "rag",
      title: "Enterprise Knowledge Base & Hybrid RAG",
      subtitle: "Document Intelligence with Citations",
      formula: "Score_{hybrid} = 0.7 \\cdot \\cos(\\vec{v}_{q}, \\vec{v}_{doc}) + 0.3 \\cdot BM25(q, doc)",
      description: "Ingest supplier contracts, compliance certifications, shipping policies, and SOPs in PDF, DOCX, or TXT formats with semantic chunking and verifiable citations.",
      bullets: [
        "Multi-format document parsing and chunking",
        "Hybrid vector cosine similarity + BM25 keyword search",
        "Cross-encoder top-k reranking",
        "Zero hallucination: Strict citation grounding"
      ],
      icon: FileSearch,
      badge: "pgvector / Local RAG"
    },
    {
      id: "risk",
      title: "Autonomous Risk Radar",
      subtitle: "Single-Point-of-Failure Detection",
      formula: "Risk = f(RunRate, LeadVariance, SupplierConcentration)",
      description: "Cross-correlate inventory depletion curves with vendor delivery variances to flag supply chain disruptions before stockouts occur.",
      bullets: [
        "Single-source supplier dependency warnings",
        "Critical stockout risk heatmaps",
        "Automated contingency mitigation recommendations",
        "In-app push notifications for supply chain teams"
      ],
      icon: ShieldAlert,
      badge: "Risk Assessment"
    }
  ];

  return (
    <div className="space-y-20 py-16">
      <SEOHead
        title="Enterprise AI Features & Architecture | EMOX"
        description="Deep dive into our AI supply chain capabilities: ML demand forecasting, dynamic ROP calculations, supplier optimization scorecards, and pgvector RAG."
        canonical="https://emox.ai/features"
        schema={schema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
          Platform Architecture & Capabilities
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Engineered for Enterprise Supply Chain Precision
        </h1>
        <p className="text-lg text-slate-300 max-w-3xl mx-auto">
          Every AI insight is grounded in real database numbers, deterministic calculations, and Scikit-learn machine learning. No hallucinations.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {modules.map((mod, idx) => {
          const Icon = mod.icon;
          const isEven = idx % 2 === 0;
          return (
            <div
              key={mod.id}
              className={`p-8 sm:p-12 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col lg:flex-row items-center gap-10 ${
                isEven ? "" : "lg:flex-row-reverse"
              }`}
            >
              <div className="flex-1 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
                    {mod.badge}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{mod.title}</h2>
                <div className="text-sm font-mono text-cyan-300/80 bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800 inline-block">
                  {mod.formula}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{mod.description}</p>
                <ul className="space-y-2 pt-2">
                  {mod.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full lg:w-96 rounded-2xl bg-slate-950/80 border border-slate-800 p-6 space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Telemetry & Grounding
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-500">Execution Mode</span>
                    <span className="text-emerald-400 font-mono">Deterministic + Local LLM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-500">Data Isolation</span>
                    <span className="text-cyan-400 font-mono">Tenant Scoped (org_id)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-500">Fallback Resilience</span>
                    <span className="text-slate-300 font-mono">100% Offline Capable</span>
                  </div>
                </div>
                <Link
                  to="/app/dashboard"
                  className="w-full py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Test in Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
