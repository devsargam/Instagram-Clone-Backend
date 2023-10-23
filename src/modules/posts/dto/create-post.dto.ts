import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1),
  caption: z.string().min(1),
});

// Making it required since it gives error
export type CreatePostDto = Required<z.infer<typeof createPostSchema>>;
