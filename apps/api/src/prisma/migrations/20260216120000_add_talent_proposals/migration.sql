-- CreateTable
CREATE TABLE "talent_proposals" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "senderTenantId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "availability" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "responseMessage" TEXT,
    "viewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "talent_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "talent_proposals_profileId_idx" ON "talent_proposals"("profileId");

-- CreateIndex
CREATE INDEX "talent_proposals_senderTenantId_idx" ON "talent_proposals"("senderTenantId");

-- CreateIndex
CREATE INDEX "talent_proposals_status_idx" ON "talent_proposals"("status");

-- AddForeignKey
ALTER TABLE "talent_proposals" ADD CONSTRAINT "talent_proposals_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "professional_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_proposals" ADD CONSTRAINT "talent_proposals_senderTenantId_fkey" FOREIGN KEY ("senderTenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
