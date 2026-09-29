CREATE TABLE "ReferenceRate" (
    "id" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "quoteCurrency" TEXT NOT NULL,
    "rate" DECIMAL(18,8) NOT NULL,
    "source" TEXT NOT NULL,
    "sourceDate" TIMESTAMP(3) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferenceRate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReferenceRate_baseCurrency_quoteCurrency_source_sourceDate_key"
ON "ReferenceRate"("baseCurrency", "quoteCurrency", "source", "sourceDate");

CREATE INDEX "ReferenceRate_baseCurrency_quoteCurrency_sourceDate_idx"
ON "ReferenceRate"("baseCurrency", "quoteCurrency", "sourceDate");

CREATE INDEX "ReferenceRate_source_sourceDate_idx"
ON "ReferenceRate"("source", "sourceDate");
