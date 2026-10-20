// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Canonical origin. robots.txt and OG URLs are generated from this value.
  site: 'https://hub.juanfu224.workers.dev',
  integrations: [sitemap()],
  markdown: {
    // Avoid Shiki inline styles that conflict with CSP.
    syntaxHighlight: false,
  },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "base-uri 'self'",
        "form-action 'none'",
        "frame-ancestors 'none'",
        "object-src 'none'",
        'upgrade-insecure-requests',
      ],
    },
  },
});
