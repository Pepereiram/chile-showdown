import app from "./app";
import { connectDB } from "./utils/db";
import { HOST, PORT } from "./utils/config";


declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

const HOST1 = HOST || "localhost";

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on https://fullstack.dcc.uchile.cl:${PORT}`);
  });
});
