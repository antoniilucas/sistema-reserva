import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import environmentRoutes from "./environment.routes";
import resourceRoutes from "./resource.routes";
import availabilityRoutes from "./availability.routes";
import reservationRoutes from "./reservation.routes";
import approvalRoutes from "./approval.routes";
import blockRoutes from "./block.routes";
import occurrenceRoutes from "./occurrence.routes";
import penaltyRoutes from "./penalty.routes";
import supportRoutes from "./support.routes";
import auditRoutes from "./audit.routes";
import reportRoutes from "./report.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/environments", environmentRoutes);
router.use("/resources", resourceRoutes);
router.use("/availability", availabilityRoutes);
router.use("/reservations", reservationRoutes);
router.use("/approvals", approvalRoutes);
router.use("/blocks", blockRoutes);
router.use("/occurrences", occurrenceRoutes);
router.use("/penalties", penaltyRoutes);
router.use("/support", supportRoutes);
router.use("/audit", auditRoutes);
router.use("/reports", reportRoutes);

export default router;
