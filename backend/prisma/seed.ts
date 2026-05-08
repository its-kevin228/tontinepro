import { PrismaClient, UserRole, Frequency, CircleStatus, CycleStatus, MembershipRole, PaymentStatus, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding TontinePro...\n");

  // ──────────────────────────────────────────────────────────────────────────
  // 1. UTILISATEURS
  // ──────────────────────────────────────────────────────────────────────────
  const password = await bcrypt.hash("Test1234!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@tontinepro.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@tontinepro.com",
      password,
      role: UserRole.SUPER_ADMIN,
    },
  });
  console.log("✅ Super Admin créé :", admin.email);

  const organisateur = await prisma.user.upsert({
    where: { email: "kevin@tontinepro.com" },
    update: {},
    create: {
      name: "Kevin Organisateur",
      email: "kevin@tontinepro.com",
      password,
      role: UserRole.ORGANISATEUR,
    },
  });
  console.log("✅ Organisateur créé :", organisateur.email);

  const membres = [];
  for (let i = 1; i <= 4; i++) {
    const m = await prisma.user.upsert({
      where: { email: `membre${i}@test.com` },
      update: {},
      create: {
        name: `Membre ${i}`,
        email: `membre${i}@test.com`,
        password,
        role: UserRole.MEMBRE,
      },
    });
    membres.push(m);
    console.log(`✅ Membre créé : ${m.email}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. CERCLE + MEMBERSHIPS
  // ──────────────────────────────────────────────────────────────────────────
  const circle = await prisma.circle.upsert({
    where: { id: "seed-circle-001" },
    update: {},
    create: {
      id: "seed-circle-001",
      name: "Tontine Famille Lomé",
      description: "Cercle familial pour l'épargne mensuelle",
      amount: 25000,
      frequency: Frequency.MONTHLY,
      maxMembers: 5,
      isPublic: false,
      status: CircleStatus.ACTIVE,
    },
  });
  console.log("\n✅ Cercle créé :", circle.name);

  // Organisateur = membre du cercle
  await prisma.membership.upsert({
    where: { userId_circleId: { userId: organisateur.id, circleId: circle.id } },
    update: {},
    create: {
      userId: organisateur.id,
      circleId: circle.id,
      role: MembershipRole.ORGANISATEUR,
      order: 1,
    },
  });

  // Ajouter les 4 membres
  for (let i = 0; i < membres.length; i++) {
    await prisma.membership.upsert({
      where: { userId_circleId: { userId: membres[i].id, circleId: circle.id } },
      update: {},
      create: {
        userId: membres[i].id,
        circleId: circle.id,
        role: MembershipRole.MEMBRE,
        order: i + 2,
      },
    });
  }
  console.log("✅ 5 memberships créés (1 organisateur + 4 membres)");

  // ──────────────────────────────────────────────────────────────────────────
  // 3. CYCLE
  // ──────────────────────────────────────────────────────────────────────────
  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + 1);

  const cycle = await prisma.cycle.upsert({
    where: { id: "seed-cycle-001" },
    update: {},
    create: {
      id: "seed-cycle-001",
      circleId: circle.id,
      number: 1,
      startDate: now,
      endDate,
      beneficiary: organisateur.id,
      status: CycleStatus.OPEN,
    },
  });
  console.log("✅ Cycle #1 créé (OPEN)");

  // ──────────────────────────────────────────────────────────────────────────
  // 4. PAIEMENTS (2 confirmés, 1 en attente, 1 rejeté)
  // ──────────────────────────────────────────────────────────────────────────
  const memberships = await prisma.membership.findMany({
    where: { circleId: circle.id },
  });

  const statuses = [PaymentStatus.CONFIRMED, PaymentStatus.CONFIRMED, PaymentStatus.PENDING, PaymentStatus.REJECTED];

  for (let i = 0; i < Math.min(membres.length, 4); i++) {
    const ms = memberships.find((m) => m.userId === membres[i].id);
    if (!ms) continue;

    await prisma.payment.create({
      data: {
        userId: membres[i].id,
        cycleId: cycle.id,
        membershipId: ms.id,
        amount: 25000,
        method: i % 2 === 0 ? PaymentMethod.CASH : PaymentMethod.VIREMENT,
        status: statuses[i],
        confirmedAt: statuses[i] === PaymentStatus.CONFIRMED ? new Date() : null,
      },
    });
  }
  console.log("✅ 4 paiements créés (2 confirmés, 1 en attente, 1 rejeté)");

  // ──────────────────────────────────────────────────────────────────────────
  // 5. KYC (1 en attente)
  // ──────────────────────────────────────────────────────────────────────────
  await prisma.kycRequest.upsert({
    where: { userId: membres[0].id },
    update: {},
    create: {
      userId: membres[0].id,
      documentUrl: "https://drive.google.com/file/d/exemple-cni",
    },
  });
  console.log("✅ 1 demande KYC en attente");

  // ──────────────────────────────────────────────────────────────────────────
  // 6. INVITATION
  // ──────────────────────────────────────────────────────────────────────────
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.invitation.create({
    data: {
      circleId: circle.id,
      email: "nouveau@test.com",
      expiresAt,
    },
  });
  console.log("✅ 1 invitation créée (valide 7 jours)");

  // ──────────────────────────────────────────────────────────────────────────
  // 7. NOTIFICATIONS
  // ──────────────────────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: organisateur.id, title: "Bienvenue sur TontinePro 🎉", body: "Votre cercle 'Tontine Famille Lomé' est actif." },
      { userId: organisateur.id, title: "Paiement confirmé ✅", body: "Le paiement de Membre 1 (25 000 FCFA) a été confirmé." },
      { userId: membres[0].id, title: "Paiement confirmé ✅", body: "Votre paiement de 25 000 FCFA a été confirmé." },
      { userId: membres[2].id, title: "Rappel de paiement ⏰", body: "Votre cotisation de 25 000 FCFA est en attente.", read: false },
    ],
  });
  console.log("✅ 4 notifications créées");

  // ──────────────────────────────────────────────────────────────────────────
  // 8. PARAMÈTRES PLATEFORME
  // ──────────────────────────────────────────────────────────────────────────
  await prisma.platformSetting.upsert({
    where: { key: "service_fee_percent" },
    update: {},
    create: { key: "service_fee_percent", value: "2" },
  });
  await prisma.platformSetting.upsert({
    where: { key: "max_circles_per_user" },
    update: {},
    create: { key: "max_circles_per_user", value: "5" },
  });
  console.log("✅ 2 paramètres plateforme créés\n");

  // ──────────────────────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════");
  console.log("🎉 Seed terminé ! Comptes de test :");
  console.log("═══════════════════════════════════════════════════");
  console.log("");
  console.log("  👑 Super Admin     : admin@tontinepro.com / Test1234!");
  console.log("  👔 Organisateur    : kevin@tontinepro.com / Test1234!");
  console.log("  👤 Membre 1        : membre1@test.com     / Test1234!");
  console.log("  👤 Membre 2        : membre2@test.com     / Test1234!");
  console.log("  👤 Membre 3        : membre3@test.com     / Test1234!");
  console.log("  👤 Membre 4        : membre4@test.com     / Test1234!");
  console.log("");
  console.log("═══════════════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
