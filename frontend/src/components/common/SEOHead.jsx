import { useEffect } from "react";

/**
 * Enterprise SEO Head Component
 * Dynamically updates document title, meta descriptions, canonical URLs,
 * OpenGraph, Twitter tags, and structured JSON-LD data in pure React.
 */
export default function SEOHead({
  title = "AI Supply Chain Management Platform | EMOX",
  description = "Enterprise-grade AI platform for demand forecasting, inventory optimization, supplier intelligence, and autonomous supply chain risk management.",
  canonical,
  ogType = "website",
  ogImage = "https://emox.ai/og-cover.png",
  schema
}) {
  useEffect(() => {
    // 1. Page Title
    document.title = title.includes("EMOX") ? title : `${title} | EMOX AI-Supplychain`;

    // Helper to create or update meta tag
    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // 2. Standard Meta Tags
    setMeta("name", "description", description);
    setMeta("name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

    // 3. OpenGraph Tags
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:url", window.location.href);
    setMeta("property", "og:site_name", "EMOX AI-Supplychain");

    // 4. Twitter Cards
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);

    // 5. Canonical Link
    const targetCanonical = canonical || window.location.origin + window.location.pathname;
    let linkCanonical = document.querySelector("link[rel='canonical']");
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", targetCanonical);

    // 6. JSON-LD Structured Data
    const defaultSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "EMOX AI-Supplychain",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": description
    };

    const activeSchema = schema || defaultSchema;
    let scriptTag = document.querySelector("#seo-jsonld");
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = "seo-jsonld";
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(activeSchema);
  }, [title, description, canonical, ogType, ogImage, schema]);

  return null;
}
