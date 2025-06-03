-- CreateTable
CREATE TABLE `Stopword` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `word` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Stopword_word_key`(`word`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE FULLTEXT INDEX `posts_title_content_idx` ON `posts`(`title`, `content`);
