import { api } from "./api";
import { AuditLog } from "../types";

export const auditService = {
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get<AuditLog[]>("/audit", { params });
    return data;
  },
};
