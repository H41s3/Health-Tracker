-- Add Two-Factor Authentication columns to profiles table
-- This migration adds TOTP-based 2FA support

-- Add TOTP secret column (encrypted at rest by Supabase)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS totp_secret TEXT DEFAULT NULL;

-- Add TOTP enabled flag
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT FALSE;

-- Add backup codes (stored as hashed values)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS totp_backup_codes TEXT[] DEFAULT NULL;

-- Add index for faster 2FA lookups during authentication
CREATE INDEX IF NOT EXISTS idx_profiles_totp_enabled ON profiles(totp_enabled) WHERE totp_enabled = TRUE;

-- Add comment explaining the columns
COMMENT ON COLUMN profiles.totp_secret IS 'Base32-encoded TOTP secret for two-factor authentication';
COMMENT ON COLUMN profiles.totp_enabled IS 'Whether two-factor authentication is enabled for this user';
COMMENT ON COLUMN profiles.totp_backup_codes IS 'Hashed backup codes for 2FA recovery';

-- Update RLS policies to protect 2FA data
-- Users can only read/update their own 2FA settings
-- The totp_secret should only be visible to the user themselves

-- Create a policy that allows users to view their own 2FA status but not the secret directly
-- (The secret should only be accessed server-side or through specific authenticated functions)
