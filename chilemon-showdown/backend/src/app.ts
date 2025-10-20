import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { requestLogger, unknownEndpoint, errorHandler } from "./middleware/loggerMiddleware";
import usersRouter from "./controllers/users";
import loginRouter from "./controllers/login";
import teambuilderRouter from "./controllers/teambuilder";
import chilemonRouter from "./controllers/chilemon";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
];

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // permitir requests sin origin (p. ej., Postman) o los de la lista
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // <- necesario para cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token", "Authorization"],
    exposedHeaders: ["X-CSRF-Token"],
  })
);
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

// 404
app.use(unknownEndpoint);

app.use(errorHandler);

export default app;
