import { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle2, ArrowRight, MessageSquare } from "lucide-react";
import SEOHead from "../../components/common/SEOHead";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    skus: "1,000 - 10,000",
    message: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-16 py-16">
      <SEOHead
        title="Contact Enterprise Sales & Engineering | EMOX"
        description="Get in touch with EMOX AI Supply Chain engineers for live demos, custom integrations, or enterprise inquiries."
        canonical="https://emox.ai/contact"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
          Get in Touch
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Speak with Our Supply Chain Engineers
        </h1>
        <p className="text-lg text-slate-300">
          Have questions about on-premises Ollama deployments, custom ERP integrations, or pilot testing? We are here to help.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Details */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Global Headquarters</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our platform engineers and supply chain architects are based in Austin, Texas, with engineering hubs across North America and Europe.
              </p>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>450 Innovation Blvd, Enterprise Suite 10, Austin TX 78701</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>contact@emox.ai</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>+1 (555) 019-2831</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">Security Notice</span>
              <p className="text-xs text-slate-400">
                All client conversations, pilot datasets, and integration requirements are protected by strict mutual NDAs. We never share proprietary operational data.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Demo Request Received</h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">
                  Thank you! A senior solutions architect will contact you within 4 business hours to schedule your demo.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Acme Global Logistics"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Active SKUs Managed</label>
                  <select
                    value={formData.skus}
                    onChange={(e) => setFormData({ ...formData, skus: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Under 1,000">Under 1,000 SKUs</option>
                    <option value="1,000 - 10,000">1,000 - 10,000 SKUs</option>
                    <option value="10,000 - 50,000">10,000 - 50,000 SKUs</option>
                    <option value="50,000+">50,000+ SKUs (Global Enterprise)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Message / Requirements</label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your inventory challenges or ERP requirements..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Request Live Pilot Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
