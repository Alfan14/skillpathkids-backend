import { Router } from "express";
import { Role } from "@prisma/client";

import { AssessmentController } from "../controllers/assessment.controller";

import {
  verifyToken,
  authorizeRole,
} from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  verifyToken,
  authorizeRole(Role.PARENT, Role.STUDENT, Role.TEACHER),
  AssessmentController.submitAssessment
);

export default router;
