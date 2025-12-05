import { PostgrestError } from '@supabase/supabase-js';
import { AuthError } from '@supabase/supabase-js';

/**
 * Maps Supabase/PostgreSQL error codes to user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  'invalid_credentials': 'Invalid email or password. Please try again.',
  'invalid login credentials': 'Invalid email or password. Please try again.',
  'email_not_confirmed': 'Please check your email to confirm your account before signing in.',
  'email not confirmed': 'Please check your email to confirm your account before signing in.',
  'user_not_found': 'No account found with this email address.',
  'email_already_registered': 'An account with this email already exists.',
  'user already registered': 'An account with this email already exists. Try signing in instead.',
  'weak_password': 'Password is too weak. Please use at least 8 characters.',
  'invalid_email': 'Please enter a valid email address.',
  'signup disabled': 'New signups are currently disabled. Please contact support.',
  
  // Database errors
  '23505': 'This record already exists.',
  '23503': 'Cannot delete this record because it is being used elsewhere.',
  '23502': 'Required field is missing.',
  '42P01': 'Database table not found. Please contact support.',
  'PGRST116': 'No rows found.',
  
  // Network errors
  'fetch failed': 'Network error. Please check your internet connection.',
  'Failed to fetch': 'Network error. Please check your internet connection.',
};

/**
 * Extracts user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred';
  }

  // Handle Supabase AuthError
  if (typeof error === 'object' && 'message' in error) {
    const authError = error as AuthError;
    if (authError.message) {
      const lowerMessage = authError.message.toLowerCase();
      
      // Check for known error patterns
      for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
        if (lowerMessage.includes(key.toLowerCase())) {
          return message;
        }
      }
      
      // Return the error message if it's user-friendly
      if (authError.message.length < 100) {
        return authError.message;
      }
    }
  }

  // Handle PostgrestError
  if (typeof error === 'object' && 'code' in error) {
    const pgError = error as PostgrestError;
    if (pgError.code && ERROR_MESSAGES[pgError.code]) {
      return ERROR_MESSAGES[pgError.code];
    }
    if (pgError.message) {
      return pgError.message;
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    const lowerMessage = error.message.toLowerCase();
    
    for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
      if (lowerMessage.includes(key.toLowerCase())) {
        return message;
      }
    }
    
    return error.message || 'An unexpected error occurred';
  }

  // Handle string errors
  if (typeof error === 'string') {
    const lowerError = error.toLowerCase();
    for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
      if (lowerError.includes(key.toLowerCase())) {
        return message;
      }
    }
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Checks if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('fetch') || error.message.includes('network');
  }
  return false;
}

/**
 * Checks if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (isNetworkError(error)) {
    return true;
  }
  
  if (error && typeof error === 'object' && 'code' in error) {
    const pgError = error as PostgrestError;
    // 5xx errors are usually retryable
    return pgError.code?.startsWith('5') ?? false;
  }
  
  return false;
}

