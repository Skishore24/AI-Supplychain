import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, Share2, CheckCircle2 } from "lucide-react";
import SEOHead from "../../components/common/SEOHead";
import { BLOG_POSTS } from "./BlogPage";

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find((p) => p.slug === slug) || BLOG_POSTS[0];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "datePublished": post.date
  };

  return (
    <div className="py-16">
      <SEOHead
        title={`${post.title} | EMOX AI Blog`}
        description={post.excerpt}
        canonical={`https://emox.ai/blog/${post.slug}`}
        schema={schema}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Link
            to="/blog"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Engineering Blog</span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
              {post.tag}
            </span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="pt-4 pb-8 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
                {post.author[0]}
              </div>
              <span className="font-semibold text-slate-200">{post.author}</span>
              <span>· Senior AI Supply Chain Architect</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="prose prose-invert prose-cyan max-w-none text-slate-300 leading-relaxed text-base space-y-6">
          <p className="text-lg text-slate-200 font-medium leading-relaxed">
            {post.excerpt}
          </p>

          <div className="whitespace-pre-line text-slate-300">
            {post.content.trim()}
          </div>
        </div>

        {/* Bottom Box */}
        <div className="pt-10 border-t border-slate-800">
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
            <h3 className="text-xl font-bold text-white">Experience Deterministic Supply Chain AI</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Test multi-agent inventory calculations, demand forecasting, and RAG document ingestion in your private workspace.
            </p>
            <div className="pt-2">
              <Link
                to="/app/dashboard"
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors inline-block"
              >
                Launch Workspace
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
