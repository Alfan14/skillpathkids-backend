UPDATE `worksheets`
SET `slug` = CONCAT('worksheet-', `id`)
WHERE `slug` IS NULL OR `slug` = '';

UPDATE `worksheets`
SET `category` = 'Worksheet'
WHERE `category` IS NULL OR `category` = '';

UPDATE `worksheets`
SET `price` = 0
WHERE `price` IS NULL;

ALTER TABLE `worksheets`
  MODIFY `slug` VARCHAR(191) NOT NULL,
  MODIFY `category` VARCHAR(191) NOT NULL,
  MODIFY `price` INTEGER NOT NULL DEFAULT 0,
  MODIFY `discountPrice` INTEGER NULL,
  MODIFY `url` VARCHAR(191) NULL,
  MODIFY `accentColor` VARCHAR(191) NULL,
  MODIFY `iconName` VARCHAR(191) NULL;
