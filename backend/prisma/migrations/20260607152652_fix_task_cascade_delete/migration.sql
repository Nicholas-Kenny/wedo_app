-- DropForeignKey
ALTER TABLE `tasks` DROP FOREIGN KEY `tasks_stageId_fkey`;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `board_stages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
