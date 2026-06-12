// src/context/AuthContext.jsx
// Novara Nature Estates — Auth Context
// Hardcoded credentials (no backend required)

import { createContext, useContext, useState, useEffect } from "react";

const TOKEN_KEY = "novaraAuthToken";

// ── Hardcoded users ───────────────────────────────────────────────────────────
const USERS = [
  {
    email: "blogger@gmail.com",
    password: "blogger123",
    role: "blogger",
    name: "Novara Blogger",
  },
];

// ── SSR-safe localStorage helpers ────────────────────────────────────────────
const getStoredSession = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const setStoredSession = (session) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
};
const clearStoredSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
};

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    const session = getStoredSession();
    if (session?.user && session?.token) {
      setUser(session.user);
      setToken(session.token);
    }
    setLoading(false);
  }, []);

  // ── login — checks hardcoded USERS list, no backend call ─────────────────
  const login = async (email, password) => {
    const match = USERS.find(
      (u) => u.email === email.trim() && u.password === password
    );

    if (!match) {
      return { success: false, message: "Invalid email or password." };
    }

    const sessionUser  = { email: match.email, role: match.role, name: match.name };
    const sessionToken = btoa(`${match.email}:${match.role}:${Date.now()}`);

    setStoredSession({ user: sessionUser, token: sessionToken });
    setUser(sessionUser);
    setToken(sessionToken);

    return { success: true, user: sessionUser };
  };

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    clearStoredSession();
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isAdmin:         user?.role === "admin",
    isBlogger:       user?.role === "blogger" || user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}