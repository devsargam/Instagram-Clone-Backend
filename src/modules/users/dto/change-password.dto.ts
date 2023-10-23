import { z } from 'zod';

export const changePasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'Incorrect Password' })
    .max(128, { message: 'Incorrect Password' }),
  new_password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(128, { message: 'Password must be no more than 128 characthers' }),
});

export type changePasswordDto = z.infer<typeof changePasswordSchema>;
