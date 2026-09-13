import { Router } from "express";
import { reservationController } from "../controllers/reservation.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();
router.use(authenticate, authorize("GESTOR", "ADMINISTRADOR", "RESPONSAVEL_TECNICO"));

router.get("/pending", reservationController.pendingApprovals);

export default router;
