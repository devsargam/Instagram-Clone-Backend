import { z } from 'zod';

export const editProfileSchema = z.object({
  website: z
    .string()
    .url()
    .max(128, 'Link must be no longer than 128 characters'),
  bio: z.string().max(150, 'Bio must be no longer than 150 characters'),
  gender: z
    .enum(['MALE', 'FEMALE', 'RATHER_NOT_SAY'])
    .default('RATHER_NOT_SAY')
    .transform((str) => str.toUpperCase()),
  receiveMarkettingEmails: z.boolean().default(true),
  accountType: z
    .enum(['PRIVATE', 'PUBLIC'])
    .default('PUBLIC')
    .transform((str) => str.toUpperCase()),
});

export type editProfileDto = z.infer<typeof editProfileSchema>;
