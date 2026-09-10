import { Link } from "react-router-dom";
import { Cpu, Car, ShoppingBag, Factory, ArrowRight, CheckCircle2 } from "lucide-react";
import SEOHead from "../../components/common/SEOHead";

export default function SolutionsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Industry Solutions - EMOX AI Supply Chain",
    "description": "Tailored supply chain intelligence solutions for Electronics, Automotive, Retail & CPG, and Industrial Manufacturing."
  };

  const industries = [
    {
      title: "Electronics & Semiconductors",
      icon: Cpu,
      desc: "Manage high-mix component procurement, silicon allocation lead times, and multi-tier supplier quality certifications.",
      metrics: "38% faster shortage mitigation",
      benefits: [
        "Component obsolescence and lifecycle tracking",
        "Dual-sourcing price and delivery arbitrage",
        "Technical datasheet & compliance document RAG"
      ]
    },
    {
      title: "Automotive & Heavy Machinery",
      icon: Car,
      desc: "Just-in-Time (JIT) replenishment synchronization with Tier-1 and Tier-2 suppliers to prevent production line stoppages.",
      metrics: "99.8% assembly line uptime",
      benefits: [
        "Dynamic buffer calculations for volatile transit times",
        "Sub-assembly BOM lead-time aggregation",
        "Geopolitical and port congestion risk radar"
      ]
    },
    {
      title: "Retail & Consumer Goods (CPG)",
      icon: ShoppingBag,
      desc: "Balance seasonal promotions, omni-channel fulfillment velocity, and perishability with localized ML demand forecasting.",
      metrics: "22% reduction in holding costs",
      benefits: [
        "Day-of-week and promotional lift modeling",
        "Automated store and regional warehouse replenishment",
        "Markdown avoidance via early stockout warnings"
      ]
    },
    {
      title: "Industrial Manufacturing",
      icon: Factory,
      desc: "Ensure raw material availability (metals, polymers, chemicals) with supplier scorecards and contracted lead-time auditing.",
      metrics: "15% procurement cost savings",
      benefits: [
        "Bulk purchase order optimization and EOQ batching",
        "Vendor contract SLA compliance auditing",
        "Supplier price quote trend tracking"
      ]
    }
  ];

  return (
    <div className="space-y-20 py-16">
      <SEOHead
        title="Industry Solutions | EMOX AI-Supplychain"
        description="Tailored supply chain intelligence solutions for Electronics, Automotive, Retail & CPG, and Industrial Manufacturing."
        canonical="https://emox.ai/solutions"
        schema={schema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
          Tailored Industry Architectures
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Built for Complex, High-Stakes Operations
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Whether you manage 500 mission-critical automotive sub-assemblies or 50,000 retail SKUs, EMOX delivers unmatched visibility.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {industries.map((ind) => {
            const Icon = ind.icon;
            return (
              <div
                key={ind.title}
                className="p-8 sm:p-10 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{ind.title}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">{ind.desc}</p>
                  <div className="text-xs font-mono text-cyan-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 inline-block font-semibold">
                    {ind.metrics}
                  </div>
                  <ul className="space-y-2 pt-2">
                    {ind.benefits.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    to="/app/dashboard"
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                  >
                    <span>Explore in demo workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
