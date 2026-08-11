/** Allowed URL schemes for link safety (no javascript:, data:, etc.). */
const ALLOWED_SCHEMES = ["https:", "mailto:", "tel:"] as const;

export type LinkIcon =
  | "instagram"
  | "linkedin"
  | "github"
  | "x"
  | "youtube"
  | "whatsapp"
  | "mail"
  | "web";

export interface Profile {
  name: string;
  bio: string;
  /** Same-origin path only, e.g. `/avatar.webp`. Must match `site` in astro.config.mjs for OG. */
  avatar: string;
  /** Used for SEO / mailto defaults when present. */
  email?: string;
  /**
   * Absolute site origin (https, no trailing slash).
   * Keep in sync with `site` in astro.config.mjs — layout prefers Astro.site.
   */
  siteUrl: string;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: LinkIcon;
  /** Derived from URL scheme: https → true; mailto/tel → false. */
  external: boolean;
}

function assertSafeUrl(url: string, context: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`[links] Invalid URL in ${context}: ${url}`);
  }

  if (!(ALLOWED_SCHEMES as readonly string[]).includes(parsed.protocol)) {
    throw new Error(
      `[links] Disallowed scheme "${parsed.protocol}" in ${context}. Allowed: ${ALLOWED_SCHEMES.join(", ")}`,
    );
  }

  return parsed;
}

function assertHttpsOrigin(url: string, context: string): void {
  const parsed = assertSafeUrl(url, context);
  if (parsed.protocol !== "https:") {
    throw new Error(`[links] ${context} must use https:`);
  }
  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error(
      `[links] ${context} must be an origin only (no path/query/hash), got: ${url}`,
    );
  }
}

function assertSameOriginPath(path: string, context: string): void {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    throw new Error(
      `[links] ${context} must be a same-origin path starting with / (no scheme), got: ${path}`,
    );
  }
}

function isExternalScheme(protocol: string): boolean {
  return protocol === "https:" || protocol === "http:";
}

function defineLink(
  link: Omit<SocialLink, "external"> & { external?: boolean },
): SocialLink {
  const parsed = assertSafeUrl(link.url, `link "${link.id}"`);
  const external = isExternalScheme(parsed.protocol);

  if (link.external !== undefined && link.external !== external) {
    throw new Error(
      `[links] link "${link.id}" external=${link.external} conflicts with scheme ${parsed.protocol}`,
    );
  }

  return {
    id: link.id,
    label: link.label,
    url: link.url,
    icon: link.icon,
    external,
  };
}

export const profile: Profile = {
  name: "Juanfu224",
  bio: "Desarrollador y creador. Encuentra mis redes o escríbeme directamente.",
  avatar: "/avatar.webp",
  email: "hola@tunombre.dev",
  siteUrl: "https://tunombre.dev",
};

assertHttpsOrigin(profile.siteUrl, "profile.siteUrl");
assertSameOriginPath(profile.avatar, "profile.avatar");

if (profile.email) {
  assertSafeUrl(`mailto:${profile.email}`, "profile.email");
}

export const links: SocialLink[] = [
  defineLink({
    id: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/juanfu224/",
    icon: "instagram",
  }),
  defineLink({
    id: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/juan-felipe-arias-aguirre/",
    icon: "linkedin",
  }),
  defineLink({
    id: "github",
    label: "GitHub",
    url: "https://github.com/Juanfu224",
    icon: "github",
  }),
  defineLink({
    id: "youtube",
    label: "YouTube",
    url: "https://youtube.com/@tunombre",
    icon: "youtube",
  }),
  defineLink({
    id: "whatsapp",
    label: "WhatsApp",
    url: "https://wa.me/34600000000",
    icon: "whatsapp",
  }),
  defineLink({
    id: "mail",
    label: "Email",
    url: "mailto:juanfu224@gmail.com",
    icon: "mail",
  }),
];
