import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.routes";
import circleRoutes from "./routes/circle.routes";
import invitationRoutes from "./routes/invitation.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import paymentRoutes from "./routes/payment.routes";
import notificationRoutes from "./routes/notification.routes";
import cycleRoutes, { closeCycleRoute } from "./routes/cycle.routes";
import analyticsRoutes from "./routes/analytics.routes";
import disputeRoutes from "./routes/dispute.routes";
import { startReminderJob } from "./jobs/reminder.job";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Servir les fichiers uploadés (documents KYC, etc.)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/circles", circleRoutes);
app.use("/api", invitationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/circles/:id/cycles", cycleRoutes);
app.use("/api/cycles", closeCycleRoute);
app.use("/api/organizer", analyticsRoutes);
app.use("/api/disputes", disputeRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Démarrer le planificateur de rappels
  startReminderJob();
});
