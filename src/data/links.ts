/** Allowed URL schemes for link safety (no javascript:, data:, etc.). */
const ALLOWED_SCHEMES = ["https:", "mailto:", "tel:"] as const;

export type LinkIcon =
  | "instagram"
  | "linkedin"
  | "github"
  | "telegram"
  | "spotify"
  | "mail";

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
   * Until a custom domain exists, use the Cloudflare Pages `*.pages.dev` URL.
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

/** Which links appear in the social row vs torn cards (and card order). */
export const presentation = {
  socialIds: ["mail", "telegram", "linkedin"] as const,
  cardPriority: ["github"] as const,
  cardExcluded: ["mail", "linkedin", "telegram"] as const,
};

/** CSS class for CSP-safe mask icons defined in `global.css`. */
export function iconClass(icon: LinkIcon): string {
  return `icon--${icon}`;
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
  email: "juanfu224@gmail.com",
  /** Keep in sync with `site` in astro.config.mjs and public/robots.txt. */
  siteUrl: "https://hub.juanfu224.workers.dev",
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
    id: "spotify",
    label: "Spotify",
    url: "https://open.spotify.com/user/31qd34klahkpv4qlae4qv654fcwi",
    icon: "spotify",
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
    id: "telegram",
    label: "Telegram",
    url: "https://t.me/juanfu224",
    icon: "telegram",
  }),
  defineLink({
    id: "mail",
    label: "Email",
    url: "mailto:juanfu224@gmail.com",
    icon: "mail",
  }),
];

export function getCardLinks(): SocialLink[] {
  const excluded = new Set<string>(presentation.cardExcluded);
  const priority = presentation.cardPriority as readonly string[];

  return [
    ...priority
      .map((id) => links.find((link) => link.id === id))
      .filter((link): link is SocialLink => Boolean(link)),
    ...links.filter(
      (link) => !excluded.has(link.id) && !priority.includes(link.id),
    ),
  ];
}

export function getSocialLinks(): SocialLink[] {
  return presentation.socialIds
    .map((id) => links.find((link) => link.id === id))
    .filter((link): link is SocialLink => Boolean(link));
}
