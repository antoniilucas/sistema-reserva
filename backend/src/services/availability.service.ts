import { EnvironmentType, RoleName } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { environmentRepository } from "../repositories/environment.repository";
import { conflictService } from "./conflict.service";
import { combineDateAndTime, minutesBetween } from "../utils/dateUtils";

export const availabilityService = {
  search: async (params: { date: string; startTime: string; endTime: string; type?: EnvironmentType; role: RoleName }) => {
    const environments = await environmentRepository.list({ type: params.type, active: true });

    const startTime = combineDateAndTime(params.date, params.startTime);
    const endTime = combineDateAndTime(params.date, params.endTime);
    if (!Number.isFinite(startTime.getTime()) || !Number.isFinite(endTime.getTime()) || endTime <= startTime) {
      throw new AppError("Informe um intervalo de data e horário válido", 400);
    }

    const results = await Promise.all(
      environments.map(async (environment) => {
        const rule = environment.rules[0];
        const advanceMinutes = (startTime.getTime() - Date.now()) / 60000;
        const durationMinutes = minutesBetween(startTime, endTime);
        if (rule?.allowedRoles.length && !rule.allowedRoles.includes(params.role)) {
          return { environment, available: false, reason: "Seu perfil não pode reservar este ambiente" };
        }
        if (advanceMinutes < 0) {
          return { environment, available: false, reason: "O horário informado já passou" };
        }
        if (advanceMinutes < (rule?.minAdvanceMinutes ?? 60)) {
          return { environment, available: false, reason: `É necessário reservar com pelo menos ${rule?.minAdvanceMinutes ?? 60} minutos de antecedência` };
        }
        if (advanceMinutes > (rule?.maxAdvanceDays ?? 60) * 24 * 60) {
          return { environment, available: false, reason: `A reserva pode ser feita com no máximo ${rule?.maxAdvanceDays ?? 60} dias de antecedência` };
        }
        if (durationMinutes > (rule?.maxDurationMinutes ?? 240)) {
          return { environment, available: false, reason: `A duração máxima é de ${rule?.maxDurationMinutes ?? 240} minutos` };
        }
        const availability = await conflictService.checkAvailability({
          environmentId: environment.id,
          startTime,
          endTime,
        });
        return { environment, available: availability.available, reason: availability.reason };
      })
    );

    const available = results.filter((r) => r.available).map((r) => r.environment);
    const unavailable = results.filter((r) => !r.available);

    let suggestions: any[] = [];
    if (available.length === 0) {
      // Sugere horários alternativos (1h antes / 1h depois) para os mesmos ambientes
      const altSuggestions = [];
      for (const offsetHours of [-1, 1, 2]) {
        const altStart = new Date(startTime.getTime() + offsetHours * 3600000);
        const altEnd = new Date(endTime.getTime() + offsetHours * 3600000);
        for (const environment of environments.slice(0, 5)) {
          const rule = environment.rules[0];
          const altAdvanceMinutes = (altStart.getTime() - Date.now()) / 60000;
          const altDurationMinutes = minutesBetween(altStart, altEnd);
          if (rule?.allowedRoles.length && !rule.allowedRoles.includes(params.role)) continue;
          if (altAdvanceMinutes < (rule?.minAdvanceMinutes ?? 60)) continue;
          if (altAdvanceMinutes > (rule?.maxAdvanceDays ?? 60) * 24 * 60) continue;
          if (altDurationMinutes > (rule?.maxDurationMinutes ?? 240)) continue;
          const availability = await conflictService.checkAvailability({
            environmentId: environment.id,
            startTime: altStart,
            endTime: altEnd,
          });
          if (availability.available) {
            altSuggestions.push({
              environment,
              startTime: altStart,
              endTime: altEnd,
            });
          }
        }
      }
      suggestions = altSuggestions.slice(0, 5);
    }

    return { available, unavailable, suggestions };
  },
};
