import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler";
import { userRepository } from "../repositories/user.repository";
import { AppError } from "../utils/AppError";
import { registerAudit } from "../utils/audit";

const sanitize = (u: any) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  status: u.status,
  createdAt: u.createdAt,
});

export const userController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { role, status, search } = req.query;
    const users = await userRepository.list({ role: role as any, status: status as any, search: search as string });
    res.json(users.map(sanitize));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepository.findById(req.params.id);
    if (!user) throw new AppError("Usuário não encontrado", 404);
    res.json(sanitize(user));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new AppError("E-mail já cadastrado", 400);

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await userRepository.create({ name, email, passwordHash, role });

    await registerAudit({ userId: req.user!.id, action: "CRIAR", entity: "User", entityId: created.id, after: sanitize(created) });
    res.status(201).json(sanitize(created));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const existing = await userRepository.findById(req.params.id);
    if (!existing) throw new AppError("Usuário não encontrado", 404);

    const { password, ...rest } = req.body;
    const data: any = { ...rest };
    if (password) data.passwordHash = await bcrypt.hash(password, 10);

    const updated = await userRepository.update(req.params.id, data);
    await registerAudit({ userId: req.user!.id, action: "ATUALIZAR", entity: "User", entityId: updated.id, before: sanitize(existing), after: sanitize(updated) });
    res.json(sanitize(updated));
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const existing = await userRepository.findById(req.params.id);
    if (!existing) throw new AppError("Usuário não encontrado", 404);

    const updated = await userRepository.update(req.params.id, { status: req.body.status });
    await registerAudit({ userId: req.user!.id, action: "ALTERAR_STATUS", entity: "User", entityId: updated.id, before: { status: existing.status }, after: { status: updated.status } });
    res.json(sanitize(updated));
  }),
};
