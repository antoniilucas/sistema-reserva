import { z } from "zod";

export const createReservationSchema = z.object({
  body: z.object({
    environmentId: z.string().uuid(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    purpose: z.string().min(3),
    participantsCount: z.number().int().positive(),
    responsibleId: z.string().uuid().optional(),
    participants: z
      .array(
        z.object({
          name: z.string().min(1),
          email: z.string().email().optional(),
          userId: z.string().uuid().optional(),
        })
      )
      .optional(),
    resources: z
      .array(
        z.object({
          resourceId: z.string().uuid(),
          quantity: z.number().int().positive().optional(),
        })
      )
      .optional(),
    termsAccepted: z.boolean(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const updateReservationSchema = z.object({
  body: z.object({
    environmentId: z.string().uuid().optional(),
    date: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    purpose: z.string().min(3).optional(),
    participantsCount: z.number().int().positive().optional(),
    responsibleId: z.string().uuid().optional(),
    resources: z
      .array(
        z.object({
          resourceId: z.string().uuid(),
          quantity: z.number().int().positive().optional(),
        })
      )
      .optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const rejectReservationSchema = z.object({
  body: z.object({
    reason: z.string().min(3),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const cancelReservationSchema = z.object({
  body: z.object({
    reason: z.string().min(3),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const checkoutReservationSchema = z.object({
  body: z.object({
    checklist: z.record(z.boolean()).optional(),
    notes: z.string().optional(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const recurringReservationSchema = z.object({
  body: z.object({
    environmentId: z.string().uuid(),
    frequency: z.enum(["SEMANAL", "QUINZENAL"]),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
    startDate: z.string(),
    endDate: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    purpose: z.string().min(3),
    participantsCount: z.number().int().positive(),
    responsibleId: z.string().uuid().optional(),
    termsAccepted: z.boolean(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const chainReservationSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    items: z
      .array(
        z.object({
          environmentId: z.string().uuid(),
          date: z.string(),
          startTime: z.string(),
          endTime: z.string(),
          purpose: z.string().min(3),
          participantsCount: z.number().int().positive(),
          responsibleId: z.string().uuid().optional(),
        })
      )
      .min(2),
    termsAccepted: z.boolean(),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});
