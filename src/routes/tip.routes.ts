import { Router } from "express";
import { Role } from "@prisma/client";

import { TipController } from "../controllers/tip.controller";

import {
  verifyToken,
  authorizeRole,
} from "../middleware/auth.middleware";

const router = Router();

router.get("/", TipController.getAll);

router.post(
  "/",
  verifyToken,
  authorizeRole(Role.ADMINISTRATOR),
  TipController.create
);

router.put(
  "/:id",
  verifyToken,
  authorizeRole(Role.ADMINISTRATOR),
  TipController.update
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRole(Role.ADMINISTRATOR),
  TipController.delete
);

export default router;
