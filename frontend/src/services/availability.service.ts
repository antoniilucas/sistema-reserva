import { api } from "./api";
import { Environment } from "../types";

export interface AvailabilityResult {
  available: Environment[];
  unavailable: { environment: Environment; reason?: string }[];
  suggestions: { environment: Environment; startTime: string; endTime: string }[];
}

export const availabilityService = {
  search: async (params: { date: string; startTime: string; endTime: string; environmentType?: string }) => {
    const { data } = await api.get<AvailabilityResult>("/availability", { params });
    return data;
  },
};
