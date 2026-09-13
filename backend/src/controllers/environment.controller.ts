import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { environmentService } from "../services/environment.service";

export const environmentController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { type, active, search } = req.query;
    const environments = await environmentService.list({
      type: type as any,
      active: active !== undefined ? active === "true" : undefined,
      search: search as string,
    });
    res.json(environments);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const environment = await environmentService.getById(req.params.id);
    res.json(environment);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await environmentService.create(req.user!.id, req.body);
    res.status(201).json(created);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const updated = await environmentService.update(req.user!.id, req.params.id, req.body);
    res.json(updated);
  }),

  deactivate: asyncHandler(async (req: Request, res: Response) => {
    const updated = await environmentService.deactivate(req.user!.id, req.params.id);
    res.json(updated);
  }),
};
