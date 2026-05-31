import { Router } from "express";
import { Role } from "@prisma/client";

import { AdminController } from "../controllers/admin.controller";
import {
  authorizeRole,
  verifyToken,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  verifyToken,
  authorizeRole(Role.ADMINISTRATOR)
);

router.get(
  "/overview",
  AdminController.getOverview
);

router.get("/users", AdminController.getUsers);

router.get(
  "/assessments",
  AdminController.getAssessments
);

export default router;
