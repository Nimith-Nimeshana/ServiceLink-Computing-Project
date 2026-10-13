-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 10, 2026 at 03:41 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `servicelink_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `public_id` varchar(30) NOT NULL,
  `actor` varchar(100) NOT NULL DEFAULT 'Admin User',
  `action` varchar(150) NOT NULL,
  `target` varchar(100) NOT NULL,
  `ip` varchar(45) NOT NULL DEFAULT '127.0.0.1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `public_id`, `actor`, `action`, `target`, `ip`, `created_at`, `updated_at`) VALUES
(1, 'LG-9001', 'Admin User', 'Requested provider changes', 'PA-298', '127.0.0.1', '2026-09-09 11:17:10', '2026-09-09 11:32:10'),
(2, 'LG-9000', 'Admin User', 'Suspended user account', 'US-1004', '127.0.0.1', '2026-09-09 09:32:10', '2026-09-09 11:32:10'),
(3, 'LG-8999', 'Admin User', 'Updated category', 'CT-05', '127.0.0.1', '2026-09-09 06:32:10', '2026-09-09 11:32:10'),
(4, 'LG-9005', 'Admin User', 'Suspended user account', 'US-1000', '127.0.0.1', '2026-09-09 11:55:10', '2026-09-09 11:55:10'),
(5, 'LG-9006', 'Admin User', 'Suspended user account', 'US-1001', '127.0.0.1', '2026-09-09 11:55:30', '2026-09-09 11:55:30');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `public_id` varchar(30) NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `provider_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(191) NOT NULL,
  `source` varchar(30) NOT NULL DEFAULT 'Direct booking',
  `date_display` varchar(50) NOT NULL DEFAULT '08 Sep 2026',
  `agreed_amount` decimal(12,2) NOT NULL DEFAULT 3500.00,
  `commission_rate` decimal(5,2) NOT NULL DEFAULT 10.00,
  `commission_amount` decimal(12,2) NOT NULL DEFAULT 350.00,
  `provider_net_amount` decimal(12,2) NOT NULL DEFAULT 3150.00,
  `status` varchar(30) NOT NULL DEFAULT 'accepted',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `public_id`, `customer_id`, `provider_id`, `title`, `source`, `date_display`, `agreed_amount`, `commission_rate`, `commission_amount`, `provider_net_amount`, `status`, `created_at`, `updated_at`) VALUES
(1, 'BK-1042', 2, 3, 'Home electrical repair', 'Direct booking', '08 Sep 2026', 3500.00, 10.00, 350.00, 3150.00, 'accepted', '2026-09-09 11:32:09', '2026-09-09 11:32:09'),
(2, 'BK-1038', 2, 3, 'Repair damaged ceiling light', 'Accepted offer', '05 Sep 2026', 3800.00, 10.00, 380.00, 3420.00, 'in progress', '2026-09-09 11:32:09', '2026-09-09 11:32:09'),
(3, 'BK-1026', 2, 3, 'Safety inspection', 'Direct booking', '28 Aug 2026', 4500.00, 10.00, 450.00, 4050.00, 'completed', '2026-09-09 11:32:09', '2026-09-09 11:32:09');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `public_id` varchar(30) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'active',
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `public_id`, `name`, `slug`, `description`, `status`, `sort_order`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'CT-01', 'Electrical', 'electrical', 'Electrical work', 'active', 1, 1, '2026-09-09 11:32:09', '2026-09-09 11:32:09'),
(2, 'CT-02', 'Plumbing', 'plumbing', 'Plumbing work', 'active', 2, 1, '2026-09-09 11:32:09', '2026-09-09 11:32:09'),
(3, 'CT-03', 'Computer Repair', 'computer-repair', 'IT support', 'active', 3, 1, '2026-09-09 11:32:09', '2026-09-09 11:32:09'),
(4, 'CT-04', 'Tutoring', 'tutoring', 'Tuition services', 'active', 4, 1, '2026-09-09 11:32:09', '2026-09-09 11:32:09'),
(5, 'CT-05', 'Photography', 'photography', 'Event photo shoot', 'inactive', 5, 1, '2026-09-09 11:32:09', '2026-09-09 11:32:09');

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `public_id` varchar(30) NOT NULL,
  `complainant_id` bigint(20) UNSIGNED NOT NULL,
  `against_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `record_reference` varchar(50) NOT NULL DEFAULT 'BK-1031',
  `subject` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'under_review',
  `resolution_note` text DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `complaints`
--

INSERT INTO `complaints` (`id`, `public_id`, `complainant_id`, `against_user_id`, `record_reference`, `subject`, `description`, `status`, `resolution_note`, `resolved_at`, `created_at`, `updated_at`) VALUES
(1, 'CP-081', 2, 4, 'BK-1031', 'Unexpected additional charge', 'The customer disputes an additional charge that was not understood.', 'under review', NULL, NULL, '2026-09-09 11:32:10', '2026-09-09 11:32:10'),
(2, 'CP-074', 5, 3, 'BK-1022', 'Provider did not attend scheduled time', 'Provider delayed visit.', 'resolved', NULL, NULL, '2026-09-09 11:32:10', '2026-09-09 11:32:10');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_09_09_164132_create_personal_access_tokens_table', 1),
(5, '2026_09_09_165626_create_servicelink_core_tables', 1);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `platform_settings`
--

CREATE TABLE `platform_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(100) NOT NULL,
  `value` text NOT NULL,
  `type` varchar(30) NOT NULL DEFAULT 'string',
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `platform_settings`
--

