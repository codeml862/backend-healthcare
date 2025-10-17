/*
  Warnings:

  - You are about to drop the column `batchNumber` on the `Tablet` table. All the data in the column will be lost.
  - You are about to drop the column `dosage` on the `Tablet` table. All the data in the column will be lost.
  - You are about to drop the column `expiryDate` on the `Tablet` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `Tablet` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Tablet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tablet" DROP COLUMN "batchNumber",
DROP COLUMN "dosage",
DROP COLUMN "expiryDate",
DROP COLUMN "manufacturer",
DROP COLUMN "quantity";
