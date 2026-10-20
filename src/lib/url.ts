import { z } from "astro/zod";

/** Allowed URL schemes for link safety (no javascript:, data:, etc.). */
const ALLOWED_SCHEMES = ["https:", "mailto:", "tel:"] as const;

type ExternalAttrs = {
  target?: "_blank";
  rel?: "noopener noreferrer";
  referrerpolicy?: "no-referrer";
};

const externalLinkAttrs: ExternalAttrs = {
  target: "_blank",
  rel: "noopener noreferrer",
  referrerpolicy: "no-referrer",
};

export function assertSafeUrl(url: string, context: string): URL {
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

export function assertSameOriginPath(path: string, context: string): void {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    throw new Error(
      `[links] ${context} must be a same-origin path starting with / (no scheme), got: ${path}`,
    );
  }
}

/** https links open in a new tab; mailto and tel stay on the same page. */
export function isExternalScheme(protocol: string): boolean {
  return protocol === "https:" || protocol === "http:";
}

/** Attributes for safe external navigation. Empty for mailto/tel. */
export function externalAttrs(url: string): ExternalAttrs {
  const parsed = assertSafeUrl(url, "link");
  return isExternalScheme(parsed.protocol) ? externalLinkAttrs : {};
}

function issue(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export const safeUrl = z.string().superRefine((url, ctx) => {
  try {
    assertSafeUrl(url, "content");
  } catch (error) {
    ctx.addIssue({ code: "custom", message: issue(error, "Invalid URL") });
  }
});

export const sameOriginPath = z.string().superRefine((path, ctx) => {
  try {
    assertSameOriginPath(path, "avatar");
  } catch (error) {
    ctx.addIssue({ code: "custom", message: issue(error, "Invalid path") });
  }
});
