-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 02, 2025 at 02:47 AM
-- Server version: 10.11.10-MariaDB
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u531045590_manager`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role_id` int(11) NOT NULL DEFAULT 2,
  `department` varchar(50) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `full_name`, `role_id`, `department`, `avatar`, `created_at`, `updated_at`, `last_login`, `status`) VALUES
(1, 'Nguyễn Hồng Thiên Ân', 'nhthienan701@gmail.com', '$2y$10$iO0SGvHQEWfnQMPo7syxS.adCkVhvHr.kKtGG1hzOQE5Tde8IhvYC', 'Nguyễn Hồng Thiên Ân', 1, 'Market Research', NULL, '2025-05-02 01:17:32', '2025-05-02 02:41:55', '2025-05-02 02:41:55', 1),
(2, 'Lê Minh Hoàng', 'minhhoanghsftg@gmail.com', '$2y$10$iO0SGvHQEWfnQMPo7syxS.adCkVhvHr.kKtGG1hzOQE5Tde8IhvYC', 'Lê Minh Hoàng', 3, 'Development', NULL, '2025-05-02 01:17:32', '2025-05-02 02:16:01', NULL, 1),
(3, 'Nguyễn Ngọc Mai Anh', 'anhngocmai212008@gmail.com', '$2y$10$iO0SGvHQEWfnQMPo7syxS.adCkVhvHr.kKtGG1hzOQE5Tde8IhvYC', 'Nguyễn Ngọc Mai Anh', 3, 'Design', NULL, '2025-05-02 01:17:32', '2025-05-02 02:16:01', NULL, 1),
(4, 'Phạm Quốc Huy', 'huy.phamcs@hcmut.edu.vn', '$2y$10$iO0SGvHQEWfnQMPo7syxS.adCkVhvHr.kKtGG1hzOQE5Tde8IhvYC', 'Phạm Quốc Huy', 2, 'Development', NULL, '2025-05-02 01:17:32', '2025-05-02 02:16:01', NULL, 1),
(5, 'Nguyễn Hải Yến', 'haiyen24108@gmail.com', '$2y$10$iO0SGvHQEWfnQMPo7syxS.adCkVhvHr.kKtGG1hzOQE5Tde8IhvYC', 'Nguyễn Hải Yến', 3, 'Design', NULL, '2025-05-02 01:17:32', '2025-05-02 02:16:01', NULL, 1),
(6, 'Nguyễn Khả Ái', 'kaai333777@gmail.com', '$2y$10$iO0SGvHQEWfnQMPo7syxS.adCkVhvHr.kKtGG1hzOQE5Tde8IhvYC', 'Nguyễn Khả Ái', 2, 'Design', NULL, '2025-05-02 01:17:32', '2025-05-02 02:16:01', NULL, 1),
(7, 'Trương Trung Kiên', 'trungkien28112006@gmail.com', '$2y$10$iO0SGvHQEWfnQMPo7syxS.adCkVhvHr.kKtGG1hzOQE5Tde8IhvYC', 'Trương Trung Kiên', 3, 'Market Research', NULL, '2025-05-02 01:17:32', '2025-05-02 02:16:01', NULL, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_department` (`department`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
