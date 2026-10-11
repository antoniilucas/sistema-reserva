import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { loginSchema, registerSchema } from "../validators/auth.validator";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.post("/register", validate(registerSchema), authController.register);
router.get("/me", authenticate, authController.me);

export default router;
