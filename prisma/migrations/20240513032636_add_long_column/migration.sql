/*
  Warnings:

  - You are about to drop the column `bio` on the `store` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `address` MODIFY `address` TEXT NOT NULL,
    MODIFY `note` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `product` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `store` DROP COLUMN `bio`,
    MODIFY `description` TEXT NULL;
