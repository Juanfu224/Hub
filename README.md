# Hub — Enlaces y contacto

Sitio estático tipo “link in bio”: muestra tu perfil y enlaces a redes o contacto directo (`mailto`). Sin backend, sin cookies y sin trackers.

## Stack

- [Astro](https://astro.build) (HTML estático)
- TypeScript estricto
- CSS propio (sin Tailwind)
- Fuente autoalojada Source Serif Pro (`@fontsource`, subsets latin / latin-ext)
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
3. Ajusta `presentation` si quieres cambiar qué va a la fila social vs las cards (y el orden).
4. Mantén `profile.siteUrl` **igual** que `site` en [`astro.config.mjs`](astro.config.mjs) (canónico para SEO/OG).
5. Sustituye `public/avatar.webp`, `public/bg-poster.webp` (y `.jpg` de respaldo), `public/og-image.png` y `public/favicon.svg` por tus assets.
6. Actualiza la URL del sitemap en [`public/robots.txt`](public/robots.txt).
7. Vuelve a desplegar (o deja que Cloudflare Pages reconstruya al hacer push).

Esquemas de URL permitidos: `https:`, `mailto:`, `tel:`. Avatar debe ser ruta misma-origen (`/…`). Cualquier incumplimiento falla en build/arranque.

## Seguridad

- Sitio 100 % estático (superficie mínima).
- **CSP** con hashes vía `security.csp` en Astro (meta). **No** duplicar `Content-Security-Policy` en `_headers` (doble política = más restrictiva y fácil de romper).
- Cabeceras en [`public/_headers`](public/_headers): `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, COOP/CORP y caché (`/_astro/*` inmutable).
- Enlaces externos: `rel="noopener noreferrer"` + `referrerpolicy="no-referrer"`.
- Iconos SVG vía máscaras CSS en clases estáticas (sin estilos inline ni CDN).
- Sin analytics ni formularios en v1.
- CI en GitHub Actions: `check`, `build` y `npm audit` (nivel high+).

## Deploy en Cloudflare Pages (sin dominio propio)

Hasta tengas un dominio custom, Cloudflare te da una URL `https://<nombre-proyecto>.pages.dev`.

1. Sube el repo a GitHub (si aún no está).
2. Entra en [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Elige el repositorio y configura:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** `22` (o deja que lea [`.node-version`](.node-version))
4. Despliega. Copia la URL pública `https://<nombre>.pages.dev`.
5. Actualiza en el repo (misma cadena en los tres sitios):
   - `site` en [`astro.config.mjs`](astro.config.mjs)
   - `profile.siteUrl` en [`src/data/links.ts`](src/data/links.ts)
   - `Sitemap:` en [`public/robots.txt`](public/robots.txt)
6. Haz commit + push para un nuevo deploy con SEO/canonical correctos.

### Dominio personalizado (más adelante)

1. En el proyecto Pages → **Custom domains** → añade tu dominio y sigue la verificación DNS.
2. Sustituye el `*.pages.dev` por `https://tudominio.com` en los tres archivos del paso 5 y vuelve a desplegar.
3. SSL/HSTS lo gestiona Cloudflare en el edge.

## Estructura

```
src/
  data/links.ts            # perfil, enlaces y presentation
  components/              # Profile, SocialRow, TornLink
  layouts/BaseLayout.astro
  pages/index.astro
  styles/global.css
public/
  _headers                 # cabeceras (sin CSP duplicada)
  robots.txt
  avatar.webp
  bg-poster.webp / .jpg
  icons/                   # máscaras SVG
  torn-top.svg / torn-bottom.svg
  og-image.png
  favicon.svg
.github/workflows/ci.yml
```
