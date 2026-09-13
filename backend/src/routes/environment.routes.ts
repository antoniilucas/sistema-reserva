import { Router } from "express";
import { environmentController } from "../controllers/environment.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { createEnvironmentSchema, updateEnvironmentSchema } from "../validators/environment.validator";

const router = Router();
router.use(authenticate);

router.get("/", environmentController.list);
router.get("/:id", environmentController.getById);
router.post("/", authorize("ADMINISTRADOR"), validate(createEnvironmentSchema), environmentController.create);
router.put("/:id", authorize("ADMINISTRADOR"), validate(updateEnvironmentSchema), environmentController.update);
router.delete("/:id", authorize("ADMINISTRADOR"), environmentController.deactivate);

export default router;
