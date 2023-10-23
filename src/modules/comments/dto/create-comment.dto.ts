import { z } from 'zod';

const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Commment can not be empty')
    .max(2200, 'Comment can be no longer than 2200 characters'),
});

export type CreateCommentDto = Required<z.infer<typeof CreateCommentSchema>>;
