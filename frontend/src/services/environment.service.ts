import { api } from "./api";
import { Environment } from "../types";

export const environmentService = {
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get<Environment[]>("/environments", { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get<Environment>(`/environments/${id}`);
    return data;
  },
  create: async (payload: any) => {
    const { data } = await api.post<Environment>("/environments", payload);
    return data;
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.put<Environment>(`/environments/${id}`, payload);
    return data;
  },
  deactivate: async (id: string) => {
    const { data } = await api.delete(`/environments/${id}`);
    return data;
  },
};
