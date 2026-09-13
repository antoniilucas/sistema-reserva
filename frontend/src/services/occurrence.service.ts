import { api } from "./api";
import { Occurrence } from "../types";

export const occurrenceService = {
  create: async (payload: any) => {
    const { data } = await api.post<Occurrence>("/occurrences", payload);
    return data;
  },
  listAll: async () => {
    const { data } = await api.get<Occurrence[]>("/occurrences");
    return data;
  },
  listByReservation: async (reservationId: string) => {
    const { data } = await api.get<Occurrence[]>(`/occurrences/reservation/${reservationId}`);
    return data;
  },
};
