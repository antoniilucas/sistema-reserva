import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authService } from "../services/auth.service";
import { userRepository } from "../repositories/user.repository";
import { AppError } from "../utils/AppError";

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Não autenticado", 401);
    const user = await userRepository.findById(req.user.id);
    if (!user) throw new AppError("Usuário não encontrado", 404);
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  }),
};
