import { Router } from "express";
import { Role } from "@prisma/client";

import { TeacherController } from "../controllers/teacher.controller";
import {
  authorizeRole,
  verifyToken,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  verifyToken,
  authorizeRole(Role.TEACHER)
);

router.get(
  "/results",
  TeacherController.getResults
);

export default router;
