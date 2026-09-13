import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../config/prisma";

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new AppError("Não autenticado", 401);
    }

    const token = header.split(" ")[1];
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      throw new AppError("Usuário não encontrado", 401);
    }
    if (user.status !== "ATIVO") {
      throw new AppError("Usuário inativo ou bloqueado", 403);
    }

    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError("Token inválido ou expirado", 401));
  }
};
