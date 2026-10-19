/*
  Warnings:

  - You are about to drop the column `specialFeatures` on the `Product` table. All the data in the column will be lost.
  - Added the required column `paymentMethod` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "mpesaReceiptNumber" TEXT,
ADD COLUMN     "mpesaResultCode" TEXT,
ADD COLUMN     "mpesaTransactionId" TEXT,
ADD COLUMN     "paymentMethod" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "specialFeatures";
