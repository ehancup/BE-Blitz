/*
  Warnings:

  - You are about to drop the column `store_d` on the `chatroom` table. All the data in the column will be lost.
  - Added the required column `store_id` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `chatroom` DROP FOREIGN KEY `ChatRoom_store_d_fkey`;

-- AlterTable
ALTER TABLE `chatroom` DROP COLUMN `store_d`,
    ADD COLUMN `store_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `ChatRoom` ADD CONSTRAINT `ChatRoom_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
