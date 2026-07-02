import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import {prisma}  from "./prisma";
import { requireAuth, AuthedRequest } from "./auth";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "FamilyConnect backend is running" });
});

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return res.status(409).json({ error: "Username already taken" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { username, passwordHash },
  });

  res.status(201).json({ id: user.id, username: user.username });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ id: user.id, username: user.username });
});

app.get("/api/me", async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ id: user.id, username: user.username });
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
});

app.post("/api/families", requireAuth, async (req: AuthedRequest, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Family name is required" });
  }

  const family = await prisma.family.create({
    data: {
      name,
      members: {
        create: {
          userId: req.userId!,
          role: "ADMIN",
        },
      },
    },
    include: {
      members: true,
    },
  });

  res.status(201).json(family);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});