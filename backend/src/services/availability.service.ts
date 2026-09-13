import { EnvironmentType } from "@prisma/client";
import { environmentRepository } from "../repositories/environment.repository";
import { conflictService } from "./conflict.service";
import { combineDateAndTime } from "../utils/dateUtils";

export const availabilityService = {
  search: async (params: { date: string; startTime: string; endTime: string; type?: EnvironmentType }) => {
    const environments = await environmentRepository.list({ type: params.type, active: true });

    const startTime = combineDateAndTime(params.date, params.startTime);
    const endTime = combineDateAndTime(params.date, params.endTime);

    const results = await Promise.all(
      environments.map(async (environment) => {
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
