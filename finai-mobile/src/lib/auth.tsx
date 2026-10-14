import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  /** True until the saved session has been read on launch. */
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setIsLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

/** First name from the profile, falling back to the start of the email. */
export function displayName(user: User | null) {
  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim();
  if (fullName) return fullName;
  return user?.email?.split('@')[0] ?? 'there';
}

/** Turns Supabase error codes into messages a person can act on. */
export function friendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/invalid login credentials/i.test(message)) return 'That email and password don’t match. Try again or reset your password.';
  if (/email not confirmed/i.test(message)) return 'Check your inbox and confirm your email before signing in.';
  if (/user already registered/i.test(message)) return 'An account with this email already exists. Try signing in.';
  if (/password should be at least/i.test(message)) return 'Use a password with at least 8 characters.';
  if (/network|fetch/i.test(message)) return 'Can’t reach the server. Check your connection and try again.';
  return message;
}
