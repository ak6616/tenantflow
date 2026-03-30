"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getStoredUser, getStoredTenant, isAuthenticated, logout as apiLogout } from "./api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Tenant {
  id: string;
  slug: string;
  name: string;
  plan: string;
}

interface AuthContextValue {
  user: User | null;
  tenant: Tenant | null;
  isLoggedIn: boolean;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  tenant: null,
  isLoggedIn: false,
  logout: () => {},
  refresh: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const refresh = useCallback(() => {
    setUser(getStoredUser());
    setTenant(getStoredTenant());
    setIsLoggedIn(isAuthenticated());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    apiLogout();
  }, []);

  return (
    <AuthContext.Provider value={{ user, tenant, isLoggedIn, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
