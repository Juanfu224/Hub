# Hub — Enlaces y contacto

Sitio estático tipo “link in bio”: muestra tu perfil y enlaces a redes o contacto directo (`mailto`). Sin backend, sin cookies y sin trackers.

## Stack

- [Astro](https://astro.build) (HTML estático)
- TypeScript estricto
- CSS propio (sin Tailwind)
- Fuentes autoalojadas Bricolage Grotesque + Figtree (`@fontsource-variable`, subsets latin / latin-ext)
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

El contenido editable vive en `src/content/`. El origen canónico (SEO, Open Graph y `robots.txt`) es solo `site` en [`astro.config.mjs`](astro.config.mjs).

1. Cambia el perfil en [`src/content/profile.yaml`](src/content/profile.yaml) (`name`, `bio`, `avatar`).
2. Cada bloque de la home es un YAML en `src/content/sections/`. `order` fija la posición. `variant` elige la vista:
   - `icons` — fila de iconos. Cada item lleva `label`, `url` e `icon`.
   - `cards` — tarjetas con icono. Mismos campos.
   - `projects` — tarjetas con título y resumen. Cada item lleva `label`, `summary` y `url`.
3. El título visible es opcional (`title`). En `projects` hoy es «Mi trabajo».
4. Un icono nuevo es una entrada en [`src/lib/icons.ts`](src/lib/icons.ts); el esquema solo acepta esas claves.
5. Sustituye `public/avatar.webp`, `public/bg-setup.webp` (y `.jpg` de respaldo), `public/og-image.png` y `public/favicon.svg` por tus assets.
6. Si cambia el dominio, actualiza `site` en [`astro.config.mjs`](astro.config.mjs) y vuelve a desplegar. `robots.txt` se genera en el build.

Esquemas de URL permitidos: `https:`, `mailto:`, `tel:`. Avatar debe ser ruta misma-origen (`/…`). Un `order` repetido entre secciones falla en el build. Un tipo de bloque nuevo (además de `icons`, `cards` y `projects`) sí necesita un componente.

### Añadir un bloque en la home

Crea, por ejemplo, `src/content/sections/charlas.yaml`:

```yaml
order: 3
variant: cards
title: Charlas
items:
  - label: Una charla
    url: https://example.com/charla
    icon: github
```

No hace falta tocar componentes: la home pinta las secciones ordenadas por `order`.

### Añadir una página

Crea un Markdown en `src/content/pages/`, por ejemplo `src/content/pages/proyectos.md`:

```md
---
title: Proyectos
description: Cosas en las que estoy trabajando.
order: 0
---

Texto de la página.
```

La ruta será `/proyectos`. `order` es opcional; si falta, la navegación ordena por id. La home y esas páginas comparten columna, fondo y pie. La navegación entre secciones aparece solo cuando hay al menos una página de contenido.

## Seguridad

- Sitio 100 % estático (superficie mínima).
- **CSP** con hashes vía `security.csp` en Astro (meta). **No** duplicar `Content-Security-Policy` en `_headers` (doble política = más restrictiva y fácil de romper).
- Cabeceras en [`public/_headers`](public/_headers): `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, COOP/CORP y caché (`/_astro/*` inmutable).
- Enlaces externos: `rel="noopener noreferrer"` + `referrerpolicy="no-referrer"`.
- Iconos SVG inline desde `src/lib/icons.ts` (`currentColor`, sin CDN).
- Sin analytics ni formularios en v1.
- CI en GitHub Actions: `check`, `build` y `npm audit` (nivel high+).

## Deploy en Cloudflare Workers (sin dominio propio)

El sitio se publica como Worker **assets-only** ([`wrangler.jsonc`](wrangler.jsonc)). Cloudflare asigna una URL `https://hub.<subdominio>.workers.dev`.

### Desde tu máquina (cuenta permanente)

1. Autentica Wrangler una vez: `npx wrangler login`
2. Despliega: `npm run deploy`
3. Copia la URL `*.workers.dev` y actualiza `site` en [`astro.config.mjs`](astro.config.mjs).
4. Vuelve a ejecutar `npm run deploy` para SEO, canonical y `robots.txt` correctos.

### Deploy temporal (sin login)

```bash
npm run build && npx wrangler deploy --temporary
```

Obtienes una preview (~1 h) y un enlace **Claim** para asociarla a tu cuenta Cloudflare.

### Dominio personalizado (más adelante)

1. En el Worker `hub` → **Settings** → **Domains & Routes** → añade tu dominio.
2. Sustituye el `*.workers.dev` por `https://tudominio.com` en `site` y vuelve a desplegar.
3. SSL/HSTS lo gestiona Cloudflare en el edge.

## Estructura

```
src/
  content.config.ts        # colecciones profile, sections y pages
  content/profile.yaml     # nombre, bio y avatar
  content/sections/        # bloques de la home (icons, cards, projects)
  content/pages/           # Markdown de páginas (vacío hasta que añadas una)
  lib/icons.ts             # trazos SVG
  lib/url.ts               # validación de URLs y atributos externos
  lib/home.ts              # perfil, secciones ordenadas y páginas
  components/              # SiteShell, Profile, Section, CardLink, SocialIcon
  layouts/BaseLayout.astro
  pages/index.astro
  pages/[slug].astro       # páginas de la colección
  pages/robots.txt.ts      # generado desde site
  styles/global.css        # tokens, fondo y shell
public/
  _headers                 # cabeceras (sin CSP duplicada)
  avatar.webp
  bg-setup.webp / .jpg     # fondo full-bleed
  og-image.png
  favicon.svg
wrangler.jsonc             # Worker assets-only
.github/workflows/ci.yml
```
