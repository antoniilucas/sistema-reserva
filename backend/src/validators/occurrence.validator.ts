import { z } from "zod";

export const createOccurrenceSchema = z.object({
  body: z.object({
    reservationId: z.string().uuid(),
    type: z.enum(["DANO", "INCIDENTE", "ATRASO", "FALHA_TECNICA", "LIMPEZA", "OUTRO"]),
    description: z.string().min(3),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});
