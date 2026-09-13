import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { availabilityService } from "../services/availability.service";
import { AppError } from "../utils/AppError";

export const availabilityController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    const { date, startTime, endTime, environmentType } = req.query;
    if (!date || !startTime || !endTime) {
      throw new AppError("Informe date, startTime e endTime", 400);
    }
    const result = await availabilityService.search({
      date: date as string,
      startTime: startTime as string,
      endTime: endTime as string,
      type: environmentType as any,
    });
    res.json(result);
  }),
};
