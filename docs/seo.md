# Enterprise Technical SEO & Metadata Architecture

## 1. Technical SEO Strategy

EMOX implements a multi-layer technical SEO architecture to ensure public marketing and product pages achieve top organic search indexability while protecting authenticated application routes:

1. **Unique Title & Meta Descriptions**: Injected per page using `SEOHead.jsx`.
2. **Canonical URLs**: Automatically injected to prevent duplicate URL parameters.
3. **Structured Data (JSON-LD)**:
   - `SoftwareApplication`: Defines the platform, category, operating system, and features.
   - `Organization`: Enterprise entity, headquarters location, and contact points.
   - `BlogPosting`: Published thought-leadership articles with author and timestamp markup.
4. **Crawl Directives**:
   - `public/robots.txt`: Allows public marketing URLs and blocks `/app/`, `/admin/`, and `/api/`.
   - `public/sitemap.xml`: Full XML sitemap of all public indexable URLs.
5. **OpenGraph & Twitter Cards**: High-resolution social preview tags for LinkedIn, X (Twitter), and Slack unfurling.

---

## 2. Public Page Keyword Mapping

| Route | Primary Keyword Theme | Structured Schema |
|---|---|---|
| `/` | AI Supply Chain Management Platform | SoftwareApplication |
| `/features` | AI Demand Forecasting & Inventory Optimization | WebPage |
| `/solutions` | Electronics & Automotive Supply Chain AI | WebPage |
| `/ai-agents` | Multi-Agent Supply Chain Orchestration | SoftwareApplication |
| `/pricing` | Supply Chain SaaS Pricing & Plans | PriceSpecification |
| `/documentation` | Supply Chain AI REST API Reference | TechArticle |
| `/blog` | Autonomous Supply Chain Engineering Blog | Blog |
| `/blog/:slug` | In-depth AI Case Studies & Research | BlogPosting |
