-- AlterTable: make serviceId optional and add product fields to bookings
ALTER TABLE "bookings" ALTER COLUMN "serviceId" DROP NOT NULL;

ALTER TABLE "bookings" ADD COLUMN "productId" TEXT;
ALTER TABLE "bookings" ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "bookings_productId_idx" ON "bookings"("productId");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
