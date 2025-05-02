-- Create teams table if it doesn't exist
CREATE TABLE IF NOT EXISTS `teams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `leader_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create team_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS `team_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `team_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` varchar(50) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `team_id` (`team_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default teams
INSERT INTO `teams` (`name`, `description`) VALUES
('Design', 'Team responsible for all design aspects of the project'),
('Development', 'Team responsible for coding and implementation'),
('Market Research', 'Team responsible for market analysis and research')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `description` = VALUES(`description`);

-- Password: Waiedu@123 (hashed)
-- Hashed using PHP's password_hash() function with PASSWORD_DEFAULT algorithm
SET @hashed_password = '$2y$10$iO0SGvHQEWfnQMPo7syxS.adCkVhvHr.kKtGG1hzOQE5Tde8IhvYC';

-- Insert team members with their info
-- 1. Nguyễn Hồng Thiên Ân (Admin - Market Research Team Lead)
INSERT INTO `users` (`username`, `email`, `password`, `full_name`, `role_id`, `status`)
VALUES ('Nguyễn Hồng Thiên Ân', 'nhthienan701@gmail.com', @hashed_password, 'Nguyễn Hồng Thiên Ân', 1, 1)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `full_name` = VALUES(`full_name`);

-- Get the user id for Nguyễn Hồng Thiên Ân
SELECT id INTO @user_an_id FROM `users` WHERE `username` = 'Nguyễn Hồng Thiên Ân';

-- 2. Lê Minh Hoàng (Backend Developer)
INSERT INTO `users` (`username`, `email`, `password`, `full_name`, `role_id`, `status`)
VALUES ('Lê Minh Hoàng', 'minhhoanghsftg@gmail.com', @hashed_password, 'Lê Minh Hoàng', 2, 1)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `full_name` = VALUES(`full_name`);

-- Get the user id for Lê Minh Hoàng
SELECT id INTO @user_hoang_id FROM `users` WHERE `username` = 'Lê Minh Hoàng';

-- 3. Nguyễn Ngọc Mai Anh (Designer)
INSERT INTO `users` (`username`, `email`, `password`, `full_name`, `role_id`, `status`)
VALUES ('Nguyễn Ngọc Mai Anh', 'anhngocmai212008@gmail.com', @hashed_password, 'Nguyễn Ngọc Mai Anh', 3, 1)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `full_name` = VALUES(`full_name`);

-- Get the user id for Nguyễn Ngọc Mai Anh
SELECT id INTO @user_maianh_id FROM `users` WHERE `username` = 'Nguyễn Ngọc Mai Anh';

-- 4. Phạm Quốc Huy (Backend Developer)
INSERT INTO `users` (`username`, `email`, `password`, `full_name`, `role_id`, `status`)
VALUES ('Phạm Quốc Huy', 'huy.phamcs@hcmut.edu.vn', @hashed_password, 'Phạm Quốc Huy', 2, 1)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `full_name` = VALUES(`full_name`);

-- Get the user id for Phạm Quốc Huy
SELECT id INTO @user_huy_id FROM `users` WHERE `username` = 'Phạm Quốc Huy';

-- 5. Nguyễn Hải Yến (Designer)
INSERT INTO `users` (`username`, `email`, `password`, `full_name`, `role_id`, `status`)
VALUES ('Nguyễn Hải Yến', 'haiyen24108@gmail.com', @hashed_password, 'Nguyễn Hải Yến', 3, 1)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `full_name` = VALUES(`full_name`);

-- Get the user id for Nguyễn Hải Yến
SELECT id INTO @user_yen_id FROM `users` WHERE `username` = 'Nguyễn Hải Yến';

-- 6. Nguyễn Khả Ái (Design Team Lead)
INSERT INTO `users` (`username`, `email`, `password`, `full_name`, `role_id`, `status`)
VALUES ('Nguyễn Khả Ái', 'kaai333777@gmail.com', @hashed_password, 'Nguyễn Khả Ái', 2, 1)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `full_name` = VALUES(`full_name`);

-- Get the user id for Nguyễn Khả Ái
SELECT id INTO @user_ai_id FROM `users` WHERE `username` = 'Nguyễn Khả Ái';

-- 7. Trương Trung Kiên (Market Researcher)
INSERT INTO `users` (`username`, `email`, `password`, `full_name`, `role_id`, `status`)
VALUES ('Trương Trung Kiên', 'trungkien28112006@gmail.com', @hashed_password, 'Trương Trung Kiên', 3, 1)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `full_name` = VALUES(`full_name`);

-- Get the user id for Trương Trung Kiên
SELECT id INTO @user_kien_id FROM `users` WHERE `username` = 'Trương Trung Kiên';

-- Update team leaders
UPDATE `teams` SET `leader_id` = @user_ai_id WHERE `name` = 'Design';
UPDATE `teams` SET `leader_id` = @user_hoang_id WHERE `name` = 'Development';
UPDATE `teams` SET `leader_id` = @user_an_id WHERE `name` = 'Market Research';

-- Get team IDs
SELECT id INTO @design_team_id FROM `teams` WHERE `name` = 'Design';
SELECT id INTO @dev_team_id FROM `teams` WHERE `name` = 'Development';
SELECT id INTO @market_team_id FROM `teams` WHERE `name` = 'Market Research';

-- Add team members
-- Design Team
INSERT INTO `team_members` (`team_id`, `user_id`, `role`)
VALUES 
(@design_team_id, @user_ai_id, 'Team Lead'),
(@design_team_id, @user_maianh_id, 'Designer'),
(@design_team_id, @user_yen_id, 'Designer')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Development Team
INSERT INTO `team_members` (`team_id`, `user_id`, `role`)
VALUES 
(@dev_team_id, @user_hoang_id, 'Team Lead'),
(@dev_team_id, @user_huy_id, 'Developer')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Market Research Team
INSERT INTO `team_members` (`team_id`, `user_id`, `role`)
VALUES 
(@market_team_id, @user_an_id, 'Team Lead'),
(@market_team_id, @user_kien_id, 'Researcher')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);
