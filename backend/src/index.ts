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

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
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

app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
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

   res.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      dateOfBirth: user.dateOfBirth,
      email: user.email,
      phone: user.phone,
      occupation: user.occupation,
      location: user.location,
      createdAt: user.createdAt,
    });
    
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
});

app.patch("/api/me", requireAuth, async (req: AuthedRequest, res) => {
  const { fullName, dateOfBirth, email, phone, occupation, location } = req.body;

  try {
   
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (dob > new Date()) {
        return res.status(400).json({ error: "Date of birth cannot be in the future" });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: {
        fullName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        email,
        phone,
        occupation,
        location,
      },
    });

    res.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "That email is already in use by another account" });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
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

app.get("/api/families", requireAuth, async (req: AuthedRequest, res) => {
  const memberships = await prisma.familyMember.findMany({
    where: { userId: req.userId! },
    include: { family: true },
  });

  const families = memberships.map((m) => ({
    id: m.family.id,
    name: m.family.name,
    role: m.role,
  }));

  res.json(families);
});

app.post("/api/families/:familyId/invitations", requireAuth, async (req: AuthedRequest, res) => {
  const { familyId } = req.params;

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: req.userId!, familyId } },
  });

  if (!membership || membership.role !== "ADMIN") {
    return res.status(403).json({ error: "Only family admins can invite members" });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await prisma.invitation.create({
    data: { familyId, expiresAt },
  });

  res.status(201).json({
    token: invitation.token,
    expiresAt: invitation.expiresAt,
  });
});

app.post("/api/invitations/:token/accept", requireAuth, async (req: AuthedRequest, res) => {
  const { token } = req.params;

  const invitation = await prisma.invitation.findUnique({ where: { token } });

  if (!invitation) {
    return res.status(404).json({ error: "Invitation not found" });
  }
  if (invitation.used) {
    return res.status(410).json({ error: "This invitation has already been used" });
  }
  if (invitation.expiresAt < new Date()) {
    return res.status(410).json({ error: "This invitation has expired" });
  }

  const existing = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: req.userId!, familyId: invitation.familyId } },
  });
  if (existing) {
    return res.status(409).json({ error: "You're already a member of this family" });
  }

  await prisma.familyMember.create({
    data: {
      userId: req.userId!,
      familyId: invitation.familyId,
      role: invitation.role,
    },
  });

  await prisma.invitation.update({
    where: { token },
    data: { used: true },
  });

  const family = await prisma.family.findUnique({ where: { id: invitation.familyId } });

  res.json({ familyId: family!.id, familyName: family!.name });
});

app.get("/api/families/:familyId/members", requireAuth, async (req: AuthedRequest, res) => {
  const { familyId } = req.params;

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: req.userId!, familyId } },
  });

  if (!membership) {
    return res.status(403).json({ error: "You're not a member of this family" });
  }

 const members = await prisma.familyMember.findMany({
    where: { familyId },
    include: { user: true },
  });

  const result = members.map((m) => ({
    id: m.user ? m.user.id : null,
    memberId: m.id,
    username: m.user ? m.user.username : null,
    fullName: m.user ? m.user.fullName : m.childFullName,
    role: m.role,
    parentMemberId: m.parentMemberId,
    isChild: !m.user,
  }));
  
  res.json(result);
});

app.patch("/api/families/:familyId/members/:memberUserId/parent", requireAuth, async (req: AuthedRequest, res) => {
  const { familyId, memberUserId } = req.params;
  const { parentUserId } = req.body;

  const requesterMembership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: req.userId!, familyId } },
  });

  if (!requesterMembership || requesterMembership.role !== "ADMIN") {
    return res.status(403).json({ error: "Only family admins can edit the family tree" });
  }

  const targetMember = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: memberUserId, familyId } },
  });

  if (!targetMember) {
    return res.status(404).json({ error: "Member not found in this family" });
  }

  let parentMemberId: string | null = null;

  if (parentUserId) {
    const parentMember = await prisma.familyMember.findUnique({
      where: { userId_familyId: { userId: parentUserId, familyId } },
    });

    if (!parentMember) {
      return res.status(404).json({ error: "Parent member not found in this family" });
    }
    if (parentMember.id === targetMember.id) {
      return res.status(400).json({ error: "A member cannot be their own parent" });
    }

    parentMemberId = parentMember.id;
  }

  await prisma.familyMember.update({
    where: { id: targetMember.id },
    data: { parentMemberId },
  });

  res.json({ success: true });
});

app.post("/api/families/:familyId/children", requireAuth, async (req: AuthedRequest, res) => {
  const { familyId } = req.params;
  const { fullName, dateOfBirth, parentMemberId } = req.body;

  if (!fullName || !dateOfBirth) {
    return res.status(400).json({ error: "Full name and date of birth are required" });
  }

  const dob = new Date(dateOfBirth);
  if (dob > new Date()) {
    return res.status(400).json({ error: "Date of birth cannot be in the future" });
  }

  const requesterMembership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: req.userId!, familyId } },
  });

  if (!requesterMembership || (requesterMembership.role !== "ADMIN" && requesterMembership.role !== "PARENT")) {
    return res.status(403).json({ error: "Only admins and parents can add a child profile" });
  }

  const child = await prisma.familyMember.create({
    data: {
      familyId,
      role: "CHILD",
      childFullName: fullName,
      childDateOfBirth: dob,
      parentMemberId: parentMemberId || requesterMembership.id,
      createdByUserId: req.userId!,
    },
  });

  res.status(201).json({ id: child.id, fullName: child.childFullName });
});

app.post("/api/families/:familyId/messages", requireAuth, async (req: AuthedRequest, res) => {
  const { familyId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: req.userId!, familyId } },
  });

  if (!membership) {
    return res.status(403).json({ error: "You're not a member of this family" });
  }

  if (membership.role === "CHILD") {
    return res.status(403).json({ error: "Child profiles cannot send messages" });
  }

  const message = await prisma.message.create({
    data: { content: content.trim(), familyId, senderId: req.userId! },
    include: { sender: true },
  });

  res.status(201).json({
    id: message.id,
    content: message.content,
    createdAt: message.createdAt,
    senderId: message.senderId,
    senderName: message.sender.fullName || message.sender.username,
  });
});

app.get("/api/families/:familyId/messages", requireAuth, async (req: AuthedRequest, res) => {
  const { familyId } = req.params;

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: req.userId!, familyId } },
  });

  if (!membership) {
    return res.status(403).json({ error: "You're not a member of this family" });
  }

  const messages = await prisma.message.findMany({
    where: { familyId },
    include: { sender: true },
    orderBy: { createdAt: "asc" },
  });

  const result = messages.map((m) => ({
    id: m.id,
    content: m.content,
    createdAt: m.createdAt,
    senderId: m.senderId,
    senderName: m.sender.fullName || m.sender.username,
  }));

  res.json(result);
});



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});