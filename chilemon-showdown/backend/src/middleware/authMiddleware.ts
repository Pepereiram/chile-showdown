import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/config";

// Define the shape of your JWT payload
type TokenPayload = {
  id: string;
  csrf: string;
  username?: string;
  iat: number;
  exp: number;
};

export const authenticate: RequestHandler = (req, res, next) => {
  // token from cookie (requires cookie-parser)
  const token = (req as any).cookies?.token as string | undefined;
  if (!token) {
    return res.status(401).json({ error: "missing token" });
  }

  // get CSRF header as a single string (or undefined)
  const csrfHeader = req.get("x-csrf-token");

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload | string;

    if (
      typeof decoded === "object" &&
      decoded.id &&
      decoded.csrf &&
      csrfHeader === decoded.csrf
    ) {
      // attach user info to the request
      (req as any).userId = decoded.id;
      return next();
    }

    return res.status(401).json({ error: "Invalid token or CSRF" });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
