import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type SystemRole = "admin" | "estimator";
export type EstimatorPersona = "BA/PMO" | "Developer";

export interface User {
  username: string;
  systemRole: SystemRole;
  persona?: EstimatorPersona; // only for estimators
}

export type UserEntry = {
  password: string;
  systemRole: SystemRole;
  persona?: EstimatorPersona;
};

type UserMap = Record<string, UserEntry>;

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  users: UserMap;
  upsertUser: (username: string, entry: UserEntry) => void;
  deleteUser: (username: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USERS: UserMap = {
  admin: { password: "admin123", systemRole: "admin" },
  ba:    { password: "ba123",    systemRole: "estimator", persona: "BA/PMO" },
  dev:   { password: "dev123",   systemRole: "estimator", persona: "Developer" },
};

const STORAGE_USER_KEY = "auth_user";
const STORAGE_USERS_KEY = "auth_users";

function loadUsers(): UserMap {
  const raw = localStorage.getItem(STORAGE_USERS_KEY);
  if (!raw) return DEFAULT_USERS;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as UserMap;
  } catch {}
  return DEFAULT_USERS;
}

function saveUsers(map: UserMap) {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(map));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserMap>({});

  useEffect(() => {
    setUsers(loadUsers());
    const rawUser = localStorage.getItem(STORAGE_USER_KEY);
    if (rawUser) {
      try { setUser(JSON.parse(rawUser) as User); } catch {}
    }
  }, []);

  const login = async (username: string, password: string) => {
    const entry = users[username];
    if (entry && entry.password === password) {
      const u: User = { username, systemRole: entry.systemRole, persona: entry.persona };
      setUser(u);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(u));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_USER_KEY);
  };

  const upsertUser = (username: string, entry: UserEntry) => {
    const next = { ...users, [username]: entry };
    setUsers(next);
    saveUsers(next);
  };

  const deleteUser = (username: string) => {
    const next = { ...users };
    delete next[username];
    setUsers(next);
    saveUsers(next);
    if (user?.username === username) logout();
  };

  const value = useMemo(
    () => ({ user, login, logout, users, upsertUser, deleteUser }),
    [user, users]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
