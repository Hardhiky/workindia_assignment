"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { UserData } from "@/lib/types";

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  login: (email: string, name: string) => Promise<void>;
  logout: () => void;
  upgradeToPremium: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  upgradeToPremium: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, name: string) => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Login failed");
    }

    const data = await res.json();
    const userData: UserData = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      isPremium: data.user.isPremium,
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
  }, []);

  const upgradeToPremium = useCallback(async () => {
    if (!user) return;

    const res = await fetch("/api/user/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Upgrade failed");
    }

    const data = await res.json();
    const updated: UserData = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      isPremium: data.user.isPremium,
    };

    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  }, [user]);

  return (
    <UserContext.Provider value={{ user, loading, login, logout, upgradeToPremium }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
