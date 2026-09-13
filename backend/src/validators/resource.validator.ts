import { z } from "zod";

export const createResourceSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    kind: z.enum(["FIXO", "OPCIONAL"]).optional(),
    quantity: z.number().int().positive().optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const updateResourceSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    kind: z.enum(["FIXO", "OPCIONAL"]).optional(),
    quantity: z.number().int().positive().optional(),
    active: z.boolean().optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const linkResourceSchema = z.object({
  body: z.object({
    resourceId: z.string().uuid(),
    mandatory: z.boolean().optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});
