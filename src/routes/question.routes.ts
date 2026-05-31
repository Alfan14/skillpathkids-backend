import { Router } from "express";
import { Role } from "@prisma/client";

import { QuestionController } from "../controllers/question.controller";
import {
  verifyToken,
  authorizeRole,
} from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  verifyToken,
  authorizeRole(
    Role.PARENT,
    Role.STUDENT,
    Role.TEACHER,
    Role.ADMINISTRATOR
  ),
  QuestionController.getAll
);

router.post(
  "/",
  verifyToken,
  authorizeRole(Role.ADMINISTRATOR),
  QuestionController.create
);

router.put(
  "/:id",
  verifyToken,
  authorizeRole(Role.ADMINISTRATOR),
  QuestionController.update
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRole(Role.ADMINISTRATOR),
  QuestionController.delete
);

export default router;
