-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "flagReason" TEXT,
ADD COLUMN     "flaggedByOwner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerRespondedAt" TIMESTAMP(3),
ADD COLUMN     "ownerResponse" TEXT;

-- CreateIndex
CREATE INDEX "reviews_tenantId_flaggedByOwner_idx" ON "reviews"("tenantId", "flaggedByOwner");
