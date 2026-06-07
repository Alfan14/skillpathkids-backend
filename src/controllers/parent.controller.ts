import { Request, Response } from "express";
import { Prisma, Role } from "@prisma/client";

import { prisma } from "../lib/prisma";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const getSingleQueryValue = (
  value: unknown
): string | undefined => {
  return typeof value === "string" ? value : undefined;
};

const parsePagination = (req: Request) => {
  const rawPage = Number(getSingleQueryValue(req.query.page));
  const rawLimit = Number(getSingleQueryValue(req.query.limit));

  const page =
    Number.isInteger(rawPage) && rawPage > 0
      ? rawPage
      : DEFAULT_PAGE;

  const limit =
    Number.isInteger(rawLimit) && rawLimit > 0
      ? Math.min(rawLimit, MAX_LIMIT)
      : DEFAULT_LIMIT;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const createPagination = (
  page: number,
  limit: number,
  total: number
) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

export class ParentController {
  static async getResults(
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

      const categoryResult = getSingleQueryValue(
        req.query.categoryResult
      );
      const childProfileId = getSingleQueryValue(
        req.query.childProfileId
      );
      const { page, limit, skip } = parsePagination(req);

      const where: Prisma.assessmentresultWhereInput = {
        userId: req.user.userId,
        ...(categoryResult ? { categoryResult } : {}),
        ...(childProfileId ? { childProfileId } : {}),
        users: {
          role: Role.PARENT,
        },
      };

      const [assessments, total] = await Promise.all([
        prisma.assessmentresult.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            child_profiles: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        prisma.assessmentresult.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        message: "Parent results fetched successfully",
        data: {
          data: assessments.map((assessment) => ({
            id: assessment.id,
            userId: assessment.userId,
            userName: assessment.users.name,
            userEmail: assessment.users.email,
            userRole: assessment.users.role,
            childProfileId:
              assessment.childProfileId ?? null,
            childName:
              assessment.child_profiles?.name ?? null,
            overallScore: assessment.overallScore,
            categoryResult: assessment.categoryResult,
            focusSummary: assessment.focusSummary,
            focusAreas: assessment.focusAreas,
            skillsData: assessment.skillsData,
            createdAt: assessment.createdAt,
          })),
          pagination: createPagination(
            page,
            limit,
            total
          ),
        },
      });
    } catch (error) {
      console.error("[PARENT_RESULTS_ERROR]", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch parent results",
      });
    }
  }
}
