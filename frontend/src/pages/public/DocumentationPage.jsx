import { Link } from "react-router-dom";
import { Terminal, Database, Cpu, Lock, Layers, Code, ArrowRight } from "lucide-react";
import SEOHead from "../../components/common/SEOHead";

export default function DocumentationPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "name": "EMOX AI Platform Documentation",
    "description": "Developer and architecture documentation for the EMOX local AI supply chain intelligence SaaS platform."
  };

  const sections = [
    {
      title: "1. Quick Start & Local Ollama Setup",
      icon: Terminal,
      code: `# Start Ollama local runtime\nollama serve\n\n# Pull required open weights\nollama pull llama3.1:8b\nollama pull nomic-embed-text\nollama pull llama3.2-vision`,
      desc: "EMOX runs natively with local Ollama runtime. If Ollama is offline or models are still downloading, the platform automatically degrades into deterministic heuristic mode with full UI status banners."
    },
    {
      title: "2. REST API v1 Architecture",
      icon: Code,
      code: `GET  /api/v1/health\nPOST /api/v1/auth/login\nGET  /api/v1/products\nGET  /api/v1/inventory/alerts\nGET  /api/v1/forecasting/predict/:productId\nPOST /api/v1/ai/chat\nPOST /api/v1/purchase-orders`,
      desc: "All endpoints are mounted under /api/v1 with standard envelope formatting, structured HTTP error codes, and strict multi-tenant scoping. Legacy /api endpoints remain active for full backward compatibility."
    },
    {
      title: "3. Multi-Tenant Database Schema",
      icon: Database,
      code: `organizations (id, name, slug, plan, is_active)\norganization_memberships (user_id, organization_id, role)\nproducts (id, sku, price, reorder_point, organization_id)\ninventory (id, product_id, current_stock, organization_id)\npurchase_orders (id, po_number, status, organization_id)`,
      desc: "Normalized PostgreSQL database with Alembic migration versioning. Every operational entity contains an indexed organization_id foreign key to guarantee tenant data isolation."
    },
    {
      title: "4. Multi-Agent Orchestration Protocol",
      icon: Cpu,
      code: `class BaseAgent:\n    def run(self, db, **kwargs) -> Dict[str, Any]:\n        # 1. Deterministic database calculations\n        # 2. Safety policy check (READ vs WRITE)\n        # 3. Local Ollama explanation generation\n        # 4. Telemetry audit logging`,
      desc: "Five specialized agents (Supplier, Inventory, Demand, Risk, Procurement) adhere to standard input/output schemas with deterministic calculation grounding."
    }
  ];

  return (
    <div className="space-y-16 py-16">
      <SEOHead
        title="Developer Documentation & API Reference | EMOX"
        description="Architecture specifications, REST API reference, and deployment documentation for EMOX AI Supply Chain platform."
        canonical="https://emox.ai/documentation"
        schema={schema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
          Developer & Architecture Docs
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Platform Documentation
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Technical specifications, REST API v1 endpoints, local AI setup, and multi-tenant security architecture.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.title}
              className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">{sec.title}</h3>
              </div>
              <p className="text-sm text-slate-300">{sec.desc}</p>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300/90 overflow-x-auto">
                <code>{sec.code}</code>
              </pre>
            </div>
          );
        })}

        <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">Interactive Swagger & OpenAPI Specification</h4>
            <p className="text-xs text-slate-400">Explore and test all active REST endpoints on your live server.</p>
          </div>
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-sm font-semibold hover:bg-cyan-400 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>Open Swagger UI</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
