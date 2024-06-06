-- DropForeignKey
ALTER TABLE `categorytoproduct` DROP FOREIGN KEY `CategoryToProduct_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `categorytoproduct` DROP FOREIGN KEY `CategoryToProduct_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `productimage` DROP FOREIGN KEY `ProductImage_product_id_fkey`;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoryToProduct` ADD CONSTRAINT `CategoryToProduct_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoryToProduct` ADD CONSTRAINT `CategoryToProduct_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
