import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Default rule for every crawler — covers most use cases. Block
        // internal / transactional paths that shouldn't be indexed.
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/booking/success",
          "/booking/error",
          "/test-quote",
        ],
      },
      // Major search-engine crawlers — explicit allow so intent is obvious.
      { userAgent: ["Googlebot", "Bingbot", "DuckDuckBot"], allow: "/" },
      // AI / answer-engine crawlers — opted in so the brand can appear in
      // LLM answers, ChatGPT browsing, Perplexity citations, etc. If
      // priorities change, swap `allow` for `disallow` here.
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-User",
          "anthropic-ai",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
        ],
        allow: "/",
      },
    ],
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
    host: siteConfig.siteUrl,
  };
}
