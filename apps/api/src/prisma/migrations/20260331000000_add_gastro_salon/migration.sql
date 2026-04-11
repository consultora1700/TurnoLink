-- CreateEnum
CREATE TYPE "TableSessionStatus" AS ENUM ('OCCUPIED', 'ORDERING', 'BILL_REQUESTED', 'PAYMENT_ENABLED', 'PAID', 'CLOSED');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "priceDelivery" DECIMAL(10,2),
ADD COLUMN     "priceTakeaway" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "table_sessions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tableNumber" INTEGER NOT NULL,
    "status" "TableSessionStatus" NOT NULL DEFAULT 'OCCUPIED',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "totalAmount" DECIMAL(10,2),
    "tipAmount" DECIMAL(10,2),
    "tipType" TEXT,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "table_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_session_orders" (
    "id" TEXT NOT NULL,
    "tableSessionId" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL,
    "items" JSONB NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "table_session_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "table_sessions_tenantId_status_idx" ON "table_sessions"("tenantId", "status");

-- CreateIndex
CREATE INDEX "table_sessions_tenantId_tableNumber_idx" ON "table_sessions"("tenantId", "tableNumber");

-- CreateIndex
CREATE INDEX "table_session_orders_tableSessionId_idx" ON "table_session_orders"("tableSessionId");

-- AddForeignKey
ALTER TABLE "table_sessions" ADD CONSTRAINT "table_sessions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_session_orders" ADD CONSTRAINT "table_session_orders_tableSessionId_fkey" FOREIGN KEY ("tableSessionId") REFERENCES "table_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
