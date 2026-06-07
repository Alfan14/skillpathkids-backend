import { Router } from "express";
import { Role } from "@prisma/client";

import { ParentController } from "../controllers/parent.controller";
import {
  authorizeRole,
  verifyToken,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  verifyToken,
  authorizeRole(Role.PARENT)
);

router.get(
  "/results",
  ParentController.getResults
);

export default router;
