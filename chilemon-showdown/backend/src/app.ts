import express from "express";
import cors from "cors";
import { requestLogger, unknownEndpoint, errorHandler } from "./middleware/loggerMiddleware";
import usersRouter from "./controllers/users";
import loginRouter from "./controllers/login";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
// ... routes ...
app.use(unknownEndpoint);
app.use(errorHandler);

app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

app.get("/", (_req, res) => {
  res.send("Welcome to Chilemon Showdown API!");
});

export default app;
