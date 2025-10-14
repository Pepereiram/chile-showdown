import express, { NextFunction, Request, Response } from "express";

import logger from "./src/utils/logger";
import config from "./src/utils/config";
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

// Router
import loginRouter from './src/controllers/login';
import usersRouter from './src/controllers/users';

// Middleware
import loggerMiddleware from './src/middleware/loggerMiddleware';

const app = express();

mongoose.set("strictQuery", false);

if (config.MONGODB_URI) {
  mongoose.connect(config.MONGODB_URI, { dbName: config.MONGODB_DBNAME }).catch((error) => {
    logger.error("error connecting to MongoDB:", error.message);
  });
}

app.use(express.static("dist"));
app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware.requestLogger);

app.use("/api/login", loginRouter);
app.use("/api/users", usersRouter);

app.use(loggerMiddleware.unknownEndpoint);
app.use(loggerMiddleware.errorHandler);

export default app;