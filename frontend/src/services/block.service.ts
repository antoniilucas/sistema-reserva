import { api } from "./api";
import { ScheduleBlock } from "../types";

export const blockService = {
  list: async (environmentId?: string) => {
    const { data } = await api.get<ScheduleBlock[]>("/blocks", { params: { environmentId } });
    return data;
  },
  create: async (payload: any) => {
    const { data } = await api.post<ScheduleBlock>("/blocks", payload);
    return data;
  },
  remove: async (id: string) => {
    await api.delete(`/blocks/${id}`);
  },
};
