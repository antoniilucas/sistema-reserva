import { Router } from "express";
import { penaltyController } from "../controllers/penalty.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { createPenaltySchema } from "../validators/penalty.validator";

const router = Router();
router.use(authenticate, authorize("ADMINISTRADOR"));

router.get("/", penaltyController.listAll);
router.get("/user/:userId", penaltyController.listByUser);
router.post("/", validate(createPenaltySchema), penaltyController.create);

export default router;
