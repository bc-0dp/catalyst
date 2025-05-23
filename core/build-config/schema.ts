import { z } from 'zod';

// Define the locale schema
const localeSchema = z.object({
  code: z.string(),
  isDefault: z.boolean(),
});

// Define a region's locale settings schema
const regionLocaleSchema = z.object({
  locales: z.array(localeSchema),
  defaultLocale: z.string().optional(),
});

// Define the region locales schema
const regionLocalesSchema = z.record(z.string(), regionLocaleSchema);

// Complete build config schema - now only requires regionLocales
export const buildConfigSchema = z.object({
  regionLocales: regionLocalesSchema,
  // Removed locales field completely
});

export type BuildConfigSchema = z.infer<typeof buildConfigSchema>;
