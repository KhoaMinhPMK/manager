-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `email` varchar(100) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role_id` int(11) NOT NULL DEFAULT 2,
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create roles table
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `permissions` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default roles
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'Admin', 'Administrator with full access'),
(2, 'Manager', 'Project manager with access to manage projects'),
(3, 'Member', 'Team member with limited access')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `description` = VALUES(`description`);

-- Insert test users (password: Test@123)
-- The password is hashed using password_hash() with PASSWORD_DEFAULT algorithm
INSERT INTO `users` (`username`, `email`, `password`, `full_name`, `role_id`, `status`) VALUES
('admin', 'admin@waiedu.com', '$2y$10$iO0SGvHQEWfnQMPo7syxS.adCkVhvHr.kKtGG1hzOQE5Tde8IhvYC', 'System Admin', 1, 1),
('manager', 'manager@waiedu.com', '$2y$10$iO0SGvHQEWfnQMPo7syxS.adCkVhvHr.kKtGG1hzOQE5Tde8IhvYC', 'Project Manager', 2, 1),
('user', 'user@waiedu.com', '$2y$10$iO0SGvHQEWfnQMPo7syxS.adCkVhvHr.kKtGG1hzOQE5Tde8IhvYC', 'Team Member', 3, 1)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- Create a table to store login tokens
CREATE TABLE IF NOT EXISTS `user_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
