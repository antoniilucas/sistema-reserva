import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { createUserSchema, updateOwnProfileSchema, updateUserSchema, updateUserStatusSchema } from "../validators/user.validator";

const router = Router();
router.use(authenticate);

router.patch("/me", validate(updateOwnProfileSchema), userController.updateOwnProfile);
router.get("/", authorize("ADMINISTRADOR", "GESTOR"), userController.list);
router.get("/:id", authorize("ADMINISTRADOR", "GESTOR"), userController.getById);
router.post("/", authorize("ADMINISTRADOR"), validate(createUserSchema), userController.create);
router.put("/:id", authorize("ADMINISTRADOR", "GESTOR"), validate(updateUserSchema), userController.update);
router.patch("/:id/status", authorize("ADMINISTRADOR"), validate(updateUserStatusSchema), userController.updateStatus);

export default router;
