import { api } from "./api";
import { User } from "../types";

export const userService = {
  updateOwnProfile: async (name: string) => {
    const { data } = await api.patch<User>("/users/me", { name });
    return data;
  },
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get<User[]>("/users", { params });
    return data;
  },
  create: async (payload: any) => {
    const { data } = await api.post<User>("/users", payload);
    return data;
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.put<User>(`/users/${id}`, payload);
    return data;
  },
  updateStatus: async (id: string, status: string) => {
    const { data } = await api.patch<User>(`/users/${id}/status`, { status });
    return data;
  },
};
