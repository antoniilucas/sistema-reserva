import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["SOLICITANTE", "GESTOR", "ADMINISTRADOR", "RESPONSAVEL_TECNICO", "SUPORTE"]),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    role: z.enum(["SOLICITANTE", "GESTOR", "ADMINISTRADOR", "RESPONSAVEL_TECNICO", "SUPORTE"]).optional(),
    password: z.string().min(6).optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ATIVO", "INATIVO", "BLOQUEADO"]),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});
