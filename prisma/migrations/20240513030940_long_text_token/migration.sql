-- DropForeignKey
ALTER TABLE `orderdetail` DROP FOREIGN KEY `OrderDetail_order_id_fkey`;

-- AlterTable
ALTER TABLE `user` MODIFY `refresh_token` TEXT NULL;

-- AlterTable
ALTER TABLE `wallet` MODIFY `currency` BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE `OrderDetail` ADD CONSTRAINT `OrderDetail_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
