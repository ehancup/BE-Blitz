-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_address_id_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_store_id_fkey`;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_address_id_fkey` FOREIGN KEY (`address_id`) REFERENCES `Address`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
