-- AlterTable
ALTER TABLE "print_agents" ADD COLUMN "detectedPrinters" JSONB,
ADD COLUMN "printersUpdatedAt" TIMESTAMP(3);
