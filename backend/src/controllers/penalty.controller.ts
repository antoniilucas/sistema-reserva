import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { penaltyService } from "../services/penalty.service";

export const penaltyController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await penaltyService.create(req.user!.id, req.body);
    res.status(201).json(created);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const updated = await penaltyService.update(req.user!.id, req.params.id, req.body);
    res.json(updated);
  }),
  cancel: asyncHandler(async (req: Request, res: Response) => {
    const cancelled = await penaltyService.cancel(req.user!.id, req.params.id);
    res.json(cancelled);
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
