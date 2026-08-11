# Hub — Enlaces y contacto

Sitio estático tipo “link in bio”: muestra tu perfil y enlaces a redes o contacto directo (`mailto` / WhatsApp). Sin backend, sin cookies y sin trackers.

## Stack

- [Astro](https://astro.build) (HTML estático)
- TypeScript estricto
- Tailwind CSS v4
- Fuentes autoalojadas (`@fontsource-variable`, subsets latin / latin-ext)
- Pensado para [Cloudflare Pages](https://pages.cloudflare.com)

## Requisitos

- Node.js `>= 22.12.0` (ver [`.node-version`](.node-version))

## Desarrollo

```bash
npm install
npm run dev
```

Otros comandos:

```bash
npm run check    # astro check (tipos)
npm run build    # genera dist/
npm run preview  # sirve dist/ en local
npm run ci       # check + build
npm run audit    # npm audit (omitiendo dev)
```

## Personalizar contenido

Edita un solo archivo: [`src/data/links.ts`](src/data/links.ts).

1. Cambia `profile` (`name`, `bio`, `avatar`, `email`, `siteUrl`).
2. Ajusta el array `links` (etiqueta, URL, icono). `external` se deriva del esquema de la URL.
3. Mantén `profile.siteUrl` **igual** que `site` en [`astro.config.mjs`](astro.config.mjs) (canónico para SEO/OG).
4. Sustituye `public/avatar.webp`, `public/og-image.png` y `public/favicon.svg` por tus assets.
5. Actualiza la URL del sitemap en [`public/robots.txt`](public/robots.txt).
6. Vuelve a desplegar (o deja que Cloudflare Pages reconstruya al hacer push).

Esquemas de URL permitidos: `https:`, `mailto:`, `tel:`. Avatar debe ser ruta misma-origen (`/…`). Cualquier incumplimiento falla en build/arranque.

## Seguridad

- Sitio 100 % estático (superficie mínima).
- **CSP** con hashes vía `security.csp` en Astro (meta). **No** duplicar `Content-Security-Policy` en `_headers` (doble política = más restrictiva y fácil de romper).
- Cabeceras en [`public/_headers`](public/_headers): `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, COOP/CORP y caché (`/_astro/*` inmutable).
- Enlaces externos: `rel="noopener noreferrer"` + `referrerpolicy="no-referrer"`.
- Iconos SVG inline (sin CDN de terceros).
- Sin analytics ni formularios en v1.
- CI en GitHub Actions: `check`, `build` y `npm audit` (nivel high+).

## Deploy en Cloudflare Pages

1. Conecta el repo en Cloudflare Pages.
2. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** lee `.node-version` (22)
3. Pon el dominio final en `astro.config.mjs` (`site`) y en `profile.siteUrl` / `robots.txt`.
4. Añade el dominio personalizado en Cloudflare (SSL/HSTS en el edge).

## Estructura

```
src/
  data/links.ts          # perfil y enlaces
  components/            # Profile, LinkList, LinkButton, SocialIcon
  layouts/BaseLayout.astro
  pages/index.astro
  styles/global.css
public/
  _headers               # cabeceras (sin CSP duplicada)
  robots.txt
  avatar.webp
  og-image.png
  favicon.svg
.github/workflows/ci.yml
```
