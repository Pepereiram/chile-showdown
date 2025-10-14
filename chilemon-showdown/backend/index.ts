import app from "./app";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}