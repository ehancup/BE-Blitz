/*
  Warnings:

  - Added the required column `invoice` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `invoice` VARCHAR(191) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `ship_status` ENUM('wait', 'process', 'shipping', 'error', 'done', 'cancel_user', 'cancel_seller') NOT NULL DEFAULT 'wait';
