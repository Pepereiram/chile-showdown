import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import express from "express";
import { randomUUID } from "crypto";
import User from "../models/users";
import { JWT_SECRET } from "../utils/config";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", async (request, response) => {
  const { username, password } = request.body;

  const user = await User.findOne({ username });
  if (!user) {
    return response.status(401).json({ error: "invalid username or password" });
  }

  const passwordCorrect = await bcrypt.compare(password, user.password);
  if (!passwordCorrect) {
    return response.status(401).json({ error: "invalid username or password" });
  }

  const userForToken = {
    username: user.username,
    csrf: randomUUID(),
    id: user._id.toString(),
  };

  const token = jwt.sign(userForToken, JWT_SECRET, { expiresIn: 60 * 60 });

  response.setHeader("X-CSRF-Token", userForToken.csrf);
  response.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  return response.status(200).send({ username: user.username });
});

router.get("/me", authenticate, async (request, response) => {
  const user = await User.findById((request as any).userId);
  return response.status(200).json(user);
});

router.post("/logout", (_request, response) => {
  response.clearCookie("token");
  return response.status(200).send({ message: "Logged out successfully" });
});

export default router;
