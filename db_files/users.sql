-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 14, 2022 at 07:32 PM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.2.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rd`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `account_type` int(11) NOT NULL,
  `latest_org_id` int(11) DEFAULT NULL,
  `vote1` varchar(255) DEFAULT NULL,
  `vote2` varchar(255) DEFAULT NULL,
  `vote3` varchar(255) DEFAULT NULL,
  `vote4` varchar(255) DEFAULT NULL,
  `vote5` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `account_type`, `latest_org_id`, `vote1`, `vote2`, `vote3`, `vote4`, `vote5`) VALUES
(24, 'acc1', 'c592df4a86933b92addc9842402ddf198c638ea9be58916ee6e3734e1e3152f8', 1, 25, 'THZfYYSReDs', '2v0Yzh125Uo', NULL, NULL, NULL),
(25, 'org1', 'c592df4a86933b92addc9842402ddf198c638ea9be58916ee6e3734e1e3152f8', 0, NULL, NULL, NULL, NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
