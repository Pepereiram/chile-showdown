import mongoose from "mongoose";
import { MONGODB_URI, MONGODB_DBNAME } from "./config";

const mongourl = process.env.NODE_ENV === 'development' ? 'mongodb://localhost:27017/chilemon' : MONGODB_URI;

export const connectDB = async () => {
  try {
    await mongoose.connect(mongourl, { dbName: MONGODB_DBNAME });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
