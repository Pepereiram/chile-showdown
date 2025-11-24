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

const port = process.env.NODE_ENV === 'development'? 3001 : PORT;

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
