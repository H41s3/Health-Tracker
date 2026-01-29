import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Profile, Gender } from '../types/database';
import { getErrorMessage } from '../utils/errorHandler';

interface ProfileUpdateData {
  full_name?: string | null;
  date_of_birth?: string | null;
  gender?: Gender | null;
  height_cm?: number | null;
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, data: ProfileUpdateData) => Promise<boolean>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,
  saving: false,
  error: null,

  fetchProfile: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      set({ profile: data, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  updateProfile: async (userId: string, data: ProfileUpdateData) => {
    const prevProfile = get().profile;
    
    // Optimistic update
    if (prevProfile) {
      set({ 
        profile: { ...prevProfile, ...data } as Profile,
        saving: true, 
        error: null 
      });
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...data,
        });

      if (error) throw error;
      
      // Refetch to get the complete updated profile
      await get().fetchProfile(userId);
      set({ saving: false });
      return true;
    } catch (error) {
      // Revert on failure
      set({ profile: prevProfile, saving: false, error: getErrorMessage(error) });
      return false;
    }
  },
}));
