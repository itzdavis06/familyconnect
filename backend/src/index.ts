import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import {prisma}  from "./prisma";
import { requireAuth, AuthedRequest } from "./auth";

dotenv.config();

async function isDescendant(potentialDescendantId: string, ofPersonId: string): Promise<boolean> {
  const directChildren = await prisma.parentLink.findMany({
    where: { parentId: ofPersonId },
  });

  for (const link of directChildren) {
    if (link.childId === potentialDescendantId) return true;
    if (await isDescendant(potentialDescendantId, link.childId)) return true;
  }

  return false;
}

const app = express();
app.use(cors({ origin: "https://familyconnect-xi.vercel.app", credentials: true }));
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

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ error: "Password must contain at least one uppercase letter" });
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ error: "Password must contain at least one number" });
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
    sameSite: "none",
    secure: true,
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
    sameSite: "none",
    secure: true,
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

app.patch("/api/me/password", requireAuth, async (req: AuthedRequest, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password are required" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }
  if (!/[A-Z]/.test(newPassword)) {
    return res.status(400).json({ error: "New password must contain at least one uppercase letter" });
  }
  if (!/[0-9]/.test(newPassword)) {
    return res.status(400).json({ error: "New password must contain at least one number" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: req.userId! },
    data: { passwordHash: newPasswordHash },
  });

  res.json({ success: true });
});

app.delete("/api/me", requireAuth, async (req: AuthedRequest, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required to delete your account" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  const memberships = await prisma.familyMember.findMany({
    where: { userId: req.userId! },
  });

  for (const membership of memberships) {
      await prisma.parentLink.deleteMany({
        where: { parentId: membership.id },
      });
    }

  await prisma.familyMember.deleteMany({ where: { userId: req.userId! } });
  await prisma.message.deleteMany({ where: { senderId: req.userId! } });
  await prisma.user.delete({ where: { id: req.userId! } });

  res.clearCookie("token");
  res.json({ success: true });
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
      include: { user: true, parentLinksAsChild: true },
    });
  const result = members.map((m) => ({
      id: m.user ? m.user.id : null,
      memberId: m.id,
      username: m.user ? m.user.username : null,
      fullName: m.user ? m.user.fullName : m.childFullName,
      role: m.role,
      parentMemberIds: m.parentLinksAsChild.map((link) => link.parentId),
      isChild: !m.user && m.role === "CHILD",
      isAncestor: !m.user && m.role === "ANCESTOR",
      dateOfDeath: m.dateOfDeath,
    }));
    
  res.json(result);
});

app.post("/api/families/:familyId/members/:memberUserId/parents", requireAuth, async (req: AuthedRequest, res) => {
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

  const parentMember = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: parentUserId, familyId } },
  });

  if (!parentMember) {
    return res.status(404).json({ error: "Parent member not found in this family" });
  }

  if (parentMember.id === targetMember.id) {
    return res.status(400).json({ error: "A member cannot be their own parent" });
  }

  if (await isDescendant(parentMember.id, targetMember.id)) {
    return res.status(400).json({ error: "This would create a circular family relationship" });
  }

  const existing = await prisma.parentLink.findUnique({
    where: { parentId_childId: { parentId: parentMember.id, childId: targetMember.id } },
  });

  if (existing) {
    return res.status(409).json({ error: "This parent link already exists" });
  }

  await prisma.parentLink.create({
    data: { parentId: parentMember.id, childId: targetMember.id },
  });

  res.json({ success: true });
});

app.delete("/api/families/:familyId/members/:memberUserId/parents/:parentUserId", requireAuth, async (req: AuthedRequest, res) => {
  const { familyId, memberUserId, parentUserId } = req.params;

  const requesterMembership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: req.userId!, familyId } },
  });

  if (!requesterMembership || requesterMembership.role !== "ADMIN") {
    return res.status(403).json({ error: "Only family admins can edit the family tree" });
  }

  const targetMember = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: memberUserId, familyId } },
  });
  const parentMember = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: parentUserId, familyId } },
  });

  if (!targetMember || !parentMember) {
    return res.status(404).json({ error: "Member not found in this family" });
  }

  await prisma.parentLink.deleteMany({
    where: { parentId: parentMember.id, childId: targetMember.id },
  });

  res.json({ success: true });
});

app.delete("/api/families/:familyId/members/by-membership/:membershipId", requireAuth, async (req: AuthedRequest, res) => {
  const { familyId, membershipId } = req.params;

  const requesterMembership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: req.userId!, familyId } },
  });

  if (!requesterMembership || requesterMembership.role !== "ADMIN") {
    return res.status(403).json({ error: "Only family admins can remove members" });
  }

  const targetMembership = await prisma.familyMember.findUnique({
    where: { id: membershipId },
  });

  if (!targetMembership || targetMembership.familyId !== familyId) {
    return res.status(404).json({ error: "Member not found in this family" });
  }

  if (targetMembership.id === requesterMembership.id) {
    return res.status(400).json({ error: "You cannot remove yourself. Transfer admin first." });
  }

  await prisma.parentLink.deleteMany({
    where: { parentId: targetMembership.id },
  });

  await prisma.familyMember.delete({ where: { id: targetMembership.id } });

  res.json({ success: true });
});

