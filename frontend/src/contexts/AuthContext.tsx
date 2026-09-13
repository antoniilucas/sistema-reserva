import { createContext, ReactNode, useEffect, useState } from "react";
import { User } from "../types";
import { authService } from "../services/auth.service";

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("@reserva:token");
    const storedUser = localStorage.getItem("@reserva:user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      authService
        .me()
        .then((freshUser) => {
          setUser(freshUser);
          localStorage.setItem("@reserva:user", JSON.stringify(freshUser));
        })
        .catch(() => {
          localStorage.removeItem("@reserva:token");
          localStorage.removeItem("@reserva:user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const { token, user: loggedUser } = await authService.login(email, password);
    localStorage.setItem("@reserva:token", token);
    localStorage.setItem("@reserva:user", JSON.stringify(loggedUser));
    setUser(loggedUser);
  }

  function logout() {
    localStorage.removeItem("@reserva:token");
    localStorage.removeItem("@reserva:user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}
