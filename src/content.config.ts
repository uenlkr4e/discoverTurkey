import { defineCollection, reference, type SchemaContext } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { SEASONS } from './lib/season';

// Tests point this at generated fixtures; editors always work in src/content.
const root = process.env.CONTENT_DIR ?? './src/content';
const markdownIn = (dir: string) => glob({ base: `${root}/${dir}`, pattern: '**/[^_]*.md' });

const status = z.enum(['draft', 'in-review', 'published']).default('draft');
const reviewRule = {
  check: (d: { status: string; reviewedBy?: string; reviewedAt?: Date }) =>
    d.status !== 'published' || Boolean(d.reviewedBy && d.reviewedAt),
  message: 'Published entries need reviewedBy and reviewedAt',
};

const heroImage = (image: SchemaContext['image']) =>
  z.object({
    src: image(),
    alt: z.string().trim().min(1, 'Alt text is required'),
    credit: z.object({
      author: z.string().trim().min(1),
      sourceUrl: z.url(),
      license: z.string().trim().min(1),
    }),
  });

const editorial = (image: SchemaContext['image']) => ({
  title: z.string().trim().min(1),
  summary: z.string().trim().min(50).max(160),
  heroImage: heroImage(image),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().trim().max(60).optional(),
  seoDescription: z.string().trim().min(50).max(160).optional(),
  author: reference('authors'),
  status,
  reviewedBy: z.string().trim().min(1).optional(),
  reviewedAt: z.coerce.date().optional(),
  publishedAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date(),
  relatedDestinations: z.array(reference('destinations')).default([]),
  relatedGuides: z.array(reference('guides')).default([]),
  relatedItineraries: z.array(reference('itineraries')).default([]),
});

const destinations = defineCollection({
  loader: markdownIn('destinations'),
  schema: ({ image }) =>
    z
      .object({
        ...editorial(image),
        region: reference('regions'),
        interests: z.array(reference('interests')).min(1),
        bestTimeToVisit: z.object({
          summary: z.string().trim().min(1),
          spring: z.string().trim().min(1),
          summer: z.string().trim().min(1),
          autumn: z.string().trim().min(1),
          winter: z.string().trim().min(1),
        }),
        suggestedDuration: z.string().trim().min(1),
        // Bounding box of Turkey, to catch swapped or mistyped coordinates.
        coordinates: z.object({ lat: z.number().min(35).max(43), lng: z.number().min(25).max(45) }),
        gettingThere: z.string().trim().min(1),
        gettingAround: z.string().trim().min(1),
        attractions: z.array(z.object({ name: z.string().trim().min(1), description: z.string().trim().min(1) })).min(1),
        foodAndExperiences: z.string().trim().min(1),
        featured: z.boolean().default(false),
        seasonalHighlight: z.object({ season: z.enum(SEASONS), text: z.string().trim().min(1) }).optional(),
      })
      .refine(reviewRule.check, { message: reviewRule.message, path: ['status'] }),
});

const guides = defineCollection({
  loader: markdownIn('guides'),
  schema: ({ image }) =>
    z
      .object({
        ...editorial(image),
        category: reference('guideCategories'),
        // Reviewer checklist of time-sensitive claims; shown only on draft previews.
        factsToVerify: z.array(z.string()).default([]),
      })
      .refine(reviewRule.check, { message: reviewRule.message, path: ['status'] }),
});

const itineraries = defineCollection({
  loader: markdownIn('itineraries'),
  schema: ({ image }) =>
    z
      .object({
        ...editorial(image),
        days: z.number().int().min(1).max(30),
        interests: z.array(reference('interests')).min(1),
        stops: z
          .array(
            z.object({
              day: z.number().int().min(1),
              destination: reference('destinations'),
              title: z.string().trim().min(1),
              plan: z.string().trim().min(1),
            }),
          )
          .min(1),
      })
      .refine(reviewRule.check, { message: reviewRule.message, path: ['status'] })
      .refine((d) => d.stops.every((s) => s.day <= d.days), {
        message: 'A stop is scheduled after the last day of the itinerary',
        path: ['stops'],
      }),
});

const pages = defineCollection({
  loader: markdownIn('pages'),
  schema: z
    .object({
      title: z.string().trim().min(1),
      summary: z.string().trim().min(50).max(160),
      status,
      reviewedBy: z.string().trim().min(1).optional(),
      reviewedAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date(),
      inSitemap: z.boolean().default(true),
    })
    .refine(reviewRule.check, { message: reviewRule.message, path: ['status'] }),
});

const authors = defineCollection({
  loader: glob({ base: `${root}/authors`, pattern: '*.yaml' }),
  schema: z.object({ name: z.string().trim().min(1), role: z.string().trim().min(1), bio: z.string().trim().min(1) }),
});

const taxonomy = z.object({ name: z.string().trim().min(1), description: z.string().trim().min(50).max(160) });
const regions = defineCollection({ loader: file('src/data/regions.yaml'), schema: taxonomy });
const interests = defineCollection({ loader: file('src/data/interests.yaml'), schema: taxonomy });
const guideCategories = defineCollection({ loader: file('src/data/guide-categories.yaml'), schema: taxonomy });

export const collections = {
  destinations,
  guides,
  itineraries,
  pages,
  authors,
  regions,
  interests,
  guideCategories,
};
