-- Keep the old TEACHER value long enough to migrate existing admin users.
ALTER TABLE `users`
  MODIFY `role` ENUM('PARENT', 'STUDENT', 'TEACHER', 'ADMINISTRATOR') NOT NULL;

UPDATE `users`
SET `role` = 'ADMINISTRATOR'
WHERE `role` = 'TEACHER';

ALTER TABLE `questions`
  ADD COLUMN `level` ENUM('CHILD', 'TEACHER') NOT NULL DEFAULT 'CHILD';
