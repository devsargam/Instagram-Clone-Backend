import { z } from 'zod';

export const changeUsernameSchema = z.object({
  new_username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(20, { message: 'Username must be no more than 20 characters' })
    .regex(
      /^[a-zA-Z0-9.]+$/,
      'Username must only contain letters, numbers or a period',
    ),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(128, { message: 'Password must be no more than 128 characthers' }),
});

export type changeUsernameDto = z.infer<typeof changeUsernameSchema>;
