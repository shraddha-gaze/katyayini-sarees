import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as api from "@/lib/api";
import { supabase } from "@/lib/supabase";

interface AuthState {
  user: api.SessionUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<api.SessionUser>;
  signUp: (name: string, email: string, password: string) => Promise<api.SessionUser | null>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<api.SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser(await api.getSessionUser());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const sub = supabase?.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        // Run outside the auth callback; Supabase warns against awaiting inside it.
        setTimeout(refresh, 0);
      }
    });
    return () => sub?.data.subscription.unsubscribe();
  }, [refresh]);

  const value: AuthState = {
    user,
    loading,
    refresh,
    async signIn(email, password) {
      const u = await api.signIn(email, password);
      setUser(u);
      return u;
    },
    async signUp(name, email, password) {
      const u = await api.signUp(name, email, password);
      setUser(u);
      return u;
    },
    async signOut() {
      await api.signOut();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
