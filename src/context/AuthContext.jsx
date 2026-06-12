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
  // We start logged-OUT on both the server and the very first client render.
  // This keeps SSR markup and the first hydration pass identical (no mismatch),
  // and — crucially — the login screen is shown immediately instead of being
  // hidden behind a "loading" spinner that depends on an effect firing.
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);

  // After mount, restore any saved session. If this effect is delayed or never
  // runs, the worst case is that the user simply sees the login screen (and can
  // log in normally) — never an endless spinner.
  useEffect(() => {
    const session = getStoredSession();
    if (session?.user && session?.token) {
      setUser(session.user);
      setToken(session.token);
    }
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
    loading: false, // auth is synchronous (hardcoded) — nothing to wait for
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