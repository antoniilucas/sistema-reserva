import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { supportService } from "../services/support.service";

export const supportController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await supportService.create(req.user!.id, req.body);
    res.status(201).json(created);
  }),
  list: asyncHandler(async (req: Request, res: Response) => {
    const { status, mine } = req.query;
    const filters: any = { status: status as any };
    if (mine === "true") filters.requestedById = req.user!.id;
    const requests = await supportService.list(filters);
    res.json(requests);
  }),
  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const updated = await supportService.updateStatus(req.user!.id, req.params.id, req.body.status);
    res.json(updated);
  }),
};
