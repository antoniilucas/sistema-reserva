import { z } from "zod";

const baseEnvironment = {
  code: z.string().min(1),
  name: z.string().min(2),
  type: z.enum(["SALA", "LABORATORIO", "AUDITORIO", "SALA_REUNIAO", "ESTUDIO", "MULTIUSO"]),
  campus: z.string().min(1),
  building: z.string().min(1),
  floor: z.string().min(1),
  location: z.string().optional(),
  capacity: z.number().int().positive(),
  criticality: z.enum(["COMUM", "CONTROLADO", "RESTRITO"]).optional(),
  requiresTechnicalResponsible: z.boolean().optional(),
  technicalNotes: z.string().optional(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  setupBufferMinutes: z.number().int().min(0).optional(),
  cleanupBufferMinutes: z.number().int().min(0).optional(),
  rule: z
    .object({
      minAdvanceMinutes: z.number().int().min(0).optional(),
      maxAdvanceDays: z.number().int().min(1).optional(),
      maxDurationMinutes: z.number().int().min(1).optional(),
      requiresApproval: z.boolean().optional(),
      requiresTechnicalReview: z.boolean().optional(),
      allowedRoles: z.array(z.string()).optional(),
    })
    .optional(),
};

export const createEnvironmentSchema = z.object({
  body: z.object(baseEnvironment),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const updateEnvironmentSchema = z.object({
  body: z.object(baseEnvironment).partial(),
  query: z.any().optional(),
  params: z.any().optional(),
});
