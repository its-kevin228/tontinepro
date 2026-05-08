import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { sendOTP } from "../lib/mail";

// Schémas de validation
const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
  role: z.enum([UserRole.MEMBRE, UserRole.ORGANISATEUR]).default(UserRole.MEMBRE),
});

const verifyEmailSchema = z.object({
  email: z.string().email("Email invalide"),
  code: z.string().length(6, "Le code doit faire 6 chiffres"),
});

const resendOTPSchema = z.object({
  email: z.string().email("Email invalide"),
});

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
  rememberMe: z.boolean().optional(), // Ajout ici
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
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const user = await prisma.user.create({
    data: { 
      name, 
      email, 
      password: hashedPassword,
      role,
      otpCode,
      otpExpires
    },
    select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true },
  });

  await sendOTP(email, otpCode);

  res.status(201).json({ 
    message: "Compte créé. Veuillez vérifier votre email.",
    user: { id: user.id, email: user.email } 
  });
}

// POST /api/auth/verify-email
export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const parsed = verifyEmailSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { email, code } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.otpCode !== code) {
    res.status(400).json({ error: "Code de vérification invalide" });
    return;
  }

  if (user.otpExpires && user.otpExpires < new Date()) {
    res.status(400).json({ error: "Le code a expiré" });
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { 
      isVerified: true, 
      otpCode: null, 
      otpExpires: null 
    },
    select: { id: true, name: true, email: true, role: true, isVerified: true },
  });

  const token = signToken({
    userId: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
    status: "ACTIVE",
  });

  res.json({ token, user: updatedUser });
}

// POST /api/auth/resend-otp
export async function resendOTP(req: Request, res: Response): Promise<void> {
  const parsed = resendOTPSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(404).json({ error: "Utilisateur non trouvé" });
    return;
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode, otpExpires }
  });

  await sendOTP(email, otpCode);

  res.json({ message: "Nouveau code envoyé" });
}

// POST /api/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { email, password, rememberMe } = parsed.data;

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

  const token = signToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    rememberMe ? "30d" : "7d" // 30 jours si coché, sinon 7 jours
  );

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