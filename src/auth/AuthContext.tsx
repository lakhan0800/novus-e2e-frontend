import { createContext, useContext, useState, type ReactNode } from "react";
import { pendo } from "../analytics/pendo";
import { api } from "../api/client";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "owner" | "admin" | "member";
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  plan: "free" | "team" | "enterprise";
  seats: number;
}

interface AuthState {
  user: User | null;
  account: Account | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);

  const login = async (email: string, password: string) => {
    const session = await api.post<{ user: User; account: Account }>("/api/auth/login", {
      email,
      password,
    });
    setUser(session.user);
    setAccount(session.account);
    // Identify first so the event belongs to the signed-in visitor, not an anonymous one.
    pendo.identify({ visitor: { id: session.user.id }, account: { id: session.account.id } });
    pendo.track("user_logged_in", {
      userRole: session.user.role,
      accountPlan: session.account.plan,
      accountSeats: session.account.seats,
      userCreatedAt: session.user.createdAt,
    });
  };

  const logout = () => {
    setUser(null);
    setAccount(null);
  };

  return (
    <AuthContext.Provider value={{ user, account, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
