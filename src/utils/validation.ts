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

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

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
  fullName: nameSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

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
  
  // Safety check: ensure errors array exists before iterating
  if (result.error && result.error.errors) {
    result.error.errors.forEach((err) => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });
  } else {
    // Fallback error message if error structure is unexpected
    errors['general'] = 'Validation failed';
  }

  return { success: false, errors };
}

