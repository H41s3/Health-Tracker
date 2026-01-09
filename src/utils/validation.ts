import { z } from 'zod';

/**
 * Common validation schemas
 */

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

// Stronger password requirements for better security
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[0-9]/, 'Password must include a number');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .trim();

/**
 * Auth validation schemas
 */
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  fullName: nameSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Password strength calculator
 */
export function getPasswordStrength(password: string): {
  score: number; // 0-4
  label: 'weak' | 'fair' | 'good' | 'strong';
  color: string;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length === 0) {
    return { score: 0, label: 'weak', color: '#5f7e97', feedback: ['Enter a password'] };
  }

  // Length checks
  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters');

  if (password.length >= 12) score += 1;

  // Character type checks
  if (/[a-z]/.test(password)) score += 0.5;
  else feedback.push('Add a lowercase letter');

  if (/[A-Z]/.test(password)) score += 0.5;
  else feedback.push('Add an uppercase letter');

  if (/[0-9]/.test(password)) score += 0.5;
  else feedback.push('Add a number');

  if (/[^a-zA-Z0-9]/.test(password)) score += 0.5;
  
  // Cap at 4
  score = Math.min(Math.round(score), 4);

  const labels: Array<'weak' | 'fair' | 'good' | 'strong'> = ['weak', 'weak', 'fair', 'good', 'strong'];
  const colors = ['#ff5874', '#ff5874', '#ffcb6b', '#7fdbca', '#addb67'];

  return {
    score,
    label: labels[score],
    color: colors[score],
    feedback: score >= 3 ? [] : feedback,
  };
}

/**
 * Health metrics validation
 */
export const healthMetricSchema = z.object({
  steps: z.number().int().min(0).max(100000).optional(),
  calories_consumed: z.number().min(0).max(50000).optional(),
  calories_burned: z.number().min(0).max(50000).optional(),
  water_ml: z.number().int().min(0).max(20000).optional(),
  weight_kg: z.number().min(0).max(500).optional(),
  sleep_hours: z.number().min(0).max(24).optional(),
  mood_rating: z.number().int().min(1).max(5).optional(),
  mood_notes: z.string().max(1000).optional(),
});

/**
 * Date validation (YYYY-MM-DD format)
 */
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
  .refine((date) => !isNaN(Date.parse(date)), 'Invalid date');

/**
 * Time validation (HH:MM format)
 */
export const timeSchema = z
  .string()
  .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)');

/**
 * Helper function to validate and get errors
 */
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  
  // Map Zod errors to field errors
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });

  return { success: false, errors };
}
