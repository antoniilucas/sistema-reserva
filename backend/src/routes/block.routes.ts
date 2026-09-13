import { Router } from "express";
import { blockController } from "../controllers/block.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { createBlockSchema } from "../validators/block.validator";

const router = Router();
router.use(authenticate);

router.get("/", blockController.list);
router.post("/", authorize("ADMINISTRADOR"), validate(createBlockSchema), blockController.create);
router.delete("/:id", authorize("ADMINISTRADOR"), blockController.remove);

export default router;
