import dotenv from "dotenv";
dotenv.config();

export const ENV = process.env.NODE_ENV ?? "development";

export const PORT = Number(process.env.PORT ?? 3001);
export const HOST = process.env.HOST ?? "localhost";

export const JWT_SECRET = process.env.JWT_SECRET ?? "my_secret";

// Always provide safe fallbacks so types are string, not string | undefined
export const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://localhost:27017";

export const MONGODB_DBNAME =
  ENV === "test"
    ? (process.env.TEST_MONGODB_DBNAME ?? "chilemondb_test")
    : (process.env.MONGODB_DBNAME ?? "chilemondb");
