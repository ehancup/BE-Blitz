/*
  Warnings:

  - You are about to drop the column `total_ammount` on the `order` table. All the data in the column will be lost.
  - Added the required column `total_amount` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `total_ammount`,
    ADD COLUMN `total_amount` BIGINT NOT NULL;