INSERT INTO `platform_settings` (`id`, `key`, `value`, `type`, `description`, `created_at`, `updated_at`) VALUES
(1, 'platform_name', 'ServiceLink', 'string', 'Platform name', '2026-09-09 11:32:10', '2026-09-09 11:32:10'),
(2, 'support_email', 'support@servicelink.test', 'string', 'Contact email', '2026-09-09 11:32:10', '2026-09-09 11:32:10'),
(3, 'commission_rate', '10', 'number', 'Default commission percentage', '2026-09-09 11:32:10', '2026-09-09 11:32:10'),
(4, 'commission_status', 'Enabled', 'string', 'Commission system state', '2026-09-09 11:32:10', '2026-09-09 11:32:10'),
(5, 'max_file_size_mb', '5', 'number', 'Max upload limit', '2026-09-09 11:32:10', '2026-09-09 11:32:10'),
(6, 'provider_review_target_days', '5', 'number', 'Target review days', '2026-09-09 11:32:10', '2026-09-09 11:32:10'),
(7, 'provider_registration', 'Enabled', 'string', 'Provider registration state', '2026-09-09 11:32:10', '2026-09-09 11:32:10'),
(8, 'wanted_ad_publishing', 'Enabled', 'string', 'Wanted ad publishing state', '2026-09-09 11:32:10', '2026-09-09 11:32:10');

-- --------------------------------------------------------

--
-- Table structure for table `provider_applications`
--

CREATE TABLE `provider_applications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `public_id` varchar(30) NOT NULL,
  `provider_id` bigint(20) UNSIGNED NOT NULL,
  `business_name` varchar(150) NOT NULL,
  `owner_name` varchar(150) NOT NULL,
  `categories_text` varchar(255) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'submitted',
  `submitted_at` timestamp NULL DEFAULT NULL,
  `review_started_at` timestamp NULL DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `decision_note` text DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `provider_applications`
--

INSERT INTO `provider_applications` (`id`, `public_id`, `provider_id`, `business_name`, `owner_name`, `categories_text`, `status`, `submitted_at`, `review_started_at`, `reviewed_at`, `reviewed_by`, `decision_note`, `summary`, `created_at`, `updated_at`) VALUES
(1, 'PA-301', 3, 'Kalana HomeTech', 'Kalana Induwara', 'Electrical, Home Maintenance', 'pending', '2026-09-05 11:32:09', NULL, NULL, NULL, NULL, 'Independent local provider applying to publish electrical and household maintenance services.', '2026-09-05 11:32:09', '2026-09-09 11:32:09'),
(2, 'PA-298', 5, 'CoolCare Services', 'S. Perera', 'Home Maintenance', 'changes requested', '2026-09-02 11:32:09', NULL, NULL, NULL, NULL, 'Air conditioning maintenance and cleaning services provider.', '2026-09-02 11:32:09', '2026-09-09 11:32:09'),
(3, 'PA-286', 4, 'North Central TechCare', 'N. Fernando', 'Computer Repair', 'approved', '2026-08-25 11:32:09', NULL, NULL, NULL, NULL, 'Computer hardware and diagnostic repairs.', '2026-08-25 11:32:09', '2026-09-09 11:32:09');

-- --------------------------------------------------------

--
-- Table structure for table `qualifications`
--

CREATE TABLE `qualifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `public_id` varchar(30) NOT NULL,
  `provider_application_id` bigint(20) UNSIGNED NOT NULL,
  `provider_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(191) NOT NULL,
  `issuer` varchar(191) NOT NULL,
  `issued_on` date DEFAULT NULL,
  `expires_on` date DEFAULT NULL,
  `file_path` varchar(255) NOT NULL DEFAULT 'documents/demo.pdf',
  `original_filename` varchar(255) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'pending',
  `review_note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `qualifications`
