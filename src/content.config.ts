import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.record(z.any()),
});

export const collections = { blog };
