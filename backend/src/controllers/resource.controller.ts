import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { resourceService } from "../services/resource.service";

export const resourceController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const resources = await resourceService.list(req.query.activeOnly === "true");
    res.json(resources);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await resourceService.create(req.user!.id, req.body);
    res.status(201).json(created);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const updated = await resourceService.update(req.user!.id, req.params.id, req.body);
    res.json(updated);
  }),

  deactivate: asyncHandler(async (req: Request, res: Response) => {
    const updated = await resourceService.deactivate(req.user!.id, req.params.id);
    res.json(updated);
  }),

  linkToEnvironment: asyncHandler(async (req: Request, res: Response) => {
    const link = await resourceService.linkToEnvironment(
      req.params.environmentId,
      req.body.resourceId,
      req.body.mandatory
    );
    res.status(201).json(link);
  }),

  unlinkFromEnvironment: asyncHandler(async (req: Request, res: Response) => {
    await resourceService.unlinkFromEnvironment(req.params.environmentId, req.params.resourceId);
    res.status(204).send();
  }),
};
