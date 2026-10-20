import { api } from "./api";
import { Penalty } from "../types";

export const penaltyService = {
  listAll: async () => {
    const { data } = await api.get<Penalty[]>("/penalties");
    return data;
  },
  create: async (payload: any) => {
    const { data } = await api.post<Penalty>("/penalties", payload);
    return data;
  },
  update: async (id: string, payload: { userId: string; reason: string; description: string; blockedUntil: string | null }) => {
    const { data } = await api.put<Penalty>(`/penalties/${id}`, payload);
    return data;
  },
  cancel: async (id: string) => {
    const { data } = await api.post<Penalty>(`/penalties/${id}/cancel`);
    return data;
  },
};
