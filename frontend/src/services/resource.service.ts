import { api } from "./api";
import { Resource } from "../types";

export const resourceService = {
  list: async (activeOnly = false) => {
    const { data } = await api.get<Resource[]>("/resources", { params: { activeOnly } });
    return data;
  },
  create: async (payload: any) => {
    const { data } = await api.post<Resource>("/resources", payload);
    return data;
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.put<Resource>(`/resources/${id}`, payload);
    return data;
  },
  deactivate: async (id: string) => {
    const { data } = await api.delete(`/resources/${id}`);
    return data;
  },
  linkToEnvironment: async (environmentId: string, resourceId: string, mandatory = false) => {
    const { data } = await api.post(`/resources/environments/${environmentId}/link`, { resourceId, mandatory });
    return data;
  },
};