--

INSERT INTO `qualifications` (`id`, `public_id`, `provider_application_id`, `provider_id`, `title`, `issuer`, `issued_on`, `expires_on`, `file_path`, `original_filename`, `status`, `review_note`, `created_at`, `updated_at`) VALUES
(1, 'QL-101', 1, 3, 'National Certificate in Electrical Installation', 'Technical Training Institute', NULL, NULL, 'documents/demo.pdf', 'electrical-certificate.pdf', 'pending', NULL, '2026-09-09 11:32:09', '2026-09-09 11:32:09'),
(2, 'QL-102', 1, 3, 'Workplace Safety Training', 'Skills Development Centre', NULL, NULL, 'documents/demo.pdf', 'safety-training.pdf', 'pending', NULL, '2026-09-09 11:32:09', '2026-09-09 11:32:09'),
(3, 'QL-103', 2, 5, 'Air Conditioning Service Certificate', 'Technical College', NULL, NULL, 'documents/demo.pdf', 'ac-service-certificate.jpg', 'replacement requested', 'Please upload a clearer scan.', '2026-09-09 11:32:09', '2026-09-09 11:32:09');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `public_id` varchar(30) NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `provider_id` bigint(20) UNSIGNED NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL DEFAULT 5,
  `comment` text NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'published',
  `reports_count` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `public_id`, `booking_id`, `customer_id`, `provider_id`, `rating`, `comment`, `status`, `reports_count`, `created_at`, `updated_at`) VALUES
(1, 'RV-91', 3, 2, 3, 5, 'The inspection was completed clearly and on time.', 'published', 0, '2026-09-09 11:32:09', '2026-09-09 11:32:09'),
(2, 'RV-88', 1, 5, 4, 1, 'The provider did not explain the additional material charge.', 'reported', 2, '2026-09-09 11:32:09', '2026-09-09 11:32:09');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `public_id` varchar(30) NOT NULL,
  `provider_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(191) NOT NULL,
  `slug` varchar(220) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price_display` varchar(50) NOT NULL DEFAULT 'From LKR 2,500',
  `price_min` decimal(12,2) NOT NULL DEFAULT 2500.00,
  `status` varchar(30) NOT NULL DEFAULT 'active',
  `reports_count` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `public_id`, `provider_id`, `category_id`, `title`, `slug`, `description`, `price_display`, `price_min`, `status`, `reports_count`, `created_at`, `updated_at`) VALUES
