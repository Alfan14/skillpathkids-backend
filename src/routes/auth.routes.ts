import { Router, Request, Response } from "express";
import { Role } from "@prisma/client";

import { AuthService } from "../services/auth.service";

const router = Router();

router.post(
  "/register",
  async (req: Request, res: Response) => {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password || !name || !role) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      if (!Object.values(Role).includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }

      const publicRoles = [
        Role.PARENT,
        Role.STUDENT,
        Role.TEACHER,
      ];

      if (!publicRoles.includes(role)) {
        return res.status(403).json({
          success: false,
          message:
            "This role cannot be registered publicly",
        });
      }

      const user = await AuthService.register(
        email,
        password,
        name,
        role
      );

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Registration failed",
      });
    }
  }
);

router.post(
  "/login",
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const result = await AuthService.login(
        email,
        password
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Login failed",
      });
    }
  }
);

export default router;
