import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";

// Schémas de validation
const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
  role: z.enum([UserRole.MEMBRE, UserRole.ORGANISATEUR]).default(UserRole.MEMBRE),
});

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

// POST /api/auth/register
export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Un compte existe déjà avec cet email" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { 
      name, 
      email, 
      password: hashedPassword,
      role 
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    status: "ACTIVE",
  });

  res.status(201).json({ token, user });
}

// POST /api/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: "Email ou mot de passe incorrect" });
    return;
  }

  if (user.status === "BANNED" || user.status === "SUSPENDED") {
    res.status(403).json({ error: "Compte suspendu ou banni" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Email ou mot de passe incorrect" });
    return;
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

// GET /api/auth/me
export async function me(req: Request, res: Response): Promise<void> {
  // req.user est injecté par le middleware requireAuth
  res.json({ user: req.user });
}

// PATCH /api/users/me
export async function updateMe(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true, updatedAt: true },
  });

  res.json({ user });
}