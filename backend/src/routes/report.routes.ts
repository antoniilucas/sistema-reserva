import { Router } from "express";
import { reportController } from "../controllers/report.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();
router.use(authenticate, authorize("ADMINISTRADOR", "GESTOR"));

router.get("/overview", reportController.overview);

export default router;
