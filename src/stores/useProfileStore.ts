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
    set({ 
      profile: prevProfile ? { ...prevProfile, ...data } as Profile : { id: userId, ...data } as Profile,
      saving: true, 
      error: null 
    });

    try {
      console.log('updateProfile called for userId:', userId);
      console.log('Data to save:', data);

      // First check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking existing profile:', fetchError);
      }

      console.log('Existing profile:', existingProfile);

      let result;
      
      if (existingProfile) {
        console.log('Updating existing profile...');
        // Update existing profile
        result = await supabase
          .from('profiles')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      } else {
        console.log('Creating new profile...');
        // Insert new profile
        result = await supabase
          .from('profiles')
          .insert({
            id: userId,
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
      }

      console.log('Save result:', result);

      if (result.error) {
        console.error('Profile save error:', result.error);
        throw result.error;
      }
      
      // Refetch to get the complete updated profile
      await get().fetchProfile(userId);
      set({ saving: false });
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      // Revert on failure
      set({ profile: prevProfile, saving: false, error: getErrorMessage(error) });
      return false;
    }
  },
}));
