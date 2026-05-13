-- AlterTable
ALTER TABLE "KycRequest" ADD COLUMN     "ocrAutoApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ocrConfidence" DOUBLE PRECISION,
ADD COLUMN     "ocrText" TEXT;
