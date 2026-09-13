/**
 * Serviço central de validação de conflitos de reserva.
 * Toda a lógica de disponibilidade / conflito deve passar por aqui,
 * evitando duplicação em controllers ou outros services.
 */
import { AppError } from "../utils/AppError";
import { reservationRepository } from "../repositories/reservation.repository";
import { blockRepository } from "../repositories/block.repository";
import { environmentRepository } from "../repositories/environment.repository";
import { isWithinWorkingHours } from "../utils/dateUtils";

interface ConflictCheckParams {
  environmentId: string;
  startTime: Date;
  endTime: Date;
  excludeReservationId?: string;
}

export const conflictService = {
  /**
   * Verifica se existe conflito de horário considerando:
   * - Reservas existentes (com status ativo) + buffers de setup/limpeza
   * - Bloqueios administrativos (prioridade máxima)
   * - Horário de funcionamento do ambiente
   */
  checkAvailability: async ({
    environmentId,
    startTime,
    endTime,
    excludeReservationId,
  }: ConflictCheckParams): Promise<{ available: boolean; reason?: string }> => {
    const environment = await environmentRepository.findById(environmentId);
    if (!environment) {
      return { available: false, reason: "Ambiente não encontrado" };
    }
    if (!environment.active) {
      return { available: false, reason: "Ambiente inativo" };
    }

    if (endTime <= startTime) {
      return { available: false, reason: "Horário final deve ser maior que o inicial" };
    }

    if (!isWithinWorkingHours(startTime, endTime, environment.openingTime, environment.closingTime)) {
      return {
        available: false,
        reason: `Fora do horário de funcionamento (${environment.openingTime} - ${environment.closingTime})`,
      };
    }

    // Buffers de setup e limpeza expandem a janela ocupada da reserva existente
    const setupBufferMs = (environment.setupBufferMinutes || 0) * 60000;
    const cleanupBufferMs = (environment.cleanupBufferMinutes || 0) * 60000;

    const bufferedStart = new Date(startTime.getTime() - setupBufferMs);
    const bufferedEnd = new Date(endTime.getTime() + cleanupBufferMs);

    // 1. Bloqueios administrativos têm prioridade máxima
    const blocks = await blockRepository.findConflicting(environmentId, startTime, endTime);
    if (blocks.length > 0) {
      return { available: false, reason: "Ambiente bloqueado administrativamente neste período" };
    }

    // 2. Conflito com outras reservas (considerando buffers)
    const conflicting = await reservationRepository.findConflicting(
      environmentId,
      bufferedStart,
      bufferedEnd,
      excludeReservationId
    );
    if (conflicting.length > 0) {
      return { available: false, reason: "Conflito com outra reserva já existente neste ambiente" };
    }

    return { available: true };
  },

  /**
   * Lança AppError 409 caso haja conflito. Uso direto em fluxos de escrita.
   */
  assertAvailable: async (params: ConflictCheckParams) => {
    const result = await conflictService.checkAvailability(params);
    if (!result.available) {
      throw new AppError(result.reason || "Conflito de reserva", 409);
    }
  },
};
