import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
import { sendReminderEmail } from "../lib/mail.js";
import { notifyUser } from "../lib/sse.js";

/**
 * Rappel de cotisation — tourne tous les jours à 9h00
 * Envoie une notification in-app + email à chaque membre qui n'a pas encore payé
 * pour un cycle dont la date de fin est dans les prochaines 24h.
 */
export function startReminderJob(): void {
  cron.schedule("0 9 * * *", async () => {
    console.log("[ReminderJob] Vérification des échéances dans 24h...");

    try {
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      const cycles = await prisma.cycle.findMany({
        where: {
          status: "OPEN",
          endDate: { gte: in24h, lt: in48h },
        },
        include: {
          circle: {
            include: {
              memberships: {
                include: {
                  user: { select: { id: true, name: true, email: true } },
                },
              },
            },
          },
          payments: {
            where: { status: "CONFIRMED" },
            select: { userId: true },
          },
        },
      });

      let notifCount = 0;
      let emailCount = 0;

      for (const cycle of cycles) {
        const paidUserIds = new Set(cycle.payments.map((p) => p.userId));
        const unpaidMembers = cycle.circle.memberships.filter(
          (m) => !paidUserIds.has(m.userId)
        );

        if (unpaidMembers.length === 0) continue;

        // 1. Notifications in-app + SSE (une par une pour le push temps réel)
        for (const m of unpaidMembers) {
          await notifyUser(
            m.userId,
            "⏰ Rappel de cotisation",
            `Votre cotisation de ${cycle.circle.amount.toLocaleString("fr-FR")} FCFA pour "${cycle.circle.name}" est due dans moins de 24h (Cycle #${cycle.number}).`
          );
        }
        notifCount += unpaidMembers.length;

        // 2. Emails (envoi individuel pour personnalisation)
        for (const m of unpaidMembers) {
          if (!m.user.email) continue;
          await sendReminderEmail({
            name: m.user.name,
            email: m.user.email,
            circleName: cycle.circle.name,
            cycleNumber: cycle.number,
            amount: cycle.circle.amount,
            endDate: cycle.endDate!,
          });
          emailCount++;
        }
      }

      console.log(
        `[ReminderJob] ${notifCount} notification(s) in-app + ${emailCount} email(s) envoyé(s) pour ${cycles.length} cycle(s).`
      );
    } catch (error) {
      console.error("[ReminderJob] Erreur:", error);
    }
  });

  console.log("[ReminderJob] Planificateur démarré (tous les jours à 9h00).");
}
