import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { requestLogger, unknownEndpoint, errorHandler } from "./middleware/loggerMiddleware";
import usersRouter from "./controllers/users";
import loginRouter from "./controllers/login";
import teambuilderRouter from "./controllers/teambuilder";
import chilemonRouter from "./controllers/chilemon";
import testingRouter from "./controllers/testing";
import battleRouter from "./controllers/battle";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
];

const app = express();

app.use(express.static("dist"));
app.use(express.json());
app.use(cookieParser()); 
app.use(requestLogger);

// ... routes ...
app.get("/", (_req, res) => {
  res.type("text/plain").send("Welcome to Chilemon Showdown API!");
});

app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use("/api", teambuilderRouter);  
app.use("/chilemon", chilemonRouter);
app.use("/battles", battleRouter);

if (process.env.NODE_ENV === "test") {
  app.use("/api/testing", testingRouter);
}

// 404
app.use(unknownEndpoint);

app.use(errorHandler);

export default app;
