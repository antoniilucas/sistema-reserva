import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { auditRepository } from "../repositories/audit.repository";

export const auditController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { userId, entity, entityId, from, to } = req.query;
    const logs = await auditRepository.list({
      userId: userId as string,
      entity: entity as string,
      entityId: entityId as string,
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
    });
    res.json(logs);
  }),
};
