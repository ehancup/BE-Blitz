/*
  Warnings:

  - You are about to drop the column `seller_name` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `total_item` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `total_price` on the `order` table. All the data in the column will be lost.
  - You are about to drop the `_ordertoproduct` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store_name` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_ammount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_quantity` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_ordertoproduct` DROP FOREIGN KEY `_OrderToProduct_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ordertoproduct` DROP FOREIGN KEY `_OrderToProduct_B_fkey`;

-- AlterTable
ALTER TABLE `address` ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `seller_name`,
    DROP COLUMN `total_item`,
    DROP COLUMN `total_price`,
    ADD COLUMN `store_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `total_ammount` BIGINT NOT NULL,
    ADD COLUMN `total_quantity` INTEGER NOT NULL,
    MODIFY `ship_status` ENUM('wait', 'process', 'shipping', 'error', 'done') NOT NULL DEFAULT 'wait';

-- AlterTable
ALTER TABLE `product` MODIFY `price` BIGINT NOT NULL;

-- DropTable
DROP TABLE `_ordertoproduct`;

-- CreateTable
CREATE TABLE `OrderDetail` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `product_name` VARCHAR(191) NOT NULL,
    `product_price` BIGINT NOT NULL,
    `quantity` INTEGER NOT NULL,
    `total_ammount` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetail` ADD CONSTRAINT `OrderDetail_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetail` ADD CONSTRAINT `OrderDetail_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
