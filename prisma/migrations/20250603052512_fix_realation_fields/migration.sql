/*
  Warnings:

  - You are about to drop the column `authorId` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `posts` table. All the data in the column will be lost.
  - Added the required column `authorName` to the `posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryName` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `posts` DROP FOREIGN KEY `posts_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `posts` DROP FOREIGN KEY `posts_categoryId_fkey`;

-- DropIndex
DROP INDEX `posts_authorId_fkey` ON `posts`;

-- DropIndex
DROP INDEX `posts_categoryId_fkey` ON `posts`;

-- AlterTable
ALTER TABLE `posts` DROP COLUMN `authorId`,
    DROP COLUMN `categoryId`,
    ADD COLUMN `authorName` VARCHAR(191) NOT NULL,
    ADD COLUMN `categoryName` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_categoryName_fkey` FOREIGN KEY (`categoryName`) REFERENCES `categories`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_authorName_fkey` FOREIGN KEY (`authorName`) REFERENCES `users`(`nickname`) ON DELETE CASCADE ON UPDATE CASCADE;
