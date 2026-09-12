import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const SignupSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, 'Display name must be at least 2 characters')
      .max(32, 'Display name must be at most 32 characters'),
    email: z.string().trim().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupInput = z.infer<typeof SignupSchema>;
