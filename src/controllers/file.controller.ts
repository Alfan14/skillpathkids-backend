import { Request, Response } from "express";
import {
  Prisma,
  WorksheetVariant,
} from "@prisma/client";

import { prisma } from "../lib/prisma";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getSingleQueryValue = (
  value: unknown
): string | undefined =>
  typeof value === "string" ? value : undefined;

const toStringValue = (
  value: unknown
): string | undefined =>
  typeof value === "string" && value.trim()
    ? value.trim()
    : undefined;

const toNumberValue = (
  value: unknown
): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toIntegerValue = (
  value: unknown
): number | undefined => {
  const parsed = toNumberValue(value);
  return parsed === undefined
    ? undefined
    : Math.trunc(parsed);
};

const toBooleanValue = (
  value: unknown
): boolean | undefined => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

const toJsonValue = (
  value: unknown
): Prisma.InputJsonValue | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Prisma.InputJsonValue;
    } catch {
      return value;
    }
  }

  return value as Prisma.InputJsonValue;
};

const toWorksheetVariant = (
  value: unknown
): WorksheetVariant | undefined => {
  if (typeof value !== "string") return undefined;

  const normalized = value.toUpperCase();

  return Object.values(WorksheetVariant).includes(
    normalized as WorksheetVariant
  )
    ? (normalized as WorksheetVariant)
    : undefined;
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

const validateRange = (
  field: string,
  value: number | undefined,
  min: number,
  max?: number
) => {
  if (value === undefined) return;

  if (value < min || (max !== undefined && value > max)) {
    throw new Error(
      max === undefined
        ? `${field} cannot be negative`
        : `${field} must be between ${min} and ${max}`
    );
  }
};

const buildWorksheetData = (
  body: Record<string, unknown>,
  mode: "create" | "update"
) => {
  const title = toStringValue(body.title);
  const rawSlug = toStringValue(body.slug);
  const generatedSlug =
    rawSlug || (mode === "create" && title)
      ? slugify(rawSlug || title || "")
      : undefined;

  const variant = toWorksheetVariant(body.variant);

  if (body.variant !== undefined && !variant) {
    throw new Error("Invalid worksheet variant");
  }

  if (mode === "create" && !generatedSlug) {
    throw new Error("Slug is required");
  }

  const price = toIntegerValue(body.price) ?? (mode === "create" ? 0 : undefined);
  const discountPrice = toIntegerValue(body.discountPrice);
  const discountPercent = toIntegerValue(body.discountPercent);
  const rating = toNumberValue(body.rating);
  const reviewCount = toIntegerValue(body.reviewCount);
  const soldCount = toIntegerValue(body.soldCount);
  const stock = toIntegerValue(body.stock);

  validateRange("price", price, 0);
  validateRange("discountPrice", discountPrice, 0);
  validateRange("discountPercent", discountPercent, 0, 100);
  validateRange("rating", rating, 0, 5);
  validateRange("reviewCount", reviewCount, 0);
  validateRange("soldCount", soldCount, 0);
  validateRange("stock", stock, 0);

  return {
    title,
    slug: generatedSlug,
    description: toStringValue(body.description),
    shortDescription: toStringValue(
      body.shortDescription
    ),
    category: toStringValue(body.category),
    subCategory: toStringValue(body.subCategory),
    price,
    discountPrice,
    discountPercent,
    url: toStringValue(body.url),
    variant,
    mainImageUrl: toStringValue(body.mainImageUrl),
    galleryImages: toJsonValue(body.galleryImages),
    rating,
    reviewCount,
    soldCount,
    stock,
    badge: toStringValue(body.badge),
    badges: toJsonValue(body.badges),
    features: toJsonValue(body.features),
    specifications: toJsonValue(body.specifications),
    shippingInfo: toJsonValue(body.shippingInfo),
    isBestSeller: toBooleanValue(body.isBestSeller),
    isPromo: toBooleanValue(body.isPromo),
    isPublished: toBooleanValue(body.isPublished),
    accentColor:
      toStringValue(body.accentColor) ||
      toStringValue(body.accent),
    iconName:
      toStringValue(body.iconName) ||
      toStringValue(body.icon),
  };
};

const removeUndefined = <T extends Record<string, unknown>>(
  data: T
) => {
  return Object.fromEntries(
    Object.entries(data).filter(
      ([, value]) => value !== undefined
    )
  ) as T;
};

const isUniqueError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

const sendControllerError = (
  res: Response,
  error: unknown,
  fallbackMessage: string
) => {
  if (isUniqueError(error)) {
    return res.status(409).json({
      success: false,
      message: "Worksheet slug already exists",
    });
  }

  return res.status(500).json({
    success: false,
    message:
      error instanceof Error
        ? error.message
        : fallbackMessage,
  });
};

export class FileController {
  static async getAll(
    req: Request,
    res: Response
  ) {
    try {
      const { page, limit, skip } = parsePagination(req);
      const search = getSingleQueryValue(req.query.search);
      const category = getSingleQueryValue(req.query.category);
      const subCategory = getSingleQueryValue(
        req.query.subCategory
      );
      const variant = req.query.variant
        ? toWorksheetVariant(req.query.variant)
        : undefined;
      const isBestSeller = toBooleanValue(
        req.query.isBestSeller
      );
      const isPromo = toBooleanValue(req.query.isPromo);

      if (req.query.variant !== undefined && !variant) {
        return res.status(400).json({
          success: false,
          message: "Invalid worksheet variant",
        });
      }

      const where: Prisma.WorksheetWhereInput = {
        isPublished: true,
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { description: { contains: search } },
                {
                  shortDescription: {
                    contains: search,
                  },
                },
              ],
            }
          : {}),
        ...(category ? { category } : {}),
        ...(subCategory ? { subCategory } : {}),
        ...(variant ? { variant } : {}),
        ...(isBestSeller !== undefined
          ? { isBestSeller }
          : {}),
        ...(isPromo !== undefined ? { isPromo } : {}),
      };

      const [files, total] = await Promise.all([
        prisma.worksheet.findMany({
          where,
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: limit,
        }),
        prisma.worksheet.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        message: "Files fetched successfully",
        data: files,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch files",
      });
    }
  }

  static async getByIdOrSlug(
    req: Request,
    res: Response
  ) {
    try {
      const idOrSlug = req.params.idOrSlug as string;

      const file = await prisma.worksheet.findFirst({
        where: {
          isPublished: true,
          OR: [
            { id: idOrSlug },
            { slug: idOrSlug },
          ],
        },
      });

      if (!file) {
        return res.status(404).json({
          success: false,
          message: "File not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "File fetched successfully",
        data: file,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch file",
      });
    }
  }

  static async getRelated(
    req: Request,
    res: Response
  ) {
    try {
      const idOrSlug = req.params.idOrSlug as string;
      const rawLimit = Number(
        getSingleQueryValue(req.query.limit)
      );
      const limit =
        Number.isInteger(rawLimit) && rawLimit > 0
          ? Math.min(rawLimit, 20)
          : 4;

      const current = await prisma.worksheet.findFirst({
        where: {
          isPublished: true,
          OR: [
            { id: idOrSlug },
            { slug: idOrSlug },
          ],
        },
      });

      if (!current) {
        return res.status(404).json({
          success: false,
          message: "File not found",
        });
      }

      const related = await prisma.worksheet.findMany({
        where: {
          isPublished: true,
          id: { not: current.id },
          OR: [
            { category: current.category },
            ...(current.subCategory
              ? [{ subCategory: current.subCategory }]
              : []),
          ],
        },
        orderBy: [
          { isBestSeller: "desc" },
          { soldCount: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
      });

      return res.status(200).json({
        success: true,
        message: "Related files fetched successfully",
        data: related,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch related files",
      });
    }
  }

  static async create(
    req: Request,
    res: Response
  ) {
    try {
      const data = removeUndefined(
        buildWorksheetData(
          req.body as Record<string, unknown>,
          "create"
        )
      );

      if (
        !data.title ||
        !data.slug ||
        !data.description ||
        !data.category ||
        !data.variant
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      const file = await prisma.worksheet.create({
        data: data as Prisma.WorksheetCreateInput,
      });

      return res.status(201).json({
        success: true,
        message: "File created successfully",
        data: file,
      });
    } catch (error) {
      return sendControllerError(
        res,
        error,
        "Failed to create file"
      );
    }
  }

  static async update(
    req: Request,
    res: Response
  ) {
    try {
      const id = req.params.id as string;

      const existingFile =
        await prisma.worksheet.findUnique({
          where: { id },
        });

      if (!existingFile) {
        return res.status(404).json({
          success: false,
          message: "File not found",
        });
      }

      const updatedFile =
        await prisma.worksheet.update({
          where: { id },
          data: removeUndefined(
            buildWorksheetData(
              req.body as Record<string, unknown>,
              "update"
            )
          ) as Prisma.WorksheetUpdateInput,
        });

      return res.status(200).json({
        success: true,
        message: "File updated successfully",
        data: updatedFile,
      });
    } catch (error) {
      return sendControllerError(
        res,
        error,
        "Failed to update file"
      );
    }
  }

  static async delete(
    req: Request,
    res: Response
  ) {
    try {
      const id = req.params.id as string;

      const existingFile =
        await prisma.worksheet.findUnique({
          where: { id },
        });

      if (!existingFile) {
        return res.status(404).json({
          success: false,
          message: "File not found",
        });
      }

      await prisma.worksheet.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete file",
      });
    }
  }
}
