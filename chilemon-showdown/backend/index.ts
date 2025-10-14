import app from "./app";
import config from "./src/utils/config";
import logger from "./src/utils/logger";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});