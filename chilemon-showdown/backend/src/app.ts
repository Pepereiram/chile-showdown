import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { requestLogger, unknownEndpoint, errorHandler } from "./middleware/loggerMiddleware";
import usersRouter from "./controllers/users";
import loginRouter from "./controllers/login";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser()); 
app.use(requestLogger);

// ... routes ...
app.get("/", (_req, res) => {
  res.type("text/plain").send("Welcome to Chilemon Showdown API!");
});

app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

// 404
app.use(unknownEndpoint);

app.use(errorHandler);

export default app;
