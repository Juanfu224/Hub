// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Replace with your real `*.pages.dev` URL after the first Cloudflare Pages deploy.
  site: 'https://hub.pages.dev',
  integrations: [sitemap()],
  markdown: {
    // Avoid Shiki inline styles that conflict with CSP (no MD pages in this site).
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
