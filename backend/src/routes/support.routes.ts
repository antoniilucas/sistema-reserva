import { Router } from "express";
import { supportController } from "../controllers/support.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { createSupportSchema, updateSupportStatusSchema } from "../validators/support.validator";

const router = Router();
router.use(authenticate);

router.get("/", supportController.list);
router.post("/", validate(createSupportSchema), supportController.create);
router.patch(
  "/:id/status",
  authorize("SUPORTE", "ADMINISTRADOR"),
  validate(updateSupportStatusSchema),
  supportController.updateStatus
);

export default router;
