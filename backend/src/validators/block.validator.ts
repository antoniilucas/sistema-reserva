import { z } from "zod";

export const createBlockSchema = z.object({
  body: z.object({
    environmentId: z.string().uuid(),
    reason: z.enum(["MANUTENCAO", "LIMPEZA", "EVENTO_INSTITUCIONAL", "AULA_FIXA", "OUTRO"]),
    description: z.string().optional(),
    startDateTime: z.string(),
    endDateTime: z.string(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});
