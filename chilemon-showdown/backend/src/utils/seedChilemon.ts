import Chilemon from "../models/chilemon";
import Move from "../models/moves";
import { connectDB } from "./db";
import * as fs from "fs";
import * as path from "path";

async function seedChilemon() {
  await connectDB();

  const count = await Chilemon.countDocuments();
  if (count > 0) {
    console.log("Chilemon data already seeded, skipping.");
    return;
  }

  const chilemonData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../data/chilemon_chileizados.json"), "utf-8")
  );

  try {
    await Chilemon.deleteMany({});
    await Chilemon.insertMany(chilemonData);
    console.log("Chilemon data seeded successfully!");
  } catch (error) {
    console.error("Error seeding Chilemon:", error);
    throw error;
  }
}

async function seedMoves() {
  await connectDB();

  // If you want to skip when already seeded:
  const count = await Move.countDocuments();
  if (count > 0) {
    console.log("Moves data already seeded, skipping.");
    return;
  }

  const movesData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../data/moves.json"), "utf-8")
  );

  try {
    // Optional: clear first if you want a clean slate
    await Move.deleteMany({});
    await Move.insertMany(movesData);
    console.log(`Moves data seeded successfully! Inserted: ${movesData.length}`);
  } catch (error) {
    console.error("Error seeding Moves:", error);
    throw error;
  }
}

(async () => {
  try {
    await connectDB();
    await seedChilemon();
    await seedMoves();
    console.log("All seeding done.");
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();