import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { occurrenceService } from "../services/occurrence.service";

export const occurrenceController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await occurrenceService.create(req.user!.id, req.body);
    res.status(201).json(created);
  }),
  listByReservation: asyncHandler(async (req: Request, res: Response) => {
    const occurrences = await occurrenceService.listByReservation(req.params.reservationId);
    res.json(occurrences);
  }),
  listAll: asyncHandler(async (_req: Request, res: Response) => {
    const occurrences = await occurrenceService.listAll();
    res.json(occurrences);
  }),
};
