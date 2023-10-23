import { z } from 'zod';

export const updatePostSchema = z.object({
  title: z.string().optional(),
  caption: z.string().optional(),
});

export type UpdatePostDto = z.infer<typeof updatePostSchema>;
