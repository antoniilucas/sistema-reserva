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
    const dateValue = date as string;
    const startValue = startTime as string;
    const endValue = endTime as string;
    const parsedDate = new Date(`${dateValue}T00:00:00Z`);
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(dateValue) && Number.isFinite(parsedDate.getTime()) &&
      parsedDate.toISOString().slice(0, 10) === dateValue;
    const validTime = (value: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
    if (!validDate || !validTime(startValue) || !validTime(endValue)) {
      throw new AppError("Informe uma data e horários válidos", 400);
    }
    const result = await availabilityService.search({
      date: dateValue,
      startTime: startValue,
      endTime: endValue,
      type: environmentType as any,
      role: req.user!.role,
    });
    res.json(result);
  }),
};
