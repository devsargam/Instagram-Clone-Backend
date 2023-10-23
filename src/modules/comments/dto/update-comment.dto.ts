import { z } from 'zod';

const UpdateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Commment can not be empty')
    .max(2200, 'Comment can be no longer than 2200 characters'),
});

export type UpdateCommentDto = z.infer<typeof UpdateCommentSchema>;