(1, 'SV-101', 3, 1, 'Home Electrical Repair', NULL, NULL, 'From LKR 2,500', 2500.00, 'active', 0, '2026-09-09 11:32:09', '2026-09-09 11:32:09'),
(2, 'SV-118', 4, 2, 'Emergency Plumbing Visit', NULL, NULL, 'From LKR 4,000', 4000.00, 'active', 1, '2026-09-09 11:32:09', '2026-09-09 11:32:09'),
(3, 'SV-126', 4, 3, 'Laptop Diagnostics', NULL, NULL, 'LKR 1,800', 1800.00, 'paused', 0, '2026-09-09 11:32:09', '2026-09-09 11:32:09');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('s3RTYAweAFRmvga6e9noT8CB2Ttcsoohgm8PE9iu', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoid0gzVDVlMGVuSXZGMUt0ZWE2VVpNemh5Y2ZGMzV2bXc0ZFppb3RsSSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1788974117);

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `public_id` varchar(30) NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `provider_id` bigint(20) UNSIGNED NOT NULL,
  `source` varchar(50) NOT NULL DEFAULT 'Direct booking',
  `gross_amount` decimal(12,2) NOT NULL,
  `commission_rate` decimal(5,2) NOT NULL DEFAULT 10.00,
  `commission_amount` decimal(12,2) NOT NULL,
  `provider_net_amount` decimal(12,2) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'pending',
  `recorded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `public_id`, `booking_id`, `customer_id`, `provider_id`, `source`, `gross_amount`, `commission_rate`, `commission_amount`, `provider_net_amount`, `status`, `recorded_at`, `created_at`, `updated_at`) VALUES
(1, 'TR-401', 3, 2, 3, 'Direct booking', 4500.00, 10.00, 450.00, 4050.00, 'recorded', '2026-09-09 11:32:10', '2026-09-09 11:32:10', '2026-09-09 11:32:10'),
(2, 'TR-402', 2, 2, 3, 'Accepted offer', 3800.00, 10.00, 380.00, 3420.00, 'pending', NULL, '2026-09-09 11:32:10', '2026-09-09 11:32:10'),
(3, 'TR-403', 1, 2, 3, 'Direct booking', 3500.00, 10.00, 350.00, 3150.00, 'pending', NULL, '2026-09-09 11:32:10', '2026-09-09 11:32:10');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `public_id` varchar(30) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(30) NOT NULL DEFAULT 'customer',
  `status` varchar(30) NOT NULL DEFAULT 'active',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `public_id`, `name`, `email`, `phone`, `password`, `role`, `status`, `email_verified_at`, `remember_token`, `last_login_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'US-1000', 'Administrator', 'admin@servicelink.test', NULL, '$2y$12$3JaN.lliISnAxeALxjGQye0rrI1hUMLqGLZYmUD7i1tfr1JOn3HCC', 'administrator', 'suspended', NULL, NULL, NULL, '2026-09-09 11:32:07', '2026-09-09 11:55:09', NULL),
