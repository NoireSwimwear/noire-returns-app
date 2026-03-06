-- CreateTable
CREATE TABLE "ReturnRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "customerEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReturnRequest_orderId_idx" ON "ReturnRequest"("orderId");

-- CreateIndex
CREATE INDEX "Session_shop_idx" ON "Session"("shop");
