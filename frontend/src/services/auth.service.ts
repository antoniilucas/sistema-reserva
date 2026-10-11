import { api } from "./api";
import { User } from "../types";

export const authService = {
  register: async (name: string, email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: User }>("/auth/register", { name, email, password });
    return data;
  },
  login: async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
    return data;
  },
  me: async () => {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
};
