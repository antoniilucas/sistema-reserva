import { api } from "./api";
import { Reservation } from "../types";

export const reservationService = {
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get<Reservation[]>("/reservations", { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get<Reservation>(`/reservations/${id}`);
    return data;
  },
  create: async (payload: any) => {
    const { data } = await api.post<Reservation>("/reservations", payload);
    return data;
  },
  createRecurring: async (payload: any) => {
    const { data } = await api.post("/reservations/recurring", payload);
    return data;
  },
  createChain: async (payload: any) => {
    const { data } = await api.post("/reservations/chain", payload);
    return data;
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.put<Reservation>(`/reservations/${id}`, payload);
    return data;
  },
  cancel: async (id: string, reason: string) => {
    const { data } = await api.post<Reservation>(`/reservations/${id}/cancel`, { reason });
    return data;
  },
  approve: async (id: string) => {
    const { data } = await api.post<Reservation>(`/reservations/${id}/approve`);
    return data;
  },
  reject: async (id: string, reason: string) => {
    const { data } = await api.post<Reservation>(`/reservations/${id}/reject`, { reason });
    return data;
  },
  checkIn: async (id: string) => {
    const { data } = await api.post<Reservation>(`/reservations/${id}/check-in`);
    return data;
  },
  checkOut: async (id: string, checklist?: Record<string, boolean>) => {
    const { data } = await api.post<Reservation>(`/reservations/${id}/check-out`, { checklist });
    return data;
  },
  pendingApprovals: async () => {
    const { data } = await api.get<Reservation[]>("/approvals/pending");
    return data;
  },
};
