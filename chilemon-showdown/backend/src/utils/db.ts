import mongoose from "mongoose";
import { MONGODB_URI, MONGODB_DBNAME } from "./config";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DBNAME });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
