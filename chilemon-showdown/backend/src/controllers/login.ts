import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import express from "express";
import { randomUUID } from "crypto";
import User from "../models/users";
import { JWT_SECRET } from "../utils/config";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * User trata de logearse
 */

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).select("+password");
  if (!user) return res.status(401).json({ error: "invalid username or password" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "invalid username or password" });

  const userForToken = { username: user.username, csrf: randomUUID(), id: user._id.toString() };
  const token = jwt.sign(userForToken, JWT_SECRET, { expiresIn: 60 * 60 });

  res.setHeader("X-CSRF-Token", userForToken.csrf);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).send({ id: user._id.toString(), username: user.username });
});


/**
 * Obtener datos del usuario logeado
 */
router.get("/me", authenticate, async (request, response) => {
  const user = await User.findById(request.userId);
  return response.status(200).json(user);
});

/**
 * Logout user
 */
router.post("/logout", (_request, response) => {
  response.clearCookie("token");
  return response.status(200).send({ message: "Logged out successfully" });
});

export default router;
