import { getCollection } from "astro:content";

export async function getProfile() {
  const profiles = await getCollection("profile");
  if (profiles.length !== 1) {
    throw new Error(`[profile] Expected exactly one profile.yaml, found ${profiles.length}`);
  }
  return profiles[0];
}

/** Homepage sections in display order. Duplicate `order` fails the build. */
export async function getHomeSections() {
  const sections = await getCollection("sections");
  const seen = new Set<number>();

  for (const section of sections) {
    const order = section.data.order;
    if (seen.has(order)) {
      throw new Error(`[sections] Duplicate order ${order} on "${section.id}"`);
    }
    seen.add(order);
  }

  return sections.sort((a, b) => a.data.order - b.data.order);
}

/** Content pages for the shell nav. Ordered pages come first; the rest by id. */
export async function getContentPages() {
  const pages = await getCollection("pages");
  return pages.sort((a, b) => {
    const orderA = a.data.order ?? Number.POSITIVE_INFINITY;
    const orderB = b.data.order ?? Number.POSITIVE_INFINITY;
    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id, "es");
  });
}
