-- CreateTable
CREATE TABLE IF NOT EXISTS "industry_groups" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "industries" TEXT NOT NULL DEFAULT '[]',
    "limitLabels" TEXT NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "industry_groups_slug_key" ON "industry_groups"("slug");

-- AlterTable - Add industryGroupId to subscription_plans
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "industryGroupId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "subscription_plans_industryGroupId_idx" ON "subscription_plans"("industryGroupId");

-- AddForeignKey
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_industryGroupId_fkey" FOREIGN KEY ("industryGroupId") REFERENCES "industry_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
