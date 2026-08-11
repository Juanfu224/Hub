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
  avatar: string;
  /** Used for SEO / mailto defaults when present. */
  email?: string;
  /** Absolute site origin for Open Graph (no trailing slash). */
  siteUrl: string;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: LinkIcon;
  external: boolean;
}

function assertSafeUrl(url: string, context: string): void {
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
}

export const profile: Profile = {
  name: "Tu Nombre",
  bio: "Desarrollador y creador. Encuentra mis redes o escríbeme directamente.",
  avatar: "/avatar.webp",
  email: "hola@tunombre.dev",
  siteUrl: "https://tunombre.dev",
};

export const links: SocialLink[] = [
  {
    id: "instagram",
    label: "Instagram",
    url: "https://instagram.com/tunombre",
    icon: "instagram",
    external: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    url: "https://linkedin.com/in/tunombre",
    icon: "linkedin",
    external: true,
  },
  {
    id: "github",
    label: "GitHub",
    url: "https://github.com/tunombre",
    icon: "github",
    external: true,
  },
  {
    id: "x",
    label: "X",
    url: "https://x.com/tunombre",
    icon: "x",
    external: true,
  },
  {
    id: "youtube",
    label: "YouTube",
    url: "https://youtube.com/@tunombre",
    icon: "youtube",
    external: true,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    url: "https://wa.me/34600000000",
    icon: "whatsapp",
    external: true,
  },
  {
    id: "mail",
    label: "Email",
    url: "mailto:hola@tunombre.dev",
    icon: "mail",
    external: false,
  },
];

for (const link of links) {
  assertSafeUrl(link.url, `link "${link.id}"`);
}

if (profile.email) {
  assertSafeUrl(`mailto:${profile.email}`, "profile.email");
}
