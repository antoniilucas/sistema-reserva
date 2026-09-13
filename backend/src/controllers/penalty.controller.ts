import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { penaltyService } from "../services/penalty.service";

export const penaltyController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await penaltyService.create(req.user!.id, req.body);
    res.status(201).json(created);
  }),
  listByUser: asyncHandler(async (req: Request, res: Response) => {
    const penalties = await penaltyService.listByUser(req.params.userId);
    res.json(penalties);
  }),
  listAll: asyncHandler(async (_req: Request, res: Response) => {
    const penalties = await penaltyService.listAll();
    res.json(penalties);
  }),
};
