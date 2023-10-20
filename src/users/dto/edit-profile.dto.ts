import { z } from 'zod';

export const editProfileSchema = z.object({
  website: z
    .string()
    .url()
    .max(128, 'Link must be no longer than 128 characters')
    .optional(),
  bio: z
    .string()
    .max(150, 'Bio must be no longer than 150 characters')
    .optional(),
  gender: z
    .enum(['male', 'female', 'rather not say'])
    .default('rather not say'),
  receiveMarkettingEmails: z.boolean().default(true),
  accountType: z.enum(['private', 'public']).default('public'),
});

export type editProfileDto = z.infer<typeof editProfileSchema>;
