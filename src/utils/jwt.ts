import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

interface JwtPayload {
  userId: string;
  role: Role;
}

export const generateToken = (payload: JwtPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

export const verifyJwtToken = (token: string): JwtPayload => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as JwtPayload;
};