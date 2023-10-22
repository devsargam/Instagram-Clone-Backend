import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string(),
  caption: z.string(),
});

export type CreatePostDto = z.infer<typeof createPostSchema>;
