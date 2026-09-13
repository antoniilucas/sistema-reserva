import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { createUserSchema, updateUserSchema, updateUserStatusSchema } from "../validators/user.validator";

const router = Router();
router.use(authenticate, authorize("ADMINISTRADOR"));

router.get("/", userController.list);
router.get("/:id", userController.getById);
router.post("/", validate(createUserSchema), userController.create);
router.put("/:id", validate(updateUserSchema), userController.update);
router.patch("/:id/status", validate(updateUserStatusSchema), userController.updateStatus);

export default router;
