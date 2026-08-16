# Hub — Enlaces y contacto

Sitio estático tipo “link in bio”: muestra tu perfil y enlaces a redes o contacto directo (`mailto`). Sin backend, sin cookies y sin trackers.

## Stack

- [Astro](https://astro.build) (HTML estático)
- TypeScript estricto
- CSS propio (sin Tailwind)
- Fuente autoalojada Source Serif Pro (`@fontsource`, subsets latin / latin-ext)
- Pensado para [Cloudflare Workers](https://workers.cloudflare.com) (assets estáticos)

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
npm run deploy   # build + wrangler deploy
```

## Personalizar contenido

Edita un solo archivo: [`src/data/links.ts`](src/data/links.ts).

1. Cambia `profile` (`name`, `bio`, `avatar`, `email`, `siteUrl`).
2. Ajusta el array `links` (etiqueta, URL, icono). `external` se deriva del esquema de la URL.
3. Ajusta `presentation` si quieres cambiar qué va a la fila social vs las cards (y el orden).
4. Mantén `profile.siteUrl` **igual** que `site` en [`astro.config.mjs`](astro.config.mjs) (canónico para SEO/OG).
5. Sustituye `public/avatar.webp`, `public/bg-poster.webp` (y `.jpg` de respaldo), `public/og-image.png` y `public/favicon.svg` por tus assets.
6. Actualiza la URL del sitemap en [`public/robots.txt`](public/robots.txt).
7. Vuelve a desplegar con `npm run deploy`.

Esquemas de URL permitidos: `https:`, `mailto:`, `tel:`. Avatar debe ser ruta misma-origen (`/…`). Cualquier incumplimiento falla en build/arranque.

## Seguridad

- Sitio 100 % estático (superficie mínima).
- **CSP** con hashes vía `security.csp` en Astro (meta). **No** duplicar `Content-Security-Policy` en `_headers` (doble política = más restrictiva y fácil de romper).
- Cabeceras en [`public/_headers`](public/_headers): `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, COOP/CORP y caché (`/_astro/*` inmutable).
- Enlaces externos: `rel="noopener noreferrer"` + `referrerpolicy="no-referrer"`.
- Iconos SVG vía máscaras CSS en clases estáticas (sin estilos inline ni CDN).
- Sin analytics ni formularios en v1.
- CI en GitHub Actions: `check`, `build`, `npm audit` (nivel high+) y **deploy automático** a Workers en cada push a `main`.

## Deploy en Cloudflare Workers (sin dominio propio)

El sitio se publica como Worker **assets-only** ([`wrangler.jsonc`](wrangler.jsonc)). URL de producción: `https://hub.juanfu224.workers.dev`.

### Producción (recomendado): GitHub Actions

Cada push a `main` (y `workflow_dispatch`) despliega con [`cloudflare/wrangler-action`](https://github.com/cloudflare/wrangler-action) tras pasar `check`/`build`/`audit`.

Secrets del repo (Settings → Secrets and variables → Actions):

| Secret | Valor |
|--------|--------|
| `CLOUDFLARE_API_TOKEN` | Token API con permiso **Edit Cloudflare Workers** (+ Account Read) |
| `CLOUDFLARE_ACCOUNT_ID` | ID de cuenta Cloudflare |

Crear el token: [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) → plantilla **Edit Cloudflare Workers**.

Para redesplegar sin commit: Actions → **CI** → **Run workflow**.

### Desde tu máquina (manual)

1. Autentica Wrangler una vez: `npx wrangler login`
2. Despliega: `npm run deploy` (**permanente**; no uses `--temporary` para producción)
3. Si cambias la URL pública, actualízala en los tres sitios y vuelve a desplegar:
   - `site` en [`astro.config.mjs`](astro.config.mjs)
   - `profile.siteUrl` en [`src/data/links.ts`](src/data/links.ts)
   - `Sitemap:` en [`public/robots.txt`](public/robots.txt)

### Preview temporal (solo pruebas; no es producción)

```bash
npm run build && npx wrangler deploy --temporary
```

La preview caduca (~1 h) salvo que la reclames. **No** uses esto como hosting permanente: el sitio desaparecerá.

### Dominio personalizado (más adelante)

1. En el Worker `hub` → **Settings** → **Domains & Routes** → añade tu dominio.
2. Sustituye el `*.workers.dev` por `https://tudominio.com` en los tres archivos del paso manual y vuelve a desplegar (o push a `main`).
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
wrangler.jsonc             # Worker assets-only
.github/workflows/ci.yml
```
