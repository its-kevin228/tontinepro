import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import circleRoutes from "./routes/circle.routes.js";
import invitationRoutes from "./routes/invitation.routes.js";

const app = express();
const PORT = process.env.PORT ?? 4000;

// ─── Middlewares globaux ────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Routes ────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/circles", circleRoutes);
app.use("/api", invitationRoutes);

// Les autres routes seront ajoutées ici au fur et à mesure :
// app.use("/api/circles", circleRoutes);
// app.use("/api/payments", paymentRoutes);
// app.use("/api/cycles", cycleRoutes);
// app.use("/api/invitations", invitationRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/admin", adminRoutes);

// ─── Health check ──────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

// ─── 404 handler ───────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: "Route introuvable" });
});

// ─── Error handler global ──────────────────────────────────────────────────

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[Error]", err.message);
    res.status(500).json({
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Erreur interne du serveur",
    });
  }
);

// ─── Démarrage ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ Serveur TontinePro démarré sur http://localhost:${PORT}`);
  console.log(`   Environnement : ${process.env.NODE_ENV ?? "development"}`);
});

export default app;