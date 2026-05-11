import { prisma } from "./prisma.js";

export interface PlatformFees {
  serviceFeeRate: number;   // ex: 0.01 = 1% prélevé sur la cagnotte à la clôture
  transactionFee: number;   // ex: 50 = 50 FCFA fixes par paiement Mobile Money
}

/**
 * Lit les frais depuis PlatformSetting.
 * Valeurs par défaut : 0% service, 0 FCFA transaction.
 */
export async function getPlatformFees(): Promise<PlatformFees> {
  const settings = await prisma.platformSetting.findMany({
    where: { key: { in: ["service_fee", "transaction_fee"] } },
  });

  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const serviceFeeRate = parseFloat(map["service_fee"] ?? "0") / 100; // stocké en %, ex "1" → 0.01
  const transactionFee = parseFloat(map["transaction_fee"] ?? "0");

  return { serviceFeeRate, transactionFee };
}

/**
 * Calcule le montant net que reçoit le bénéficiaire après frais de service.
 * netAmount = grossAmount * (1 - serviceFeeRate)
 */
export function computeNetPayout(grossAmount: number, serviceFeeRate: number): {
  gross: number;
  fee: number;
  net: number;
} {
  const fee = Math.round(grossAmount * serviceFeeRate);
  return { gross: grossAmount, fee, net: grossAmount - fee };
}
