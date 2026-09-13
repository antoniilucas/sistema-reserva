import { Router } from "express";
import { availabilityController } from "../controllers/availability.controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router();
router.get("/", authenticate, availabilityController.search);

export default router;
