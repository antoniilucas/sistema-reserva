import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { blockService } from "../services/block.service";

export const blockController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const blocks = await blockService.list(req.query.environmentId as string);
    res.json(blocks);
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await blockService.create(req.user!.id, req.body);
    res.status(201).json(created);
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await blockService.remove(req.user!.id, req.params.id);
    res.status(204).send();
  }),
};
