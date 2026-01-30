import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

const APP_NAME = 'Health Tracker';

/**
 * Generate a new TOTP secret for a user
 */
export function generateTOTPSecret(userEmail: string): OTPAuth.TOTP {
  const secret = new OTPAuth.Secret({ size: 20 });
  
  const totp = new OTPAuth.TOTP({
    issuer: APP_NAME,
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  });

  return totp;
}

/**
 * Create a TOTP instance from an existing secret
 */
export function createTOTPFromSecret(secret: string, userEmail: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: APP_NAME,
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
}

/**
 * Verify a TOTP token
 * Returns delta (0 for exact match, -1 for previous period, +1 for next period)
 * Returns null if invalid
 */
export function verifyTOTP(secret: string, token: string, userEmail: string): number | null {
  const totp = createTOTPFromSecret(secret, userEmail);
  
  // Allow 1 period window (30 seconds before and after)
  const delta = totp.validate({ token, window: 1 });
  
  return delta;
}

/**
 * Generate a QR code data URL for the TOTP setup
 */
export async function generateQRCode(totp: OTPAuth.TOTP): Promise<string> {
  const uri = totp.toString();
  
  try {
    const qrDataUrl = await QRCode.toDataURL(uri, {
      width: 200,
      margin: 2,
      color: {
        dark: '#011627',
        light: '#ffffff',
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Get the secret in Base32 format for manual entry
 */
export function getSecretBase32(totp: OTPAuth.TOTP): string {
  return totp.secret.base32;
}

/**
 * Format secret for display (groups of 4 characters)
 */
export function formatSecretForDisplay(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(' ') || secret;
}

/**
 * Generate backup codes
 */
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar chars
  
  for (let i = 0; i < count; i++) {
    let code = '';
    for (let j = 0; j < 8; j++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    // Format as XXXX-XXXX
    codes.push(code.slice(0, 4) + '-' + code.slice(4));
  }
  
  return codes;
}

/**
 * Hash a backup code for storage (simple hash for demo)
 * In production, use a proper hashing library like bcrypt
 */
export function hashBackupCode(code: string): string {
  // Remove dash and uppercase
  const normalized = code.replace('-', '').toUpperCase();
  // Simple hash for demo - in production use bcrypt
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + normalized.length;
}

/**
 * Verify a backup code against stored hashes
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): number {
  const hash = hashBackupCode(code);
  return hashedCodes.findIndex(h => h === hash);
}
