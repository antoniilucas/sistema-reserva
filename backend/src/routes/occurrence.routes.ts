import { Router } from "express";
import { occurrenceController } from "../controllers/occurrence.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { createOccurrenceSchema } from "../validators/occurrence.validator";

const router = Router();
router.use(authenticate);

router.post("/", validate(createOccurrenceSchema), occurrenceController.create);
router.get("/", occurrenceController.listAll);
router.get("/reservation/:reservationId", occurrenceController.listByReservation);

export default router;
