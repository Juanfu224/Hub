import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { iconNames } from "./lib/icons";
import { safeUrl, sameOriginPath } from "./lib/url";

const profile = defineCollection({
  loader: glob({ pattern: "profile.yaml", base: "./src/content" }),
  schema: z.object({
    name: z.string().min(1),
    bio: z.string().min(1),
    avatar: sameOriginPath,
  }),
});

const linkItem = z.object({
  label: z.string().min(1),
  url: safeUrl,
  icon: z.enum(iconNames),
  summary: z.string().min(1).optional(),
});

const projectItem = z.object({
  label: z.string().min(1),
  url: safeUrl,
  icon: z.enum(iconNames).optional(),
  summary: z.string().min(1),
});

const sectionFields = {
  title: z.string().min(1).optional(),
  order: z.number().int().nonnegative(),
};

const sections = defineCollection({
  loader: glob({ pattern: "**/*.{yaml,yml}", base: "./src/content/sections" }),
  schema: z.discriminatedUnion("variant", [
    z.object({
      ...sectionFields,
      variant: z.literal("icons"),
      items: z.array(linkItem).min(1),
    }),
    z.object({
      ...sectionFields,
      variant: z.literal("cards"),
      items: z.array(linkItem).min(1),
    }),
    z.object({
      ...sectionFields,
      variant: z.literal("projects"),
      items: z.array(projectItem).min(1),
    }),
  ]),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().int().nonnegative().optional(),
  }),
});

export const collections = { profile, sections, pages };
