import { Request, Response } from "express";
import { QuestionLevel, Role } from "@prisma/client";

import { prisma } from "../lib/prisma";

const toQuestionLevel = (
  value: unknown
): QuestionLevel | undefined => {
  if (
    typeof value === "string" &&
    Object.values(QuestionLevel).includes(
      value as QuestionLevel
    )
  ) {
    return value as QuestionLevel;
  }

  return undefined;
};

export class QuestionController {
  static async getAll(
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

      const rawLevel = req.query.level;
      const requestedLevel = toQuestionLevel(rawLevel);

      if (rawLevel !== undefined && !requestedLevel) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid question level. Allowed values: CHILD, TEACHER",
        });
      }

      let level: QuestionLevel | undefined;

      if (req.user.role === Role.ADMINISTRATOR) {
        level = requestedLevel;
      } else if (req.user.role === Role.TEACHER) {
        if (requestedLevel === QuestionLevel.CHILD) {
          return res.status(403).json({
            success: false,
            message: "Forbidden question level",
          });
        }

        level = QuestionLevel.TEACHER;
      } else {
        if (requestedLevel === QuestionLevel.TEACHER) {
          return res.status(403).json({
            success: false,
            message: "Forbidden question level",
          });
        }

        level = QuestionLevel.CHILD;
      }

      const questions = await prisma.question.findMany({
        where: level ? { level } : undefined,
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        success: true,
        data: questions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch questions",
      });
    }
  }

  static async create(
    req: Request,
    res: Response
  ) {
    try {
      const {
        text,
        category,
        iconName,
        icon,
        colorClass,
        color,
        level,
      } = req.body;

      const mappedIconName = iconName || icon;
      const mappedColorClass = colorClass || color;
      const questionLevel =
        toQuestionLevel(level) || QuestionLevel.CHILD;

      if (level !== undefined && !toQuestionLevel(level)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid question level. Allowed values: CHILD, TEACHER",
        });
      }

      if (
        !text ||
        !category ||
        !mappedIconName ||
        !mappedColorClass
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      const question = await prisma.question.create({
        data: {
          text,
          category,
          iconName: mappedIconName,
          colorClass: mappedColorClass,
          level: questionLevel,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Question created successfully",
        data: question,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create question",
      });
    }
  }

  static async update(
    req: Request,
    res: Response
  ) {
    try {
      const id = Number(req.params.id);

      const {
        text,
        category,
        iconName,
        icon,
        colorClass,
        color,
        level,
      } = req.body;

      const mappedIconName = iconName || icon;
      const mappedColorClass = colorClass || color;
      const questionLevel = toQuestionLevel(level);

      if (level !== undefined && !questionLevel) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid question level. Allowed values: CHILD, TEACHER",
        });
      }

      const existingQuestion =
        await prisma.question.findUnique({
          where: { id },
        });

      if (!existingQuestion) {
        return res.status(404).json({
          success: false,
          message: "Question not found",
        });
      }

      const updatedQuestion =
        await prisma.question.update({
          where: { id },
          data: {
            text,
            category,
            iconName: mappedIconName,
            colorClass: mappedColorClass,
            ...(questionLevel ? { level: questionLevel } : {}),
          },
        });

      return res.status(200).json({
        success: true,
        message: "Question updated successfully",
        data: updatedQuestion,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update question",
      });
    }
  }

  static async delete(
    req: Request,
    res: Response
  ) {
    try {
      const id = Number(req.params.id);

      const existingQuestion =
        await prisma.question.findUnique({
          where: { id },
        });

      if (!existingQuestion) {
        return res.status(404).json({
          success: false,
          message: "Question not found",
        });
      }

      await prisma.question.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Question deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete question",
      });
    }
  }
}
