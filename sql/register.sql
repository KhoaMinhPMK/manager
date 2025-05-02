-- Create table for registration requests
CREATE TABLE IF NOT EXISTS `registration_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `desired_username` varchar(50) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `department` varchar(100) NOT NULL,
  `position` varchar(100) NOT NULL,
  `national_id` varchar(20) NOT NULL COMMENT 'CCCD/CMND number',
  `reason` text NOT NULL COMMENT 'Purpose for system access',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL COMMENT 'Admin user ID who processed the request',
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `desired_username` (`desired_username`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key for processed_by
ALTER TABLE `registration_requests` 
  ADD CONSTRAINT `fk_registration_admin` 
  FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) 
  ON DELETE SET NULL ON UPDATE CASCADE;
