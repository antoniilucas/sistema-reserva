import { z } from "zod";

export const createSupportSchema = z.object({
  body: z.object({
    reservationId: z.string().uuid(),
    type: z.enum(["TI", "AUDIOVISUAL", "TECNICO_LABORATORIO"]),
    description: z.string().min(3),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const updateSupportStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ABERTA", "ACEITA", "RECUSADA", "EM_ANDAMENTO", "CONCLUIDA"]),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});
