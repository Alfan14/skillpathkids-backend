import { Request, Response } from "express";
import { Role } from "@prisma/client";

import { prisma } from "../lib/prisma";

const likertMap: Record<string, number> = {
  SS: 4,
  S: 3,
  TS: 2,
  STS: 1,
};

export class AssessmentController {
  static async submitAssessment(
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

      const { answers, childProfileId } = req.body;

      if (!answers || Object.keys(answers).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Answers are required",
        });
      }

      if (childProfileId) {
        if (req.user.role !== Role.PARENT) {
          return res.status(403).json({
            success: false,
            message:
              "Only parents can attach child profiles to assessments",
          });
        }

        const childProfile =
          await prisma.childProfile.findFirst({
            where: {
              id: childProfileId,
              parentId: req.user.userId,
            },
          });

        if (!childProfile) {
          return res.status(403).json({
            success: false,
            message: "Forbidden child profile",
          });
        }
      }

      const answerValues = Object.values(
        answers
      ) as string[];

      let totalScore = 0;

      for (const answer of answerValues) {
        totalScore += likertMap[answer] || 0;
      }

      const totalPossible =
        answerValues.length * 4;

      const percentage = Math.round(
        (totalScore / totalPossible) * 100
      );

      let categoryResult = "";

      if (percentage >= 80) {
        categoryResult = "Bagus";
      } else if (percentage >= 60) {
        categoryResult = "Cukup";
      } else {
        categoryResult = "Perlu Latihan";
      }

      let focusSummary = "";

      if (categoryResult === "Bagus") {
        focusSummary =
          "Perkembangan anak sangat baik dan konsisten.";
      } else if (categoryResult === "Cukup") {
        focusSummary =
          "Perkembangan anak cukup baik namun masih memerlukan stimulasi tambahan.";
      } else {
        focusSummary =
          "Anak memerlukan lebih banyak latihan dan pendampingan.";
      }

      const focusAreas = [
        "Motorik Halus",
        "Bahasa",
        "Sosial",
      ];

      const skillsData = {
        motorik: percentage,
        bahasa: Math.max(percentage - 5, 0),
        sosial: Math.max(percentage - 10, 0),
      };

      const assessment =
        await prisma.assessmentResult.create({
          data: {
            userId: req.user.userId,
            childProfileId:
              childProfileId || null,
            answers,
            overallScore: percentage,
            categoryResult,
            focusSummary,
            focusAreas,
            skillsData,
          },
        });

      return res.status(201).json({
        success: true,
        message:
          "Assessment submitted successfully",
        data: assessment,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to submit assessment",
      });
    }
  }
}
