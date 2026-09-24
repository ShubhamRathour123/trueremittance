-- CreateEnum
CREATE TYPE "QuoteSourceType" AS ENUM ('MANUAL', 'API', 'SCRAPER', 'PARTNER_FEED', 'OTHER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'MANUAL_REVIEWED', 'PROVIDER_QUOTE', 'FAILED');

-- AlterTable
ALTER TABLE "RateQuote"
ADD COLUMN "sendAmount" DECIMAL(12,4),
ADD COLUMN "sendCurrency" TEXT NOT NULL DEFAULT 'AED',
ADD COLUMN "receiveCurrency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN "feeCurrency" TEXT NOT NULL DEFAULT 'AED',
ADD COLUMN "deliverySpeed" TEXT,
ADD COLUMN "sourceType" "QuoteSourceType" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN "sourceReference" TEXT,
ADD COLUMN "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'MANUAL_REVIEWED',
ADD COLUMN "isPromotional" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "promotionExpiresAt" TIMESTAMP(3),
ADD COLUMN "minimumAmount" DECIMAL(12,4),
ADD COLUMN "maximumAmount" DECIMAL(12,4),
ADD COLUMN "notes" TEXT,
ADD COLUMN "statusMessage" TEXT,
ADD COLUMN "metadata" JSONB,
ADD COLUMN "fetchedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AffiliateClick" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "corridorSlug" TEXT,
    "amountBucket" TEXT,
    "placement" TEXT,
    "ranking" INTEGER,
    "ctaType" TEXT,
    "destination" TEXT NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateQuote_corridorId_timestamp_idx" ON "RateQuote"("corridorId", "timestamp");

-- CreateIndex
CREATE INDEX "RateQuote_sourceType_verificationStatus_idx" ON "RateQuote"("sourceType", "verificationStatus");

-- CreateIndex
CREATE INDEX "AffiliateClick_providerId_clickedAt_idx" ON "AffiliateClick"("providerId", "clickedAt");

-- CreateIndex
CREATE INDEX "AffiliateClick_corridorSlug_clickedAt_idx" ON "AffiliateClick"("corridorSlug", "clickedAt");

-- AddForeignKey
ALTER TABLE "AffiliateClick" ADD CONSTRAINT "AffiliateClick_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
