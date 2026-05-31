/*
  Warnings:

  - You are about to drop the `assessment_results` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `assessment_results` DROP FOREIGN KEY `assessment_results_childProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `assessment_results` DROP FOREIGN KEY `assessment_results_parentId_fkey`;

-- DropTable
DROP TABLE `assessment_results`;

-- CreateTable
CREATE TABLE `AssessmentResult` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `childProfileId` VARCHAR(191) NULL,
    `answers` JSON NOT NULL,
    `overallScore` INTEGER NOT NULL,
    `categoryResult` VARCHAR(191) NOT NULL,
    `focusSummary` VARCHAR(191) NOT NULL,
    `focusAreas` JSON NOT NULL,
    `skillsData` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AssessmentResult` ADD CONSTRAINT `AssessmentResult_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentResult` ADD CONSTRAINT `AssessmentResult_childProfileId_fkey` FOREIGN KEY (`childProfileId`) REFERENCES `child_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
