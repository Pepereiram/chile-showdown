import Chilemon from "../models/chilemon";
import { connectDB } from "./db";
import * as fs from "fs";
import * as path from "path";

async function seedChilemon() {
  await connectDB();

  const chilemonData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../data/chilemon.json"), "utf-8")
  );

  try {
    await Chilemon.deleteMany({});
    await Chilemon.insertMany(chilemonData);
    console.log("Chilemon data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding Chilemon:", error);
    process.exit(1);
  }
}

seedChilemon();