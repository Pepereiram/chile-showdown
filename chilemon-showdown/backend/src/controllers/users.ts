import bcrypt from "bcrypt";
import express from "express";
import User from "../models/users";

const router = express.Router();

/**
 * Get all users
 */
router.get("/", async (request, response) => {
  const users = await User.find({});
  response.json(users);
});


/**
 * Register a new user
 */
router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "username and password are required" });

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({ username, password: passwordHash });
    const savedUser = await user.save();

    return res.status(201).json(savedUser);
  } catch (err: any) {
    if (err?.code === 11000) return res.status(409).json({ error: "username already exists" });
    return res.status(500).json({ error: "internal error" });
  }
});

export default router;