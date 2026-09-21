import SEOHead from "../../components/common/SEOHead";

export default function PrivacyPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-slate-300">
      <SEOHead
        title="Privacy Policy & Data Security | EMOX"
        description="EMOX AI Supply Chain Privacy Policy. Details on local inference data isolation, SOC2 readiness, and zero third-party data transmission."
        canonical="https://emox.ai/privacy"
      />

      <div className="space-y-3">
        <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Legal Compliance</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Effective Date: September 8, 2026</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed border-t border-slate-800 pt-6">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Local AI & Zero Data Egress Commitment</h2>
          <p>
            EMOX is architected around the principle of private data sovereignty. Operational datasets (inventory levels, vendor quotes, sales transactions, and internal contracts) are processed strictly using local Ollama model weights or self-hosted deployment instances. We do not sell, rent, or transmit your proprietary supply chain data to external commercial LLM providers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Multi-Tenant Organizational Isolation</h2>
          <p>
            Every customer tenant is compartmentalized using indexed database constraints. Users authenticated under Organization A have zero cryptographic or programmatic access to Organization B's products, warehouses, documents, or AI conversation histories.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Information Collected</h2>
          <p>
            We collect basic contact information (name, work email, encrypted authentication credentials) to maintain workspace sessions, as well as operational telemetry (request duration, status codes, and audit logs) to ensure high platform availability and auditability.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. GDPR & SOC2 Alignment</h2>
          <p>
            Users maintain full rights to request data export, tenant deletion, and audit trail extraction at any time. Inquiries regarding data processing agreements (DPA) can be directed to privacy@emox.ai.
          </p>
        </section>
      </div>
    </div>
  );
}
