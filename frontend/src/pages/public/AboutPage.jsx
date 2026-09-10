import { Link } from "react-router-dom";
import { ShieldCheck, Cpu, Database, Award, ArrowRight, CheckCircle2 } from "lucide-react";
import SEOHead from "../../components/common/SEOHead";

export default function AboutPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About EMOX AI Supply Chain",
    "description": "Our mission: to build the world's most resilient, transparent, and private AI supply chain management platform."
  };

  const values = [
    {
      title: "Deterministic Grounding First",
      desc: "We reject probabilistic hallucinations for operational supply chain figures. Every reorder point, safety stock, and cost projection is computed deterministically in code.",
      icon: Cpu
    },
    {
      title: "Absolute Data Privacy",
      desc: "Your vendor pricing, inventory levels, and contracts are critical trade secrets. We run 100% on local inference (Ollama) so your data never touches third-party APIs.",
      icon: ShieldCheck
    },
    {
      title: "Human-in-the-Loop Governance",
      desc: "AI automates heavy data analysis, but financial decisions remain in human hands. All procurement recommendations require explicit authorization before execution.",
      icon: Award
    },
    {
      title: "Multi-Tenant SaaS Isolation",
      desc: "Enterprise data is separated with strict tenant boundaries, organizational scoping, and immutable audit logs for regulatory compliance.",
      icon: Database
    }
  ];

  return (
    <div className="space-y-24 py-16">
      <SEOHead
        title="About Us & Engineering Philosophy | EMOX AI-Supplychain"
        description="Our mission: to build the world's most resilient, transparent, and private AI supply chain management platform."
        canonical="https://emox.ai/about"
        schema={schema}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
          Our Engineering Philosophy
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Pioneering Autonomous, Private, and Verifiable Supply Chains
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed">
          EMOX was founded by supply chain engineers and AI researchers who grew frustrated with fragile black-box LLM demos that hallucinate metrics and leak proprietary data to cloud providers.
        </p>
      </div>

      {/* Core Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">{v.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leadership / CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Join Leading Global Operations</h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            From precision electronics manufacturers to automotive assembly distributors, see how EMOX transforms operations.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              to="/app/dashboard"
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-95 transition-opacity"
            >
              Explore Demo Workspace
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Contact Leadership Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
