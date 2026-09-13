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
};
