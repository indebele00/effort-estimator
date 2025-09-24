// src/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export type SystemRole = "admin" | "estimator";
export type EstimatorPersona = "BA/PMO" | "Developer";

export interface User {
  id: string;
  email: string;
  systemRole: SystemRole;
  persona?: EstimatorPersona;
  username?: string | null;
}

export type Profile = {
  id: string;
  username: string | null;
  role: SystemRole;
  persona: EstimatorPersona | null;
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  listProfiles: () => Promise<Profile[]>;
  updateProfile: (id: string, fields: Partial<Pick<Profile, "username" | "role" | "persona">>) => Promise<{ ok: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user;
      if (u) await hydrateUser(u.id, u.email ?? "");
      else setUser(null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user;
      if (u) await hydrateUser(u.id, u.email ?? "");
      else setUser(null);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  async function hydrateUser(uid: string, email: string) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (error) { console.error(error); return; }
    if (!data) {
      const { error: upErr } = await supabase.from("profiles").insert({
        id: uid, username: email, role: "estimator", persona: "Developer"
      });
      if (upErr) console.error(upErr);
      setUser({ id: uid, email, systemRole: "estimator", persona: "Developer", username: email });
      return;
    }
    setUser({
      id: data.id,
      email,
      systemRole: data.role,
      persona: data.persona ?? undefined,
      username: data.username,
    });
  }

  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    if (data.user) await hydrateUser(data.user.id, data.user.email ?? email);
    return { ok: true };
  }

  async function signup(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { ok: false, error: error.message };
    if (data.user) await hydrateUser(data.user.id, data.user.email ?? email);
    return { ok: true };
  }

  async function logout() { await supabase.auth.signOut(); }

  async function listProfiles() {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data as Profile[];
  }

  async function updateProfile(id: string, fields: Partial<Pick<Profile, "username" | "role" | "persona">>) {
    const { error } = await supabase.from("profiles").update(fields).eq("id", id);
    if (error) return { ok: false, error: error.message };
    if (user && user.id === id) {
      setUser({
        ...user,
        systemRole: (fields as any).role ?? user.systemRole,
        persona: (fields as any).persona ?? user.persona,
        username: (fields as any).username ?? user.username,
      });
    }
    return { ok: true };
  }

  const value = useMemo(() => ({
    user, loading, login, signup, logout, listProfiles, updateProfile
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
