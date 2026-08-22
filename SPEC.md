# SPEC.md — Hub

**Versión:** 0.1 — 2026-08-22
**Estado:** Borrador

> Contrato de dominio inmutable durante una tarea activa. El código se deriva de aquí, no al revés.
> Cambios: nueva sección y/o bump de versión **entre** tareas. Criterios de una tarea = petición + sección relevante.

## 1. Visión y fuera de alcance

### Visión
Sitio estático tipo “link in bio”: perfil público y enlaces a redes o contacto directo (`mailto`), sin backend.

### Objetivos funcionales
1. Mostrar nombre, bio, avatar de misma origen y fila de enlaces sociales más cards de enlaces.
2. Contenido editable en un solo archivo: `src/data/links.ts` (`profile`, `links`, `presentation`).
3. Rechazar en build/arranque URLs con esquemas distintos de `https:`, `mailto:`, `tel:`; el avatar debe ser ruta misma-origen (`/…`).
4. Publicar HTML estático en Cloudflare Workers (assets-only) en `https://hub.juanfu224.workers.dev`.

### Objetivos no funcionales
- Latencia p95: N/A (sitio estático; no hay SLO medido en el repo).
- Disponibilidad: N/A (depende del edge de Cloudflare; no hay contrato numérico en el repo).
- Accesibilidad: página en `lang="es"`; nav de enlaces con `aria-label`; no hay auditoría a11y versionada.
- Privacidad (base legal, minimización, retención): sin cookies, sin trackers, sin formularios. Identidad pública del titular en `links.ts` (nombre, email, URLs sociales). No hay store ni retención.
- Idempotencia: N/A (sin mutaciones de servidor).

### Fuera de alcance
- Backend, API, auth, sesiones, cookies, analytics, formularios.
- Dominio personalizado (documentado como posterior; no implementado).
- Tailwind, Shiki, estilos inline, CDNs de iconos.

## 2. Arquitectura

- Estilo: sitio estático (Astro 7, TypeScript estricto, CSS propio, fuente `@fontsource/source-serif-pro` autoalojada).
- Límites de confianza: navegador (HTML/CSS/JS estático) | edge Cloudflare Workers (assets `./dist`) | CI GitHub Actions (secrets `CLOUDFLARE_*` solo en el host).
- Diagrama (texto):

```
navegador → Worker assets-only (dist/)
contenido ← src/data/links.ts + src/pages/index.astro
build     ← npm run build (Astro) → wrangler deploy / GHA
```

- Integraciones: Cloudflare Workers (salida, sin PII en runtime de producto; auth de deploy en CI). Sitemap `@astrojs/sitemap`. Sin webhooks.

## 3. Modelo de datos

### Entidades
| Entidad | Invariantes | PII |
|---|---|---|
| Profile | `name`, `bio`, `avatar` path misma-origen; `siteUrl` origen https sin path/query/hash; `email` opcional | Sí (identidad pública del titular) |
| SocialLink | `id`, `label`, `url` con esquema permitido; `external` derivado del esquema | URLs públicas; `mailto:` expone email |
| presentation | `socialIds`, `cardPriority`, `cardExcluded` referencian `id` de `links` | No |

### Enums / máquinas de estado
| Máquina | Estados | Transiciones legales | Ilegales |
|---|---|---|---|
| N/A | N/A | N/A | N/A |

### Persistencia
- Motor: N/A (datos en código; sin BD).
- Transacciones obligatorias cuando: N/A.
- Claves / unicidad: `id` de cada `SocialLink` en el array `links`.

## 4. API / contratos

- Auth: N/A (sin API).
- Versionado: N/A.
- Errores: fallos de contrato de `links.ts` lanzan en build/arranque (no hay API HTTP de producto).
- Endpoints:

| Método | Ruta | Auth | Idempotente | Notas |
|---|---|---|---|---|
| N/A | N/A | N/A | N/A | Sin backend. Página: `src/pages/index.astro`. |

## 5. Flujos

1. Render de portada: `index.astro` lee `profile` y `getCardLinks()` / `getSocialLinks()` → layout `BaseLayout` (canonical/OG desde `Astro.site` o `profile.siteUrl`) → HTML estático.
2. Deploy producción: `npm run build` genera `dist/`; `wrangler deploy` o job GHA `deploy` en push a `main` / `workflow_dispatch` con `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` (HITL de infra si se cambia IaC/URL).
3. Personalización de contenido: editar `src/data/links.ts` y assets en `public/`; mantener `profile.siteUrl` = `site` en `astro.config.mjs` = `Sitemap:` en `public/robots.txt`.

## 6. No funcionales detallados

- Rate limit: N/A.
- Observabilidad (qué no loguear): N/A en producto. CI no debe imprimir secretos `CLOUDFLARE_*` ni `.env`.
- Backups / RPO / RTO: N/A (artefacto estático; fuente = git).
- Cabeceras (`public/_headers`): `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, COOP/CORP, caché `/_astro/*`. CSP en `astro.config.mjs` (`security.csp`); no duplicar CSP en `_headers`.
- Enlaces externos: `rel="noopener noreferrer"` + `referrerpolicy="no-referrer"` (README; componentes).

## 7. Estrategia de pruebas

Qué **debe fallar** si se rompe el contrato:

| Contrato | Test / comando |
|---|---|
| Tipos / contrato Astro | `npm run check` (`astro check`) |
| Build estático | `npm run build` |
| Esquemas de URL / avatar / `siteUrl` | asserts en `src/data/links.ts` al importar (fallo de build/arranque) |
| Auditoría deps (CI) | `npm audit --omit=dev --audit-level=high` |
| Suite unitaria / e2e | N/A (no hay runner en `package.json`) |

Cobertura mínima de transiciones de estado: N/A (no hay máquina de estados).
