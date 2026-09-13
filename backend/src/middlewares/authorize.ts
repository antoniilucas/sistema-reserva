import { NextFunction, Request, Response } from "express";
import { RoleName } from "@prisma/client";
import { AppError } from "../utils/AppError";

export const authorize = (...roles: RoleName[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Não autenticado", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Sem permissão para esta ação", 403));
    }
    next();
  };
};
