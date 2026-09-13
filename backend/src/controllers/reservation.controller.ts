import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { reservationService } from "../services/reservation.service";

export const reservationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { status, environmentId, from, to, mine } = req.query;
    const filters: any = {
      status: status as any,
      environmentId: environmentId as string,
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
    };
    if (mine === "true" || req.user!.role === "SOLICITANTE") {
      filters.requesterId = req.user!.id;
    }
    const reservations = await reservationService.list(filters);
    res.json(reservations);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const reservation = await reservationService.getById(req.params.id);
    res.json(reservation);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await reservationService.create({ id: req.user!.id, role: req.user!.role }, req.body);
    res.status(201).json(created);
  }),

  createRecurring: asyncHandler(async (req: Request, res: Response) => {
    const result = await reservationService.createRecurring({ id: req.user!.id, role: req.user!.role }, req.body);
    res.status(201).json(result);
  }),

  createChain: asyncHandler(async (req: Request, res: Response) => {
    const result = await reservationService.createChain({ id: req.user!.id, role: req.user!.role }, req.body);
    res.status(201).json(result);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const updated = await reservationService.update({ id: req.user!.id, role: req.user!.role }, req.params.id, req.body);
    res.json(updated);
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const updated = await reservationService.cancel(
      { id: req.user!.id, role: req.user!.role },
      req.params.id,
      req.body.reason
    );
    res.json(updated);
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    const updated = await reservationService.approve({ id: req.user!.id, role: req.user!.role }, req.params.id);
    res.json(updated);
  }),

  reject: asyncHandler(async (req: Request, res: Response) => {
    const updated = await reservationService.reject(
      { id: req.user!.id, role: req.user!.role },
      req.params.id,
      req.body.reason
    );
    res.json(updated);
  }),

  checkIn: asyncHandler(async (req: Request, res: Response) => {
    const updated = await reservationService.checkIn({ id: req.user!.id, role: req.user!.role }, req.params.id);
    res.json(updated);
  }),

  checkOut: asyncHandler(async (req: Request, res: Response) => {
    const updated = await reservationService.checkOut(
      { id: req.user!.id, role: req.user!.role },
      req.params.id,
      req.body.checklist
    );
    res.json(updated);
  }),

  pendingApprovals: asyncHandler(async (_req: Request, res: Response) => {
    const pending = await reservationService.pendingApprovals();
    res.json(pending);
  }),
};
