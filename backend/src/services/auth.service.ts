import bcrypt from "bcrypt";
import { AppError } from "../utils/AppError";
import { signToken } from "../utils/jwt";
import { userRepository } from "../repositories/user.repository";

export const authService = {
  login: async (email: string, password: string) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError("Credenciais inválidas", 401);

    if (user.status !== "ATIVO") {
      throw new AppError("Usuário inativo ou bloqueado", 403);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError("Credenciais inválidas", 401);

    const token = signToken({ id: user.id, role: user.role, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  },
};
