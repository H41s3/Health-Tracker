import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { getErrorMessage } from '../utils/errorHandler';
import {
  generateTOTPSecret,
  getSecretBase32,
  generateQRCode,
  verifyTOTP,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
} from '../utils/totp';

interface TwoFactorSetupData {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

interface TwoFactorState {
  isEnabled: boolean;
  isVerifying: boolean;
  setupData: TwoFactorSetupData | null;
  loading: boolean;
  error: string | null;
  
  // Check if 2FA is enabled for a user
  checkTwoFactorStatus: (userId: string) => Promise<boolean>;
  
  // Initialize 2FA setup (generate secret, QR code, backup codes)
  initializeSetup: (userEmail: string) => Promise<TwoFactorSetupData | null>;
  
  // Complete 2FA setup after verifying the first token
  completeSetup: (userId: string, token: string, userEmail: string) => Promise<boolean>;
  
  // Verify a token during login
  verifyToken: (userId: string, token: string, userEmail: string) => Promise<boolean>;
  
  // Verify using backup code
  verifyWithBackupCode: (userId: string, code: string) => Promise<boolean>;
  
  // Disable 2FA
  disableTwoFactor: (userId: string, token: string, userEmail: string) => Promise<boolean>;
  
  // Clear setup data
  clearSetup: () => void;
}

export const useTwoFactorStore = create<TwoFactorState>((set, get) => ({
  isEnabled: false,
  isVerifying: false,
  setupData: null,
  loading: false,
  error: null,

  checkTwoFactorStatus: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('totp_enabled')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      const isEnabled = data?.totp_enabled || false;
      set({ isEnabled, loading: false });
      return isEnabled;
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
      return false;
    }
  },

  initializeSetup: async (userEmail: string) => {
    set({ loading: true, error: null });
    try {
      const totp = generateTOTPSecret(userEmail);
      const secret = getSecretBase32(totp);
      const qrCode = await generateQRCode(totp);
      const backupCodes = generateBackupCodes(8);

      const setupData: TwoFactorSetupData = {
        secret,
        qrCode,
        backupCodes,
      };

      set({ setupData, loading: false });
      return setupData;
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
      return null;
    }
  },

  completeSetup: async (userId: string, token: string, userEmail: string) => {
    const { setupData } = get();
    if (!setupData) {
      set({ error: 'Setup not initialized' });
      return false;
    }

    set({ loading: true, error: null });
    try {
      // Verify the token first
      const isValid = verifyTOTP(setupData.secret, token, userEmail);
      
      if (isValid === null) {
        set({ error: 'Invalid verification code', loading: false });
        return false;
      }

      // Hash backup codes for storage
      const hashedBackupCodes = setupData.backupCodes.map(hashBackupCode);

      // Store the secret and backup codes in the database
      const { error } = await supabase
        .from('profiles')
        .update({
          totp_secret: setupData.secret,
          totp_enabled: true,
          totp_backup_codes: hashedBackupCodes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      set({ isEnabled: true, setupData: null, loading: false });
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
      return false;
    }
  },

  verifyToken: async (userId: string, token: string, userEmail: string) => {
    set({ isVerifying: true, error: null });
    try {
      // Fetch the stored secret
      const { data, error } = await supabase
        .from('profiles')
        .select('totp_secret')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (!data?.totp_secret) {
        set({ error: '2FA not configured', isVerifying: false });
        return false;
      }

      const isValid = verifyTOTP(data.totp_secret, token, userEmail);
      
      if (isValid === null) {
        set({ error: 'Invalid verification code', isVerifying: false });
        return false;
      }

      set({ isVerifying: false });
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error), isVerifying: false });
      return false;
    }
  },

  verifyWithBackupCode: async (userId: string, code: string) => {
    set({ isVerifying: true, error: null });
    try {
      // Fetch stored backup codes
      const { data, error } = await supabase
        .from('profiles')
        .select('totp_backup_codes')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      const backupCodes = data?.totp_backup_codes || [];
      const codeIndex = verifyBackupCode(code, backupCodes);
      
      if (codeIndex === -1) {
        set({ error: 'Invalid backup code', isVerifying: false });
        return false;
      }

      // Remove the used backup code
      const updatedCodes = [...backupCodes];
      updatedCodes.splice(codeIndex, 1);

      await supabase
        .from('profiles')
        .update({
          totp_backup_codes: updatedCodes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      set({ isVerifying: false });
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error), isVerifying: false });
      return false;
    }
  },

  disableTwoFactor: async (userId: string, token: string, userEmail: string) => {
    set({ loading: true, error: null });
    try {
      // Verify the token first
      const { data } = await supabase
        .from('profiles')
        .select('totp_secret')
        .eq('id', userId)
        .single();

      if (data?.totp_secret) {
        const isValid = verifyTOTP(data.totp_secret, token, userEmail);
        if (isValid === null) {
          set({ error: 'Invalid verification code', loading: false });
          return false;
        }
      }

      // Clear 2FA data
      const { error } = await supabase
        .from('profiles')
        .update({
          totp_secret: null,
          totp_enabled: false,
          totp_backup_codes: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      set({ isEnabled: false, loading: false });
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
      return false;
    }
  },

  clearSetup: () => {
    set({ setupData: null, error: null });
  },
}));
