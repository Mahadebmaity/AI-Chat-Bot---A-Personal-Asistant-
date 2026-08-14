"use client";
import { useState, useEffect, useCallback } from "react";

export interface UserPreferences {
  defaultModel: string;
  temperature: number; // 0.2 (precise) to 1.0 (creative)
  voiceLanguage: string;
  customInstructions: string;
  responseStyle: string; // e.g. "balanced", "concise", "detailed"
  apiKey?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  joinedDate: number;
  preferences: UserPreferences;
}

interface StoredAccount extends User {
  passwordHash: string;
}

const USERS_STORAGE_KEY = "my-assistant-users";
const SESSION_STORAGE_KEY = "my-assistant-current-user";

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultModel: "gemini-3.7-flash",
  temperature: 0.7,
  voiceLanguage: "en-US",
  customInstructions: "",
  responseStyle: "balanced",
};

// SHA-256 password hashing via Web Crypto API
async function hashPassword(password: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    return btoa(password);
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getStoredUsers(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredAccount[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  // Load session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // ignore
    } finally {
      setIsAuthLoaded(true);
    }
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const users = getStoredUsers();
    const account = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!account) {
      return { success: false, error: "No account found with this email. Please sign up." };
    }

    const hashed = await hashPassword(pass);
    if (account.passwordHash !== hashed) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = account;
    setUser(safeUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
    return { success: true };
  }, []);

  const signup = useCallback(
    async (
      name: string,
      email: string,
      pass: string,
      avatar = "🧑‍💻",
      bio = ""
    ): Promise<{ success: boolean; error?: string }> => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !name.trim() || !pass) {
        return { success: false, error: "Please fill in all required fields." };
      }

      if (pass.length < 4) {
        return { success: false, error: "Password must be at least 4 characters." };
      }

      const users = getStoredUsers();
      if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return { success: false, error: "An account with this email already exists." };
      }

      const hashed = await hashPassword(pass);
      const newUser: StoredAccount = {
        id: "usr_" + Math.random().toString(36).slice(2) + Date.now().toString(36),
        name: name.trim(),
        email: cleanEmail,
        avatar,
        bio: bio.trim(),
        joinedDate: Date.now(),
        passwordHash: hashed,
        preferences: { ...DEFAULT_PREFERENCES },
      };

      users.push(newUser);
      saveStoredUsers(users);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...safeUser } = newUser;
      setUser(safeUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  const updateProfile = useCallback((updates: Partial<Omit<User, "id" | "joinedDate">>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated: User = {
        ...prev,
        ...updates,
        preferences: {
          ...prev.preferences,
          ...(updates.preferences || {}),
        },
      };

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));

      // Update in stored users registry
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === prev.id);
      if (idx !== -1) {
        users[idx] = {
          ...users[idx],
          ...updates,
          preferences: {
            ...users[idx].preferences,
            ...(updates.preferences || {}),
          },
        };
        saveStoredUsers(users);
      }

      return updated;
    });
  }, []);

  const updatePreferences = useCallback((prefUpdates: Partial<UserPreferences>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated: User = {
        ...prev,
        preferences: {
          ...prev.preferences,
          ...prefUpdates,
        },
      };

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));

      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === prev.id);
      if (idx !== -1) {
        users[idx].preferences = {
          ...users[idx].preferences,
          ...prefUpdates,
        };
        saveStoredUsers(users);
      }

      return updated;
    });
  }, []);

  return {
    user,
    isAuthLoaded,
    login,
    signup,
    logout,
    updateProfile,
    updatePreferences,
  };
}
