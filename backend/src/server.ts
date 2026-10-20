import app from "./app";
import { env } from "./config/env";
import { reservationService } from "./services/reservation.service";

app.listen(env.port, () => {
  console.log(`API rodando em http://localhost:${env.port}`);
  const markExpiredReservations = () => {
    reservationService.markExpiredNoShows().catch((error) => {
      console.error("Erro ao atualizar reservas sem check-in:", error);
    });
  };
  markExpiredReservations();
  setInterval(markExpiredReservations, 60_000).unref();
});
