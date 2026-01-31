import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface TwoFactorPendingUser {
  id: string;
  email: string;
}

interface SignInResult {
  error: AuthError | null;
  requires2FA?: boolean;
  pendingUser?: TwoFactorPendingUser;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  twoFactorPending: TwoFactorPendingUser | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  complete2FASignIn: () => void;
  cancel2FASignIn: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [twoFactorPending, setTwoFactorPending] = useState<TwoFactorPendingUser | null>(null);
  // Store session and user temporarily during 2FA verification (don't sign out)
  const [pendingSession, setPendingSession] = useState<Session | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Only set session/user if we're not in 2FA pending state
      if (!twoFactorPending) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Only update if we're not in 2FA pending state
      if (!twoFactorPending) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [twoFactorPending]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (!error && data.user) {
      // Store email for confirmation page
      localStorage.setItem('pendingEmail', email);
      
      // Only try to create profile if user is confirmed (or if email confirmation is disabled)
      // The profile will be auto-created on first login if not created here
      if (data.user.confirmed_at || data.session) {
        try {
          await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: fullName,
          });
        } catch (profileError) {
          console.error('Profile creation failed:', profileError);
          // Don't block signup if profile creation fails - it can be created later
        }
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If login successful, check for 2FA
    if (!error && data.user && data.session) {
      try {
        // Check if profile exists and if 2FA is enabled
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, totp_enabled')
          .eq('id', data.user.id)
          .single();

        // Create profile if it doesn't exist
        if (profileError && profileError.code === 'PGRST116') {
          const fullName = data.user.user_metadata?.full_name || '';
          await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: fullName,
          });
        }

        // Check if 2FA is enabled
        if (profileData?.totp_enabled) {
          // Store session and user temporarily - DON'T sign out
          // The session stays valid, we just block the UI until 2FA is verified
          setPendingSession(data.session);
          setPendingUser(data.user);
          setTwoFactorPending({
            id: data.user.id,
            email: data.user.email || email,
          });
          
          // Don't set user/session in main state yet - this blocks app access
          // until 2FA verification completes
          
          return { 
            error: null, 
            requires2FA: true,
            pendingUser: {
              id: data.user.id,
              email: data.user.email || email,
            }
          };
        }
      } catch (profileError) {
        console.error('Profile check/creation failed:', profileError);
        // Don't block login if profile operations fail
      }
    }

    return { error };
  };

  const complete2FASignIn = () => {
    // 2FA verification successful - activate the stored session
    if (pendingSession && pendingUser) {
      setSession(pendingSession);
      setUser(pendingUser);
    }
    setTwoFactorPending(null);
    setPendingSession(null);
    setPendingUser(null);
  };

  const cancel2FASignIn = async () => {
    // User cancelled 2FA - sign out the pending session
    if (pendingSession) {
      await supabase.auth.signOut();
    }
    setTwoFactorPending(null);
    setPendingSession(null);
    setPendingUser(null);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      twoFactorPending,
      signUp, 
      signIn, 
      complete2FASignIn,
      cancel2FASignIn,
      signOut, 
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
