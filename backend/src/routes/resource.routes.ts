import { Router } from "express";
import { resourceController } from "../controllers/resource.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { createResourceSchema, updateResourceSchema, linkResourceSchema } from "../validators/resource.validator";

const router = Router();
router.use(authenticate);

router.get("/", resourceController.list);
router.post("/", authorize("ADMINISTRADOR"), validate(createResourceSchema), resourceController.create);
router.put("/:id", authorize("ADMINISTRADOR"), validate(updateResourceSchema), resourceController.update);
router.delete("/:id", authorize("ADMINISTRADOR"), resourceController.deactivate);
router.post(
  "/environments/:environmentId/link",
  authorize("ADMINISTRADOR"),
  validate(linkResourceSchema),
  resourceController.linkToEnvironment
);
router.delete(
  "/environments/:environmentId/link/:resourceId",
  authorize("ADMINISTRADOR"),
  resourceController.unlinkFromEnvironment
);

export default router;
