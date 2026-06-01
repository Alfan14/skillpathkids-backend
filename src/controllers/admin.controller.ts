import { Request, Response } from "express";
import {
  Prisma,
  QuestionLevel,
  Role,
} from "@prisma/client";

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

const parseRole = (
  value: unknown,
  allowedRoles: Role[]
) => {
  const role = getSingleQueryValue(value);

  if (!role) {
    return {
      role: undefined,
      error: undefined,
    };
  }

  if (!Object.values(Role).includes(role as Role)) {
    return {
      role: undefined,
      error: "Invalid role",
    };
  }

  if (!allowedRoles.includes(role as Role)) {
    return {
      role: undefined,
      error: "Role is not allowed for this endpoint",
    };
  }

  return {
    role: role as Role,
    error: undefined,
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

export class AdminController {
  static async getOverview(
    req: Request,
    res: Response
  ) {
    try {
      const [
        totalUsers,
        totalParents,
        totalStudents,
        totalTeachers,
        totalAdministrators,
        totalQuestions,
        totalChildQuestions,
        totalTeacherQuestions,
        totalTips,
        totalFiles,
        totalAssessments,
        assessmentAggregate,
        latestAssessment,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: { role: Role.PARENT },
        }),
        prisma.user.count({
          where: { role: Role.STUDENT },
        }),
        prisma.user.count({
          where: { role: Role.TEACHER },
        }),
        prisma.user.count({
          where: { role: Role.ADMINISTRATOR },
        }),
        prisma.question.count(),
        prisma.question.count({
          where: { level: QuestionLevel.CHILD },
        }),
        prisma.question.count({
          where: { level: QuestionLevel.TEACHER },
        }),
        prisma.tip.count(),
        prisma.worksheet.count(),
        prisma.assessmentresult.count(),
        prisma.assessmentresult.aggregate({
          _avg: { overallScore: true },
        }),
        prisma.assessmentresult.findFirst({
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        }),
      ]);

      return res.status(200).json({
        success: true,
        message: "Admin overview fetched successfully",
        data: {
          totalUsers,
          totalParents,
          totalStudents,
          totalTeachers,
          totalAdministrators,
          totalQuestions,
          totalChildQuestions,
          totalTeacherQuestions,
          totalTips,
          totalFiles,
          totalAssessments,
          averageOverallScore:
            assessmentAggregate._avg.overallScore ?? 0,
          latestAssessmentAt:
            latestAssessment?.createdAt ?? null,
        },
      });
    } catch (error) {
      console.error("[ADMIN_OVERVIEW_ERROR]", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch admin overview",
      });
    }
  }

  static async getUsers(
    req: Request,
    res: Response
  ) {
    try {
      const { role, error } = parseRole(
        req.query.role,
        Object.values(Role)
      );

      if (error) {
        return res.status(400).json({
          success: false,
          message: error,
        });
      }

      const search = getSingleQueryValue(req.query.search);
      const { page, limit, skip } = parsePagination(req);

      const where: Prisma.UserWhereInput = {
        ...(role ? { role } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
              ],
            }
          : {}),
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        }),
        prisma.user.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        message: "Admin users fetched successfully",
        data: {
          data: users,
          pagination: createPagination(
            page,
            limit,
            total
          ),
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch admin users",
      });
    }
  }

  static async getAssessments(
    req: Request,
    res: Response
  ) {
    try {
      const { role, error } = parseRole(req.query.role, [
        Role.PARENT,
        Role.STUDENT,
        Role.TEACHER,
      ]);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error,
        });
      }

      const categoryResult = getSingleQueryValue(
        req.query.categoryResult
      );

      const { page, limit, skip } = parsePagination(req);

      const where: Prisma.assessmentresultWhereInput = {
        ...(categoryResult ? { categoryResult } : {}),
        ...(role
          ? {
              users: {
                role,
              },
            }
          : {}),
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
        message:
          "Admin assessments fetched successfully",
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
      console.error("[ADMIN_ASSESSMENTS_ERROR]", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch admin assessments",
      });
    }
  }
}
