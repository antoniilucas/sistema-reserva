import { api } from "./api";
import { ReportOverview } from "../types";

export const reportService = {
  overview: async () => {
    const { data } = await api.get<ReportOverview>("/reports/overview");
    return data;
  },
};
