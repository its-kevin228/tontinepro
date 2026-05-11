import {
  PrismaClient,
  UserRole,
  Frequency,
  CircleStatus,
  CycleStatus,
  MembershipRole,
  PaymentStatus,
  PaymentMethod,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding TontinePro...\n");

  const password = await bcrypt.hash("Test1234!", 12);

  // ──────────────────────────────────────────────────────────────────────────
  // 1. UTILISATEURS
  // ──────────────────────────────────────────────────────────────────────────

  const admin = await prisma.user.upsert({
    where: { email: "admin@tontinepro.com" },
    update: { isVerified: true },
    create: { name: "Super Admin", email: "admin@tontinepro.com", password, role: UserRole.SUPER_ADMIN, isVerified: true },
  });

  const organisateur = await prisma.user.upsert({
    where: { email: "kevin@tontinepro.com" },
    update: { isVerified: true },
    create: { name: "Kevin Organisateur", email: "kevin@tontinepro.com", password, role: UserRole.ORGANISATEUR, isVerified: true },
  });

  // Membre 1 — a déjà payé (CONFIRMED) → verra "Cotisation payée ✓"
  const membre1 = await prisma.user.upsert({
    where: { email: "membre1@test.com" },
    update: { isVerified: true },
    create: { name: "Membre 1", email: "membre1@test.com", password, role: UserRole.MEMBRE, isVerified: true },
  });

  // Membre 2 — a déjà payé (CONFIRMED) → verra "Cotisation payée ✓"
  const membre2 = await prisma.user.upsert({
    where: { email: "membre2@test.com" },
    update: { isVerified: true },
    create: { name: "Membre 2", email: "membre2@test.com", password, role: UserRole.MEMBRE, isVerified: true },
  });

  // Membre 3 — N'A PAS ENCORE PAYÉ → verra le bouton "Payer ma cotisation"
  const membre3 = await prisma.user.upsert({
    where: { email: "membre3@test.com" },
    update: { isVerified: true },
    create: { name: "Membre 3", email: "membre3@test.com", password, role: UserRole.MEMBRE, isVerified: true },
  });

  // Membre 4 — N'A PAS ENCORE PAYÉ → verra le bouton "Payer ma cotisation"
  const membre4 = await prisma.user.upsert({
    where: { email: "membre4@test.com" },
    update: { isVerified: true },
    create: { name: "Membre 4", email: "membre4@test.com", password, role: UserRole.MEMBRE, isVerified: true },
  });

  // Membre TEST — compte vierge, aucun paiement, pour tester le flow complet
  const membreTest = await prisma.user.upsert({
    where: { email: "test@tontinepro.com" },
    update: { isVerified: true },
    create: { name: "Membre Test", email: "test@tontinepro.com", password, role: UserRole.MEMBRE, isVerified: true },
  });

  console.log("✅ 7 utilisateurs créés");

  // ──────────────────────────────────────────────────────────────────────────
  // 2. CERCLE
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
      maxMembers: 6,
      isPublic: false,
      status: CircleStatus.ACTIVE,
      creatorId: organisateur.id,
    },
  });
  console.log("✅ Cercle créé :", circle.name);

  // ──────────────────────────────────────────────────────────────────────────
  // 3. MEMBERSHIPS
  // ──────────────────────────────────────────────────────────────────────────

  const allMembers = [
    { user: organisateur, role: MembershipRole.ORGANISATEUR, order: 1 },
    { user: membre1,      role: MembershipRole.MEMBRE,       order: 2 },
    { user: membre2,      role: MembershipRole.MEMBRE,       order: 3 },
    { user: membre3,      role: MembershipRole.MEMBRE,       order: 4 },
    { user: membre4,      role: MembershipRole.MEMBRE,       order: 5 },
    { user: membreTest,   role: MembershipRole.MEMBRE,       order: 6 },
  ];

  for (const { user, role, order } of allMembers) {
    await prisma.membership.upsert({
      where: { userId_circleId: { userId: user.id, circleId: circle.id } },
      update: {},
      create: { userId: user.id, circleId: circle.id, role, order },
    });
  }
  console.log("✅ 6 memberships créés");

  // ──────────────────────────────────────────────────────────────────────────
  // 4. CYCLE OUVERT
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
      status: CycleStatus.OPEN,
    },
  });
  console.log("✅ Cycle #1 créé (OPEN, se termine le", endDate.toLocaleDateString("fr-FR"), ")");

  // ──────────────────────────────────────────────────────────────────────────
  // 5. PAIEMENTS — seulement Membre 1 et Membre 2 ont payé
  //    Membre 3, Membre 4 et Membre Test n'ont PAS payé → bouton visible
  // ──────────────────────────────────────────────────────────────────────────

  // Supprimer les anciens paiements du cycle pour éviter les doublons
  await prisma.payment.deleteMany({ where: { cycleId: cycle.id } });

  const memberships = await prisma.membership.findMany({ where: { circleId: circle.id } });

  const paidMembers = [
    { user: membre1, method: PaymentMethod.CASH },
    { user: membre2, method: PaymentMethod.VIREMENT },
  ];

  for (const { user, method } of paidMembers) {
    const ms = memberships.find((m) => m.userId === user.id);
    if (!ms) continue;
    await prisma.payment.create({
      data: {
        userId: user.id,
        cycleId: cycle.id,
        membershipId: ms.id,
        amount: 25000,
        method,
        status: PaymentStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
    });
  }
  console.log("✅ 2 paiements confirmés (Membre 1 + Membre 2)");
  console.log("   → Membre 3, Membre 4 et Membre Test n'ont PAS payé");

  // ──────────────────────────────────────────────────────────────────────────
  // 6. KYC
  // ──────────────────────────────────────────────────────────────────────────

  await prisma.kycRequest.upsert({
    where: { userId: membre1.id },
    update: {},
    create: { userId: membre1.id, documentUrl: "https://drive.google.com/file/d/exemple-cni" },
  });
  console.log("✅ 1 demande KYC en attente (Membre 1)");

  // ──────────────────────────────────────────────────────────────────────────
  // 7. PARAMÈTRES PLATEFORME
  // ──────────────────────────────────────────────────────────────────────────

  await prisma.platformSetting.upsert({
    where: { key: "service_fee" },
    update: {},
    create: { key: "service_fee", value: "1" },
  });
  await prisma.platformSetting.upsert({
    where: { key: "transaction_fee" },
    update: {},
    create: { key: "transaction_fee", value: "50" },
  });
  console.log("✅ Paramètres plateforme : service_fee=1%, transaction_fee=50 FCFA");

  // ──────────────────────────────────────────────────────────────────────────
  // 8. NOTIFICATIONS
  // ──────────────────────────────────────────────────────────────────────────

  await prisma.notification.createMany({
    data: [
      { userId: organisateur.id, title: "Bienvenue 🎉", body: "Votre cercle 'Tontine Famille Lomé' est actif." },
      { userId: membre1.id, title: "Paiement confirmé ✅", body: "Votre paiement de 25 000 FCFA a été confirmé." },
      { userId: membre2.id, title: "Paiement confirmé ✅", body: "Votre paiement de 25 000 FCFA a été confirmé." },
    ],
  });
  console.log("✅ 3 notifications créées\n");

  // ──────────────────────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🎉 Seed terminé !");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("");
  console.log("  👑 Super Admin     : admin@tontinepro.com   / Test1234!");
  console.log("  👔 Organisateur    : kevin@tontinepro.com   / Test1234!");
  console.log("");
  console.log("  ✅ A déjà payé     : membre1@test.com       / Test1234!");
  console.log("  ✅ A déjà payé     : membre2@test.com       / Test1234!");
  console.log("");
  console.log("  💳 Peut payer      : membre3@test.com       / Test1234!");
  console.log("  💳 Peut payer      : membre4@test.com       / Test1234!");
  console.log("  💳 Compte vierge   : test@tontinepro.com    / Test1234!  ← UTILISER POUR TESTER");
  console.log("");
  console.log("  Cercle : http://localhost:3000/dashboard/circles/seed-circle-001");
  console.log("═══════════════════════════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
