import express from "express";
import Chilemon from "../models/chilemon";

const router = express.Router();

/**
 * Get all Chilemon
 */
router.get("/", async (_req, res) => {
  try {
    const chilemon = await Chilemon.find({});
    return res.status(200).json(chilemon);
  } catch (error) {
    console.error("Error fetching Chilemon:", error);
    return res.status(500).json({ error: "Error fetching Chilemon" });
  }
});

/**
 * Get a specific Chilemon by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const chilemon = await Chilemon.findOne({ id: parseInt(req.params.id) });
    
    if (!chilemon) {
      return res.status(404).json({ error: "Chilemon not found" });
    }
    
    return res.status(200).json(chilemon);
  } catch (error) {
    console.error("Error fetching Chilemon:", error);
    return res.status(500).json({ error: "Error fetching Chilemon" });
  }
});

export default router;