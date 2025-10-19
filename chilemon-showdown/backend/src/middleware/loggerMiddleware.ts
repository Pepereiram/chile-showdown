import type { RequestHandler, ErrorRequestHandler } from "express";
import logger from "../utils/logger";

export const requestLogger: RequestHandler = (req, _res, next) => {
  logger.info("Method:", req.method);
  logger.info("Path:  ", req.path);
  if (req.body && Object.keys(req.body).length) {
    logger.info("Body:  ", req.body);
  }
  logger.info("---");
  next();
};

export const unknownEndpoint: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "unknown endpoint" });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const name = (err as any)?.name as string | undefined;
  const message = (err as any)?.message as string | undefined;

  if (message) logger.error(message);
  if (name) logger.error(name);

  if (name === "CastError") {
    return res.status(400).json({ error: "malformatted id" });
  }

  if (name === "ValidationError") {
    return res.status(400).json({ error: message ?? "validation error" });
  }

  if (name === "MongoServerError" && typeof message === "string" && message.includes("E11000 duplicate key error")) {
    return res.status(400).json({ error: "expected `username` to be unique" });
  }

  if (name === "JsonWebTokenError") {
    return res.status(401).json({ error: "invalid token" });
  }

  if (name === "TokenExpiredError") {
    return res.status(401).json({ error: "token expired" });
  }

  // Fallback
  return res.status(500).json({ error: "Internal Server Error" });
};
