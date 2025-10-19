import app from "./app";
import { connectDB } from "./utils/db";
import { PORT } from "./utils/config";


declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}


connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
