import { z } from "zod";

export const createPenaltySchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    reservationId: z.string().uuid().optional(),
    reason: z.enum(["NO_SHOW", "CANCELAMENTO_TARDIO", "DANO", "INCIDENTE", "OUTRO"]),
    description: z.string().optional(),
    blockedUntil: z.string().optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const updatePenaltySchema = z.object({
  body: z.object({
    userId: z.string().uuid().optional(),
    reason: z.enum(["NO_SHOW", "CANCELAMENTO_TARDIO", "DANO", "INCIDENTE", "OUTRO"]).optional(),
    description: z.string().nullable().optional(),
    blockedUntil: z.string().datetime().nullable().optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});