(2, 'US-1001', 'Kalana Induwara', 'kalana@example.com', NULL, '$2y$12$mpSX2aUWQcx.EOGGPTkZQ.pyHgrUX0gx8oWDFTpdpcKaJQBqZfxQq', 'customer', 'suspended', NULL, NULL, NULL, '2026-08-20 11:32:08', '2026-09-09 11:55:30', NULL),
(3, 'US-1002', 'Kalana HomeTech', 'kalana.provider@example.com', NULL, '$2y$12$rUg7ED0aZlO.PHNpYFJv8uMS7FnXbDz1E6Rd.T2DJBJyXEQ6zsz5G', 'provider', 'pending', NULL, NULL, NULL, '2026-08-22 11:32:08', '2026-09-09 11:32:08', NULL),
(4, 'US-1003', 'North Central TechCare', 'techcare@example.com', NULL, '$2y$12$cpGVA7bbJBgw1rF96X81TuDaoXr6rJSGWADS5b/RHhVj8c9WAQi3u', 'provider', 'active', NULL, NULL, NULL, '2026-08-15 11:32:08', '2026-09-09 11:32:08', NULL),
(5, 'US-1004', 'A. Customer', 'customer2@example.com', NULL, '$2y$12$mOlp8g8WLsQzrGA4hmDXS.RAe3pCzwpuSM9dDiHEA3WnUXds49v4u', 'customer', 'suspended', NULL, NULL, NULL, '2026-08-10 11:32:08', '2026-09-09 11:32:08', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `wanted_ads`
--

CREATE TABLE `wanted_ads` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `public_id` varchar(30) NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `district` varchar(100) NOT NULL DEFAULT 'Anuradhapura',
  `budget_display` varchar(100) NOT NULL DEFAULT 'LKR 8,000 - 12,000',
  `deadline_display` varchar(50) NOT NULL DEFAULT '10 Sep 2026',
  `status` varchar(30) NOT NULL DEFAULT 'active',
  `offers_count` int(11) NOT NULL DEFAULT 0,
  `reports_count` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wanted_ads`
--

INSERT INTO `wanted_ads` (`id`, `public_id`, `customer_id`, `category_id`, `title`, `description`, `district`, `budget_display`, `deadline_display`, `status`, `offers_count`, `reports_count`, `created_at`, `updated_at`) VALUES
(1, 'WA-208', 2, 1, 'Repair bedroom air conditioner', NULL, 'Anuradhapura', 'LKR 8,000 - 12,000', '10 Sep 2026', 'active', 4, 0, '2026-09-09 11:32:09', '2026-09-09 11:32:09'),
(2, 'WA-211', 2, 1, 'Install outdoor security lights', NULL, 'Mihintale', 'Negotiable', '12 Sep 2026', 'active', 2, 1, '2026-09-09 11:32:09', '2026-09-09 11:32:09'),
(3, 'WA-194', 5, 5, 'One-day event photography', NULL, 'Anuradhapura', 'LKR 25,000', 'Expired', 'expired', 2, 0, '2026-09-09 11:32:09', '2026-09-09 11:32:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `audit_logs_public_id_unique` (`public_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bookings_public_id_unique` (`public_id`),
  ADD KEY `bookings_customer_id_foreign` (`customer_id`),
  ADD KEY `bookings_provider_id_foreign` (`provider_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_public_id_unique` (`public_id`),
  ADD UNIQUE KEY `categories_name_unique` (`name`),
  ADD UNIQUE KEY `categories_slug_unique` (`slug`),
  ADD KEY `categories_created_by_foreign` (`created_by`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `complaints_public_id_unique` (`public_id`),
  ADD KEY `complaints_complainant_id_foreign` (`complainant_id`),
  ADD KEY `complaints_against_user_id_foreign` (`against_user_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `platform_settings`
--
ALTER TABLE `platform_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `platform_settings_key_unique` (`key`);

--
-- Indexes for table `provider_applications`
--
ALTER TABLE `provider_applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `provider_applications_public_id_unique` (`public_id`),
  ADD KEY `provider_applications_provider_id_foreign` (`provider_id`),
  ADD KEY `provider_applications_reviewed_by_foreign` (`reviewed_by`);

--
-- Indexes for table `qualifications`
--
ALTER TABLE `qualifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `qualifications_public_id_unique` (`public_id`),
  ADD KEY `qualifications_provider_application_id_foreign` (`provider_application_id`),
  ADD KEY `qualifications_provider_id_foreign` (`provider_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reviews_public_id_unique` (`public_id`),
  ADD KEY `reviews_booking_id_foreign` (`booking_id`),
  ADD KEY `reviews_customer_id_foreign` (`customer_id`),
  ADD KEY `reviews_provider_id_foreign` (`provider_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `services_public_id_unique` (`public_id`),
  ADD KEY `services_provider_id_foreign` (`provider_id`),
  ADD KEY `services_category_id_foreign` (`category_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transactions_public_id_unique` (`public_id`),
  ADD KEY `transactions_booking_id_foreign` (`booking_id`),
  ADD KEY `transactions_customer_id_foreign` (`customer_id`),
  ADD KEY `transactions_provider_id_foreign` (`provider_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_public_id_unique` (`public_id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `wanted_ads`
--
ALTER TABLE `wanted_ads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wanted_ads_public_id_unique` (`public_id`),
  ADD KEY `wanted_ads_customer_id_foreign` (`customer_id`),
  ADD KEY `wanted_ads_category_id_foreign` (`category_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `platform_settings`
--
ALTER TABLE `platform_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `provider_applications`
--
ALTER TABLE `provider_applications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `qualifications`
--
ALTER TABLE `qualifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `wanted_ads`
--
ALTER TABLE `wanted_ads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_provider_id_foreign` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `complaints_against_user_id_foreign` FOREIGN KEY (`against_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `complaints_complainant_id_foreign` FOREIGN KEY (`complainant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `provider_applications`
--
ALTER TABLE `provider_applications`
  ADD CONSTRAINT `provider_applications_provider_id_foreign` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `provider_applications_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `qualifications`
--
ALTER TABLE `qualifications`
  ADD CONSTRAINT `qualifications_provider_application_id_foreign` FOREIGN KEY (`provider_application_id`) REFERENCES `provider_applications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `qualifications_provider_id_foreign` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_provider_id_foreign` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `services_provider_id_foreign` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_provider_id_foreign` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wanted_ads`
--
ALTER TABLE `wanted_ads`
  ADD CONSTRAINT `wanted_ads_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wanted_ads_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
