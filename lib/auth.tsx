"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Operasyon" | "Destek" | "Satın Alma";
  department: string;
  avatar: string;
};

type AuthCtx = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  login: async () => false,
  logout: () => {}
});

const DEMO_USERS: AuthUser[] = [
  { id: "u1", name: "Ahmet Demir", email: "ahmet@opsmind.com", role: "Admin", department: "Yönetim", avatar: "AD" },
  { id: "u2", name: "Selin Kaya", email: "selin@opsmind.com", role: "Operasyon", department: "Kargo & Lojistik", avatar: "SK" },
  { id: "u3", name: "Barış Arslan", email: "baris@opsmind.com", role: "Destek", department: "Müşteri Hizmetleri", avatar: "BA" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem("opsmind_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, pathname]);

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    const found = DEMO_USERS.find(u => u.email === email);
    if (found && password.length >= 4) {
      setUser(found);
      localStorage.setItem("opsmind_user", JSON.stringify(found));
      router.push("/");
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("opsmind_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
