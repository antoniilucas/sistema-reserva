import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { reportService } from "../services/report.service";

export const reportController = {
  overview: asyncHandler(async (_req: Request, res: Response) => {
    const data = await reportService.overview();
    res.json(data);
  }),
};
