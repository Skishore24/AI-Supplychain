import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, HelpCircle, ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";
import SEOHead from "../../components/common/SEOHead";

export default function PricingPage() {
  const [annualBilling, setAnnualBilling] = useState(true);

  const schema = {
    "@context": "https://schema.org",
    "@type": "PriceSpecification",
    "name": "EMOX AI Supply Chain Pricing",
    "description": "Transparent SaaS pricing for AI supply chain intelligence, demand forecasting, and inventory optimization."
  };

  const plans = [
    {
      name: "Starter",
      description: "For emerging supply chains scaling inventory operations.",
      monthlyPrice: 499,
      annualPrice: 399,
      features: [
        "Up to 2,500 Active SKUs",
        "Deterministic ROP & Safety Stock",
        "Supplier Evaluation Scorecards",
        "Basic ML Forecasting (30-day horizon)",
        "Local Ollama Inference Integration",
        "Up to 3 Team Members",
        "Email Support"
      ],
      popular: false,
      cta: "Start 14-Day Trial",
      link: "/register"
    },
    {
      name: "Professional",
      description: "For growing enterprises requiring predictive multi-agent coordination.",
      monthlyPrice: 1499,
      annualPrice: 1199,
      features: [
        "Up to 25,000 Active SKUs",
        "Full Multi-Agent Orchestrator Suite",
        "Scikit-Learn ML Forecasting (7, 30, 90 days)",
        "Hybrid pgvector RAG Document Ingestion",
        "Automated Risk Radar & Alerts",
        "Human-in-the-loop Purchase Orders",
        "Up to 15 Team Members",
        "Priority Support & SLA"
      ],
      popular: true,
      cta: "Launch Pro Workspace",
      link: "/register"
    },
    {
      name: "Enterprise",
      description: "For global manufacturers and distributors with mission-critical operations.",
      monthlyPrice: null,
      annualPrice: null,
      features: [
        "Unlimited SKUs & Warehouses",
        "Custom ML Time-Series Forecasting Models",
        "On-Premises Air-Gapped Ollama Deployment",
        "Multimodal Invoice & Packing Inspection",
        "Custom ERP Integrations (SAP, NetSuite)",
        "Unlimited Multi-Tenant Workspaces",
        "Dedicated Solutions Architect & 24/7 SLA"
      ],
      popular: false,
      cta: "Contact Enterprise Sales",
      link: "/contact"
    }
  ];

  const faqs = [
    {
      q: "Does EMOX send proprietary supply chain data to third-party LLMs?",
      a: "No. EMOX is built natively on local Ollama models (llama3.1:8b, nomic-embed-text). Your inventory, vendor pricing, sales data, and contracts remain 100% inside your private cloud or on-premises infrastructure."
    },
    {
      q: "Can the AI automatically issue purchase orders without my approval?",
      a: "No. Procurement safety is our top priority. The Procurement Agent drafts recommended purchase orders based on deterministic calculations, but real PO creation requires explicit authorization from an authenticated Admin or Manager."
    },
    {
      q: "How does the ML Demand Forecasting avoid hallucinations?",
      a: "Demand forecasting is powered by regularized Ridge regression and time-series feature extraction (moving averages, seasonality, trend slopes) in Python. The LLM is used solely to generate natural language explanations of the numbers, never to invent figures."
    },
    {
      q: "Can I host EMOX completely on-premises?",
      a: "Yes. Our Enterprise plan includes Docker Compose and Kubernetes deployment manifests to run the FastAPI backend, PostgreSQL with vector capabilities, and local Ollama inference entirely behind your firewall."
    }
  ];

  return (
    <div className="space-y-20 py-16">
      <SEOHead
        title="SaaS Pricing & Plans | EMOX AI-Supplychain"
        description="Transparent SaaS pricing for AI supply chain intelligence, demand forecasting, and inventory optimization. Starter, Pro, and Enterprise options."
        canonical="https://emox.ai/pricing"
        schema={schema}
      />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
          Transparent Enterprise Pricing
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Predictable Plans for Modern Supply Chains
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Every plan includes our deterministic calculation engine, multi-tenant workspace isolation, and local AI runtime.
        </p>

        {/* Annual / Monthly Toggle */}
        <div className="pt-6 flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${!annualBilling ? "text-white" : "text-slate-400"}`}>
            Monthly
          </span>
          <button
            onClick={() => setAnnualBilling(!annualBilling)}
            className="w-12 h-6 rounded-full bg-slate-800 p-1 flex items-center border border-slate-700 transition-colors"
            aria-label="Toggle annual billing"
          >
            <div
              className={`w-4 h-4 rounded-full bg-cyan-400 transition-transform ${
                annualBilling ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-sm font-medium flex items-center gap-1.5 ${annualBilling ? "text-white" : "text-slate-400"}`}>
            <span>Annual</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const price = annualBilling ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.name}
                className={`rounded-3xl p-8 flex flex-col justify-between relative transition-all ${
                  plan.popular
                    ? "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/10"
                    : "bg-slate-900/50 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-500 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
                  </div>

                  <div className="pt-2">
                    {price ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                          ${price}
                        </span>
                        <span className="text-sm text-slate-400 font-medium">/ month</span>
                      </div>
                    ) : (
                      <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Custom
                      </div>
                    )}
                    {price && annualBilling && (
                      <div className="text-xs text-cyan-400 font-mono mt-1">Billed annually (${price * 12}/yr)</div>
                    )}
                  </div>

                  <ul className="space-y-3 pt-4 border-t border-slate-800">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
                        <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    to={plan.link}
                    className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                      plan.popular
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                        : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-400">Everything you need to know about architecture, privacy, and plans.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
              <h4 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
