-- Create table for password reset requests
CREATE TABLE IF NOT EXISTS `password_reset_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `national_id` varchar(20) NOT NULL COMMENT 'CCCD/CMND number',
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL COMMENT 'Admin user ID who processed the request',
  `processed_at` timestamp NULL DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL COMMENT 'Reset token (only set when approved)',
  `token_expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `email` (`email`),
  KEY `status` (`status`),
  KEY `token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key for processed_by if needed
ALTER TABLE `password_reset_requests` 
  ADD CONSTRAINT `fk_password_reset_admin` 
  FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) 
  ON DELETE SET NULL ON UPDATE CASCADE;
