import { Request, Response } from "express";

import { prisma } from "../lib/prisma";

export class TipController {
  static async getAll(
    req: Request,
    res: Response
  ) {
    try {
      const tips = await prisma.tip.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        success: true,
        data: tips,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch tips",
      });
    }
  }

  static async create(
    req: Request,
    res: Response
  ) {
    try {
      const tip = await prisma.tip.create({
        data: req.body,
      });

      return res.status(201).json({
        success: true,
        message: "Tip created successfully",
        data: tip,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create tip",
      });
    }
  }

  static async update(
    req: Request,
    res: Response
  ) {
    try {
      const id = req.params.id as string;

      const existingTip =
        await prisma.tip.findUnique({
          where: { id },
        });

      if (!existingTip) {
        return res.status(404).json({
          success: false,
          message: "Tip not found",
        });
      }

      const updatedTip = await prisma.tip.update({
        where: { id },
        data: req.body,
      });

      return res.status(200).json({
        success: true,
        message: "Tip updated successfully",
        data: updatedTip,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update tip",
      });
    }
  }

  static async delete(
    req: Request,
    res: Response
  ) {
    try {
      const id = req.params.id as string;

      const existingTip =
        await prisma.tip.findUnique({
          where: { id },
        });

      if (!existingTip) {
        return res.status(404).json({
          success: false,
          message: "Tip not found",
        });
      }

      await prisma.tip.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Tip deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete tip",
      });
    }
  }
}