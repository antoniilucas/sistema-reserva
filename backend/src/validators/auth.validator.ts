import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("E-mail inválido"),
    password: z.string().min(1, "Senha obrigatória"),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Informe seu nome completo"),
    email: z.string().trim().email("E-mail inválido").transform((email) => email.toLowerCase()),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});
