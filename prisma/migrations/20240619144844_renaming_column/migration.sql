/*
  Warnings:

  - You are about to drop the column `storeId` on the `chatroom` table. All the data in the column will be lost.
  - Added the required column `store_d` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `chatroom` DROP FOREIGN KEY `ChatRoom_storeId_fkey`;

-- AlterTable
ALTER TABLE `chatroom` DROP COLUMN `storeId`,
    ADD COLUMN `store_d` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `ChatRoom` ADD CONSTRAINT `ChatRoom_store_d_fkey` FOREIGN KEY (`store_d`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
