import { api } from "./api";
import { SupportRequest } from "../types";

export const supportService = {
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get<SupportRequest[]>("/support", { params });
    return data;
  },
  create: async (payload: any) => {
    const { data } = await api.post<SupportRequest>("/support", payload);
    return data;
  },
  updateStatus: async (id: string, status: string) => {
    const { data } = await api.patch<SupportRequest>(`/support/${id}/status`, { status });
    return data;
  },
};
