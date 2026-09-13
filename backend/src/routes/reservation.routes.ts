import { Router } from "express";
import { reservationController } from "../controllers/reservation.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import {
  createReservationSchema,
  updateReservationSchema,
  cancelReservationSchema,
  checkoutReservationSchema,
  recurringReservationSchema,
  chainReservationSchema,
} from "../validators/reservation.validator";

const router = Router();
router.use(authenticate);

router.get("/", reservationController.list);
router.get("/:id", reservationController.getById);
router.post("/", validate(createReservationSchema), reservationController.create);
router.post("/recurring", validate(recurringReservationSchema), reservationController.createRecurring);
router.post("/chain", validate(chainReservationSchema), reservationController.createChain);
router.put("/:id", validate(updateReservationSchema), reservationController.update);
router.post("/:id/cancel", validate(cancelReservationSchema), reservationController.cancel);
router.post("/:id/check-in", reservationController.checkIn);
router.post("/:id/check-out", validate(checkoutReservationSchema), reservationController.checkOut);
router.post("/:id/approve", authorize("GESTOR", "ADMINISTRADOR", "RESPONSAVEL_TECNICO"), reservationController.approve);
router.post("/:id/reject", authorize("GESTOR", "ADMINISTRADOR", "RESPONSAVEL_TECNICO"), reservationController.reject);

export default router;
