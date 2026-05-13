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
 * Generate backup codes using cryptographically secure random values
 */
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomValues = new Uint8Array(count * 8);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < count; i++) {
    let code = '';
    for (let j = 0; j < 8; j++) {
      code += characters[randomValues[i * 8 + j] % characters.length];
    }
    codes.push(code.slice(0, 4) + '-' + code.slice(4));
  }

  return codes;
}

/**
 * Hash a backup code using SHA-256 (Web Crypto API)
 */
export async function hashBackupCode(code: string): Promise<string> {
  const normalized = code.replace('-', '').toUpperCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a backup code against stored hashes
 */
export async function verifyBackupCode(code: string, hashedCodes: string[]): Promise<number> {
  const hash = await hashBackupCode(code);
  return hashedCodes.findIndex(h => h === hash);
}
