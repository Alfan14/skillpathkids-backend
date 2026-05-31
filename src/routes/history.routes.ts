import { Router } from "express";
import { Role } from "@prisma/client";

import { HistoryController } from "../controllers/history.controller";

import {
  verifyToken,
  authorizeRole,
} from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  verifyToken,
  authorizeRole(Role.PARENT, Role.STUDENT, Role.TEACHER),
  HistoryController.getLatestResult
);

router.get(
  "/history",
  verifyToken,
  authorizeRole(Role.PARENT, Role.STUDENT, Role.TEACHER),
  HistoryController.getHistory
);

export default router;
