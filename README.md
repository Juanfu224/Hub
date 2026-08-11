# Hub — Enlaces y contacto

Sitio estático tipo “link in bio”: muestra tu perfil y enlaces a redes o contacto directo (`mailto` / WhatsApp). Sin backend, sin cookies y sin trackers.

## Stack

- [Astro](https://astro.build) (HTML estático)
- TypeScript estricto
- Tailwind CSS v4
- Fuentes autoalojadas (`@fontsource-variable`)
- Pensado para [Cloudflare Pages](https://pages.cloudflare.com)

## Requisitos

- Node.js `>= 22.12.0`

## Desarrollo

```bash
npm install
npm run dev
```

Otros comandos:

```bash
npm run build    # genera dist/
npm run preview  # sirve dist/ en local
```

## Personalizar contenido

Edita un solo archivo: [`src/data/links.ts`](src/data/links.ts).

1. Cambia `profile` (`name`, `bio`, `avatar`, `email`, `siteUrl`).
2. Ajusta el array `links` (etiqueta, URL, icono, `external`).
3. Sustituye `public/avatar.webp`, `public/og-image.png` y `public/favicon.svg` por tus assets.
4. Vuelve a desplegar (o deja que Cloudflare Pages reconstruya al hacer push).

Esquemas de URL permitidos: `https:`, `mailto:`, `tel:`. Cualquier otro esquema falla en build/arranque.

## Seguridad

- Sitio 100 % estático (superficie mínima).
- Cabeceras en [`public/_headers`](public/_headers) (CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`).
- Enlaces externos con `rel="noopener noreferrer"`.
- Iconos SVG inline (sin CDN de terceros).
- Sin analytics ni formularios en v1.

## Deploy en Cloudflare Pages

1. Sube el repo a GitHub/GitLab.
2. En Cloudflare Pages: **Create project** → conecta el repo.
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** `22` (o superior)
4. En `src/data/links.ts`, pon `profile.siteUrl` con tu dominio final (sin barra final).
5. Añade el dominio personalizado en Cloudflare y espera el SSL.

Las cabeceras de `_headers` se aplican automáticamente en Pages.

## Estructura

```
src/
  data/links.ts          # perfil y enlaces
  components/            # Profile, LinkList, LinkButton, SocialIcon
  layouts/BaseLayout.astro
  pages/index.astro
  styles/global.css
public/
  _headers               # seguridad (Cloudflare Pages)
  avatar.webp
  og-image.png
  favicon.svg
```
