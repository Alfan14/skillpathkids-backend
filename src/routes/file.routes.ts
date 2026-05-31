import { Router } from "express";
import { Role } from "@prisma/client";

import { FileController } from "../controllers/file.controller";

import {
  verifyToken,
  authorizeRole,
} from "../middleware/auth.middleware";

const router = Router();

router.get("/", FileController.getAll);
router.get(
  "/:idOrSlug/related",
  FileController.getRelated
);
router.get("/:idOrSlug", FileController.getByIdOrSlug);

router.post(
  "/",
  verifyToken,
  authorizeRole(Role.ADMINISTRATOR),
  FileController.create
);

router.put(
  "/:id",
  verifyToken,
  authorizeRole(Role.ADMINISTRATOR),
  FileController.update
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRole(Role.ADMINISTRATOR),
  FileController.delete
);

export default router;