app.post("/api/families/:familyId/members-by-id/:memberId/parents", requireAuth, async (req: AuthedRequest, res) => {
  const { familyId, memberId } = req.params;
  const { parentMemberId } = req.body;

  const requesterMembership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: req.userId!, familyId } },
  });

  if (!requesterMembership || requesterMembership.role !== "ADMIN") {
    return res.status(403).json({ error: "Only family admins can edit the family tree" });
  }

  const targetMember = await prisma.familyMember.findUnique({ where: { id: memberId } });
  const parentMember = await prisma.familyMember.findUnique({ where: { id: parentMemberId } });

  if (!targetMember || targetMember.familyId !== familyId) {
    return res.status(404).json({ error: "Member not found in this family" });
  }
  if (!parentMember || parentMember.familyId !== familyId) {
    return res.status(404).json({ error: "Parent not found in this family" });
  }
  if (targetMember.id === parentMember.id) {
    return res.status(400).json({ error: "A member cannot be their own parent" });
  }

  const existing = await prisma.parentLink.findUnique({
    where: { parentId_childId: { parentId: parentMember.id, childId: targetMember.id } },
  });

  if (existing) {
    return res.status(409).json({ error: "This parent link already exists" });
  }

  await prisma.parentLink.create({
    data: { parentId: parentMember.id, childId: targetMember.id },
  });

  res.json({ success: true });
});

app.delete("/api/families/:familyId/members-by-id/:memberId/parents/:parentMemberId", requireAuth, async (req: AuthedRequest, res) => {
  const { familyId, memberId, parentMemberId } = req.params;

  const requesterMembership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: req.userId!, familyId } },
  });

  if (!requesterMembership || requesterMembership.role !== "ADMIN") {
    return res.status(403).json({ error: "Only family admins can edit the family tree" });
  }

  await prisma.parentLink.deleteMany({
    where: { parentId: parentMemberId, childId: memberId },
  });

  res.json({ success: true });
});

app.post("/api/families/:familyId/leave", requireAuth, async (req: AuthedRequest, res) => {
  const { familyId } = req.params;

  const membership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: req.userId!, familyId } },
  });

  if (!membership) {
    return res.status(404).json({ error: "You're not a member of this family" });
  }

  if (membership.role === "ADMIN") {
    return res.status(400).json({
      error: "Admins cannot leave a family. Transfer admin to someone else first, or delete the family.",
    });
  }

  await prisma.parentLink.deleteMany({
    where: { parentId: membership.id },
  });

  await prisma.familyMember.delete({ where: { id: membership.id } });

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

 if (!requesterMembership) {
    return res.status(403).json({ error: "You're not a member of this family" });
  }

  const child = await prisma.familyMember.create({
    data: {
      familyId,
      role: "CHILD",
      childFullName: fullName,
      childDateOfBirth: dob,
      createdByUserId: req.userId!,
    },
  });

  const linkParentId = parentMemberId || requesterMembership.id;
  await prisma.parentLink.create({
    data: { parentId: linkParentId, childId: child.id },
  });

  res.status(201).json({ id: child.id, fullName: child.childFullName });
});

app.post("/api/families/:familyId/ancestors", requireAuth, async (req: AuthedRequest, res) => {
  const { familyId } = req.params;
  const { fullName, dateOfBirth, dateOfDeath, childMemberId } = req.body;

  if (!fullName) {
    return res.status(400).json({ error: "Full name is required" });
  }

  if (dateOfBirth) {
    const dob = new Date(dateOfBirth);
    if (dob > new Date()) {
      return res.status(400).json({ error: "Date of birth cannot be in the future" });
    }
  }

  const requesterMembership = await prisma.familyMember.findUnique({
    where: { userId_familyId: { userId: req.userId!, familyId } },
  });

  if (!requesterMembership || requesterMembership.role !== "ADMIN") {
    return res.status(403).json({ error: "Only family admins can add an ancestor" });
  }

  const ancestor = await prisma.familyMember.create({
    data: {
      familyId,
      role: "ANCESTOR",
      childFullName: fullName,
      childDateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      dateOfDeath: dateOfDeath ? new Date(dateOfDeath) : null,
      createdByUserId: req.userId!,
    },
  });

  // If a specific descendant was chosen, link that person's parent to this new ancestor
    if (childMemberId) {
      await prisma.parentLink.create({
        data: { parentId: ancestor.id, childId: childMemberId },
      });
    }

  res.status(201).json({ id: ancestor.id, fullName: ancestor.childFullName });
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

app.post("/api/direct-messages/:recipientId", requireAuth, async (req: AuthedRequest, res) => {
  const { recipientId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  if (recipientId === req.userId) {
    return res.status(400).json({ error: "You cannot message yourself" });
  }

  const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
  if (!recipient) {
    return res.status(404).json({ error: "Recipient not found" });
  }

  const message = await prisma.directMessage.create({
    data: {
      content: content.trim(),
      senderId: req.userId!,
      recipientId,
    },
  });

  res.status(201).json(message);
});

app.get("/api/direct-messages/:otherUserId", requireAuth, async (req: AuthedRequest, res) => {
  const { otherUserId } = req.params;

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: req.userId!, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: req.userId! },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  res.json(messages);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});