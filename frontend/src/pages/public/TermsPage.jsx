import SEOHead from "../../components/common/SEOHead";

export default function TermsPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-slate-300">
      <SEOHead
        title="Terms of Service | EMOX AI-Supplychain"
        description="Terms of Service governing use of the EMOX autonomous AI supply chain intelligence SaaS platform."
        canonical="https://emox.ai/terms"
      />

      <div className="space-y-3">
        <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Terms & Conditions</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Terms of Service</h1>
        <p className="text-xs text-slate-500">Effective Date: September 8, 2026</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed border-t border-slate-800 pt-6">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or utilizing the EMOX SaaS workspace, API endpoints, or automated agents, you agree to be legally bound by these Terms of Service. If registering on behalf of an enterprise entity, you represent that you possess the requisite authority to bind that organization.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Permitted Use & Operational Responsibility</h2>
          <p>
            EMOX provides predictive demand calculations, inventory alerts, and supplier ranking recommendations. While our calculations are mathematically grounded in your historical data, final commercial execution (such as issuing binding Purchase Orders or approving supplier contracts) remains the responsibility of your authorized personnel through our human-in-the-loop approval workflows.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Service Level Agreement & Uptime</h2>
          <p>
            Professional and Enterprise tier subscriptions include our 99.9% uptime SLA guarantee, continuous automated database replication, and sub-second API latency targets for core inventory operations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. Intellectual Property</h2>
          <p>
            You retain 100% exclusive ownership of all uploaded supplier contracts, product catalogs, historical sales records, and generated forecasts. EMOX asserts zero proprietary claim over your business operational data.
          </p>
        </section>
      </div>
    </div>
  );
}
