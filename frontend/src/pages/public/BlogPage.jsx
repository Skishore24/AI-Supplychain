import { Link } from "react-router-dom";
import { ArrowRight, Calendar, User, Clock, Sparkles } from "lucide-react";
import SEOHead from "../../components/common/SEOHead";

export const BLOG_POSTS = [
  {
    slug: "autonomous-supply-chains-2026",
    title: "Why Autonomous Multi-Agent AI is Replacing Monolithic ERP Schedulers",
    excerpt: "Traditional ERP planning cycles run nightly and fail during volatile disruptions. Here is how coordinated local AI agents solve lead-time variance in real time.",
    author: "Alex Vance",
    date: "September 4, 2026",
    readTime: "6 min read",
    tag: "Architecture",
    content: `
      ## The Demise of Batch MRP Scheduling
      For decades, global manufacturing and distribution operations relied on batch MRP (Material Requirements Planning) cycles executed once every 24 hours. When unexpected shipping delays, supplier stockouts, or sudden demand spikes occurred midday, procurement teams remained blind until the next batch run.

      ### Enter Multi-Agent Autonomous Supply Chains
      Rather than relying on static tables, modern supply chain architectures deploy specialized AI agents:
      1. **Inventory Agents**: Continuously monitor real-time stock levels, dynamic lead-time variability, and safety buffer integrity.
      2. **Demand Agents**: Apply machine learning algorithms (like Ridge regression) over continuous transaction streams rather than static monthly averages.
      3. **Supplier Agents**: Dynamically re-evaluate vendor quotes, delivery reliability, and defect rates to propose dual-sourcing alternatives.

      ### Why Deterministic Grounding Matters
      The biggest mistake made by first-generation AI demos was asking generic LLMs to 'guess' reorder numbers. In a commercial supply chain, numbers must be 100% deterministic. AI agents in EMOX compute exact mathematical thresholds in Python, and use language models only to synthesize clear, explainable trade-offs.
    `
  },
  {
    slug: "mitigating-supplier-risk-with-local-ai",
    title: "Eliminating Cloud Privacy Leaks in Enterprise Procurement with Local Ollama",
    excerpt: "Uploading vendor quote comparisons, bill of materials, and contract terms to public cloud LLMs creates immense IP risk. Here is how local inference guarantees enterprise privacy.",
    author: "Sarah Connor",
    date: "August 28, 2026",
    readTime: "5 min read",
    tag: "Security & Privacy",
    content: `
      ## The Hidden IP Risk of Cloud LLMs
      When procurement professionals copy and paste confidential supplier contracts, unit cost breakdowns, and lead-time commitments into public cloud AI services, they risk exposing sensitive commercial terms to external model training pipelines.

      ### Local Ollama Runtime: Zero Data Egress
      EMOX solves this by hosting open-weights language models (such as Llama 3.1 8B and Nomic-Embed-Text) locally within the organization's private virtual cloud or on-premises server.
      
      - All embeddings remain inside local PostgreSQL tables.
      - Hybrid RAG queries execute against private vector indexes.
      - No proprietary pricing or customer order data leaves the private network boundary.

      ### Complete Audit Compliance
      In highly regulated sectors (aerospace, medical devices, automotive), data isolation is a non-negotiable compliance requirement. Local AI architectures provide the exact audit trail needed for SOC2 Type II and ISO 27001 certifications.
    `
  }
];

export default function BlogPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "EMOX AI Supply Chain Engineering Blog",
    "description": "Engineering insights, architecture deep-dives, and research on autonomous supply chain management and local AI."
  };

  return (
    <div className="space-y-16 py-16">
      <SEOHead
        title="Supply Chain AI Engineering Blog | EMOX"
        description="Engineering insights, architecture deep-dives, and research on autonomous supply chain management and local AI."
        canonical="https://emox.ai/blog"
        schema={schema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
          Research & Engineering
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Supply Chain Intelligence Blog
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Insights on deterministic AI architectures, demand forecasting, multi-agent systems, and local LLM deployments.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-4"
          >
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                {post.tag}
              </span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
            </div>

            <h2 className="text-2xl font-bold text-white hover:text-cyan-400 transition-colors">
              <Link to={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">{post.excerpt}</p>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" /> By {post.author}
              </span>
              <Link
                to={`/blog/${post.slug}`}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
              >
                <span>Read Full Article</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
