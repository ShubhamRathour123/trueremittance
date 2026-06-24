-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('bank_transfer', 'cash_pickup', 'wallet');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('bank_transfer', 'debit_card', 'cash');

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "affiliateUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Corridor" (
    "id" TEXT NOT NULL,
    "sourceCountry" TEXT NOT NULL,
    "sourceCurrency" TEXT NOT NULL,
    "targetCountry" TEXT NOT NULL,
    "targetCurrency" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Corridor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateQuote" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "corridorId" TEXT NOT NULL,
    "baseFee" DECIMAL(12,4) NOT NULL,
    "exchangeRate" DECIMAL(18,8) NOT NULL,
    "midMarketRate" DECIMAL(18,8),
    "deliveryMethod" "DeliveryMethod" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateQuote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_slug_key" ON "Provider"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Corridor_slug_key" ON "Corridor"("slug");

-- CreateIndex
CREATE INDEX "RateQuote_corridorId_providerId_timestamp_idx" ON "RateQuote"("corridorId", "providerId", "timestamp");

-- CreateIndex
CREATE INDEX "RateQuote_providerId_timestamp_idx" ON "RateQuote"("providerId", "timestamp");

-- AddForeignKey
ALTER TABLE "RateQuote" ADD CONSTRAINT "RateQuote_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateQuote" ADD CONSTRAINT "RateQuote_corridorId_fkey" FOREIGN KEY ("corridorId") REFERENCES "Corridor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
