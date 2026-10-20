import { createContext, ReactNode, useEffect, useState } from "react";
import { User } from "../types";
import { authService } from "../services/auth.service";
import { userService } from "../services/user.service";

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
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

  async function register(name: string, email: string, password: string) {
    const { token, user: registeredUser } = await authService.register(name, email, password);
    localStorage.setItem("@reserva:token", token);
    localStorage.setItem("@reserva:user", JSON.stringify(registeredUser));
    setUser(registeredUser);
  }

  async function updateName(name: string) {
    const updatedUser = await userService.updateOwnProfile(name);
    localStorage.setItem("@reserva:user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  }

  function logout() {
    localStorage.removeItem("@reserva:token");
    localStorage.removeItem("@reserva:user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateName, logout }}>{children}</AuthContext.Provider>
  );
}
