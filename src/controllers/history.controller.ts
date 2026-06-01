import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export class HistoryController {
  static async getLatestResult(
    req: Request,
    res: Response
  ) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const latestResult =
        await prisma.assessmentresult.findFirst({
          where: {
            userId: req.user.userId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      return res.status(200).json({
        success: true,
        data: latestResult,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch result",
      });
    }
  }

  static async getHistory(
    req: Request,
    res: Response
  ) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const results =
        await prisma.assessmentresult.findMany({
          where: {
            userId: req.user.userId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch history",
      });
    }
  }
}
