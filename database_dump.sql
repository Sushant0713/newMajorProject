-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: ownhrsolution-forworkbench4
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `recovery_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_id` (`admin_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'ADM001','Aditya','Vinod','Kedari','2002-01-05','adityakedari123@gmail.com','vinitkedari04@gmail.com','9653699046','AK road Andheri-East, 40059','$2b$10$22rXAZK/UOY6AlHpDGlKF.aqQg1ckNHCzj3ehS8VKx3Sif79E.LYC','2026-02-22 13:28:27','2026-03-28 13:15:01'),(2,'ADM002','Shadab','','','1990-07-22','@gmail.com','sushantkocharekar271@gmail.com','9281234567','456 Mabini St, Manila, Philippines','$2b$10$wl/SNssuR5V3jXr9pZifHe6QE.RasWFlWFnbd08RQMdS7dQCbcR2e','2026-02-22 13:28:27','2026-03-28 13:17:27'),(3,'ADM003','Vinit','Vinod','Kedari','2004-10-13','vinitkedari14@gmail.com','vinitkedari04@gmail.com','8097172770','AK road Andheri-East,40059','$2b$10$0mTbueU5Gd0.bsVof9kfVeCtzUCW7b7UBYliSg.RR6KbiFXPwjYqi','2026-02-22 13:28:27','2026-03-28 13:15:01');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment_queue`
--

DROP TABLE IF EXISTS `assignment_queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignment_queue` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `data_type_id` int NOT NULL,
  `queue_position` int DEFAULT '1',
  `priority` tinyint(1) DEFAULT '1',
  `previous_employee_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pass_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attempts` int DEFAULT '0',
  `max_attempts` int DEFAULT '3',
  `queued_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_candidate_queue` (`candidate_id`),
  KEY `idx_candidate` (`candidate_id`),
  KEY `idx_data_type` (`data_type_id`),
  KEY `idx_queue_position` (`queue_position`),
  KEY `idx_priority` (`priority`),
  KEY `idx_attempts` (`attempts`),
  KEY `fk_queue_prev_emp` (`previous_employee_id`),
  CONSTRAINT `fk_queue_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates_data` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_queue_data_type` FOREIGN KEY (`data_type_id`) REFERENCES `data_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_queue_prev_emp` FOREIGN KEY (`previous_employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Queue for candidates waiting to be assigned';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_queue`
--

LOCK TABLES `assignment_queue` WRITE;
/*!40000 ALTER TABLE `assignment_queue` DISABLE KEYS */;
INSERT INTO `assignment_queue` VALUES (7,177,4,1,1,'EMP001',NULL,1,3,'2025-07-04 16:33:47','2025-07-04 16:33:47','2025-07-04 16:33:47'),(37,12,1,1,1,'ADM_001',NULL,1,3,'2026-01-27 13:46:24','2026-01-27 13:46:24','2026-01-27 13:46:24'),(38,5,1,1,1,'ADM_001',NULL,1,3,'2026-01-27 13:50:13','2026-01-27 13:50:13','2026-01-27 13:50:13'),(39,24,4,1,1,'EMP001',NULL,1,3,'2026-02-19 06:24:34','2026-02-19 06:24:34','2026-02-19 06:24:34'),(40,14,1,1,1,'EMP002',NULL,1,3,'2026-02-24 04:14:20','2026-02-24 04:14:20','2026-02-24 04:14:20');
/*!40000 ALTER TABLE `assignment_queue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_sessions`
--

DROP TABLE IF EXISTS `attendance_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `login_time` datetime NOT NULL,
  `last_activity_time` datetime NOT NULL,
  `logout_time` datetime DEFAULT NULL,
  `total_minutes` int DEFAULT '0',
  `status` enum('active','expired') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `device` varchar(20) DEFAULT NULL,
  `browser` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_status` (`status`),
  KEY `idx_last_activity` (`last_activity_time`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_sessions`
--

LOCK TABLES `attendance_sessions` WRITE;
/*!40000 ALTER TABLE `attendance_sessions` DISABLE KEYS */;
INSERT INTO `attendance_sessions` VALUES (1,'EMP002','2026-03-17 12:41:40','2026-03-17 12:46:41','2026-03-17 13:24:39',42,'expired','2026-03-17 07:11:40','2026-03-17 07:54:39','desktop','Chrome'),(2,'EMP003','2026-03-17 12:42:33','2026-03-17 12:47:33','2026-03-17 12:47:33',5,'expired','2026-03-17 07:12:33','2026-03-17 07:30:00','desktop','Chrome'),(3,'EMP004','2026-03-17 12:43:14','2026-03-17 12:43:14','2026-03-17 13:25:13',41,'expired','2026-03-17 07:13:14','2026-03-17 07:55:13','desktop','Chrome'),(4,'EMP005','2026-03-17 12:43:59','2026-03-17 12:58:59','2026-03-17 12:58:59',15,'expired','2026-03-17 07:13:59','2026-03-17 07:40:00','desktop','Chrome'),(5,'EMP002','2026-03-17 18:05:38','2026-03-17 18:10:39','2026-03-17 18:12:07',6,'expired','2026-03-17 12:35:38','2026-03-17 12:42:07','desktop','Chrome'),(6,'EMP002','2026-03-17 18:12:07','2026-03-17 18:22:08','2026-03-17 18:22:08',10,'expired','2026-03-17 12:42:07','2026-03-17 13:05:00','desktop','Chrome'),(7,'EMP004','2026-03-17 18:13:27','2026-03-17 18:33:28','2026-03-17 18:35:39',22,'expired','2026-03-17 12:43:27','2026-03-17 13:05:39','desktop','Chrome'),(8,'EMP002','2026-03-19 18:36:51','2026-03-19 19:06:52','2026-03-19 19:06:52',30,'expired','2026-03-19 13:06:51','2026-03-19 13:50:00','desktop','Chrome'),(9,'EMP003','2026-03-19 18:37:14','2026-03-19 19:07:14','2026-03-19 19:10:24',33,'expired','2026-03-19 13:07:14','2026-03-19 13:40:24','desktop','Chrome'),(10,'EMP004','2026-03-26 20:55:26','2026-03-26 21:05:27','2026-03-26 21:05:27',10,'expired','2026-03-26 15:25:26','2026-03-27 11:05:00','desktop','Chrome'),(11,'EMP002','2026-03-26 20:56:26','2026-03-26 20:56:26','2026-03-26 20:56:26',0,'expired','2026-03-26 15:26:26','2026-03-27 11:05:00','desktop','Chrome'),(12,'EMP009','2026-03-27 19:38:47','2026-03-27 19:43:48','2026-03-27 19:46:56',8,'expired','2026-03-27 14:08:47','2026-03-27 14:16:56','desktop','Chrome'),(13,'EMP002','2026-03-27 19:47:55','2026-03-27 19:47:55','2026-03-27 19:47:55',0,'expired','2026-03-27 14:17:55','2026-03-27 14:30:00','desktop','Chrome'),(14,'EMP005','2026-03-27 23:12:20','2026-03-27 23:47:51','2026-03-27 23:47:51',35,'expired','2026-03-27 17:42:20','2026-03-27 18:30:00','desktop','Chrome'),(15,'EMP002','2026-03-28 00:09:01','2026-03-28 00:09:01','2026-03-28 00:18:45',9,'expired','2026-03-27 18:39:01','2026-03-27 18:48:45','desktop','Chrome'),(16,'EMP002','2026-03-28 00:19:11','2026-03-28 00:24:12','2026-03-28 00:24:12',5,'expired','2026-03-27 18:49:11','2026-03-27 19:05:00','mobile','Mobile Chrome'),(17,'EMP002','2026-03-28 00:36:58','2026-03-28 00:36:58','2026-03-28 00:36:58',0,'expired','2026-03-27 19:06:58','2026-03-27 19:20:00','mobile','Mobile Chrome'),(18,'EMP002','2026-03-28 07:39:35','2026-03-28 08:15:14','2026-03-28 08:16:48',37,'expired','2026-03-28 02:09:35','2026-03-28 02:46:48','desktop','Chrome'),(19,'EMP004','2026-03-28 18:19:15','2026-03-28 18:19:15','2026-03-28 18:19:15',0,'expired','2026-03-28 12:49:15','2026-03-28 13:10:00','desktop','Chrome');
/*!40000 ALTER TABLE `attendance_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `broadcast_group_members`
--

DROP TABLE IF EXISTS `broadcast_group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `broadcast_group_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `employee_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `added_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_broadcast_group_member` (`group_id`,`employee_id`),
  KEY `idx_group_id` (`group_id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `broadcast_group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `broadcast_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `broadcast_group_members`
--

LOCK TABLES `broadcast_group_members` WRITE;
/*!40000 ALTER TABLE `broadcast_group_members` DISABLE KEYS */;
INSERT INTO `broadcast_group_members` VALUES (1,1,'EMP001','ADM_001','2025-06-30 15:17:31',0),(2,1,'EMP002','ADM_001','2025-06-30 15:17:31',0),(3,1,'EMP003','ADM_001','2025-06-30 15:17:31',0),(4,1,'EMP004','ADM_001','2025-06-30 15:17:31',0),(5,2,'EMP001','ADM_001','2025-06-30 15:43:19',1),(6,2,'EMP002','ADM_001','2025-06-30 15:43:19',1),(7,2,'EMP003','ADM_001','2025-06-30 15:43:19',1),(8,2,'EMP004','ADM_001','2025-06-30 15:43:19',1),(9,3,'EMP001','ADM_001','2025-07-01 02:29:15',1),(10,3,'EMP002','ADM_001','2025-07-01 02:29:15',1),(11,3,'EMP003','ADM_001','2025-07-01 02:29:15',1),(12,4,'EMP001','ADM_001','2025-07-01 04:19:43',1),(13,4,'EMP002','ADM_001','2025-07-01 04:19:43',1),(14,4,'EMP003','ADM_001','2025-07-01 04:19:43',1);
/*!40000 ALTER TABLE `broadcast_group_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `broadcast_groups`
--

DROP TABLE IF EXISTS `broadcast_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `broadcast_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `broadcast_groups`
--

LOCK TABLES `broadcast_groups` WRITE;
/*!40000 ALTER TABLE `broadcast_groups` DISABLE KEYS */;
INSERT INTO `broadcast_groups` VALUES (1,'team 2','njjs','ADM_001','2025-06-30 15:17:31',0),(2,'team 3','nsn','ADM_001','2025-06-30 15:43:19',1),(3,'team 4','nsdkaknak','ADM_001','2025-07-01 02:29:15',1),(4,'team 5','avbff','ADM_001','2025-07-01 04:19:43',1);
/*!40000 ALTER TABLE `broadcast_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_assignments`
--

DROP TABLE IF EXISTS `candidate_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `process_id` int DEFAULT NULL,
  `assignment_status` enum('available','matched','process_assigned','assigned','ringing','pass','resume_selected','interview_scheduled','selected','joined','hold','clawback','invoice','approved','completely_joined','dropout','rejected','not_interested') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'available',
  `matching_score` decimal(5,2) DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT NULL,
  `assigned_by` int DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_candidate_assignment` (`candidate_id`),
  KEY `idx_assignment_status` (`assignment_status`),
  KEY `idx_process_id` (`process_id`),
  KEY `idx_assigned_by` (`assigned_by`),
  CONSTRAINT `fk_assignment_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignment_process` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_assignments`
--

LOCK TABLES `candidate_assignments` WRITE;
/*!40000 ALTER TABLE `candidate_assignments` DISABLE KEYS */;
INSERT INTO `candidate_assignments` VALUES (1,11,NULL,'interview_scheduled',NULL,NULL,2,'Test Note','2026-02-24 04:11:10','2026-02-28 11:24:34'),(2,12,3,'completely_joined',NULL,NULL,2,NULL,'2026-02-24 04:11:37','2026-03-02 06:41:47'),(3,13,1,'approved',NULL,NULL,2,NULL,'2026-02-24 04:13:19','2026-03-27 14:30:19'),(4,14,4,'interview_scheduled',NULL,NULL,2,NULL,'2026-02-24 04:13:44','2026-02-28 11:24:21'),(7,43,NULL,'assigned',NULL,NULL,2,NULL,'2026-02-24 04:42:29','2026-02-24 04:42:29'),(8,33,3,'interview_scheduled',NULL,NULL,3,NULL,'2026-02-24 05:49:09','2026-02-28 11:23:40'),(9,34,2,'completely_joined',NULL,NULL,3,NULL,'2026-02-24 05:53:36','2026-03-27 12:34:43'),(10,30,4,'process_assigned',NULL,NULL,3,NULL,'2026-02-24 06:36:46','2026-02-24 06:55:33'),(11,29,1,'dropout',NULL,NULL,3,NULL,'2026-02-24 06:39:39','2026-02-26 11:58:11'),(12,45,NULL,'assigned',NULL,NULL,3,NULL,'2026-02-24 13:20:18','2026-02-24 13:20:18'),(13,10,3,'interview_scheduled',NULL,NULL,1,NULL,'2026-02-24 13:34:23','2026-02-28 11:17:02'),(14,32,NULL,'assigned',NULL,NULL,4,NULL,'2026-02-24 13:37:02','2026-02-24 13:37:02'),(15,36,2,'process_assigned',NULL,NULL,1,NULL,'2026-02-24 13:38:52','2026-02-28 11:48:17'),(16,18,2,'approved',NULL,NULL,2,NULL,'2026-03-02 06:35:55','2026-03-02 06:54:54'),(17,19,NULL,'assigned',NULL,NULL,4,NULL,'2026-03-17 07:16:44','2026-03-17 07:16:44');
/*!40000 ALTER TABLE `candidate_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_call_logs`
--

DROP TABLE IF EXISTS `candidate_call_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_call_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `employee_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `call_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `call_status` enum('answered','not_answered','busy','switch_off','wrong_number','callback_requested','no_ring') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `call_duration` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `next_followup_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_candidate_call` (`candidate_id`),
  KEY `id_employee_call` (`employee_id`),
  KEY `id_call_date` (`call_date`),
  CONSTRAINT `fk_call_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_call_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_call_logs`
--

LOCK TABLES `candidate_call_logs` WRITE;
/*!40000 ALTER TABLE `candidate_call_logs` DISABLE KEYS */;
INSERT INTO `candidate_call_logs` VALUES (1,13,'EMP002','2026-02-24 04:13:28','answered',NULL,NULL,NULL,'2026-02-24 04:13:28'),(2,11,'EMP002','2026-02-24 04:16:29','answered',NULL,NULL,NULL,'2026-02-24 04:16:29'),(3,30,'EMP003','2026-02-24 06:57:22','callback_requested',NULL,NULL,NULL,'2026-02-24 06:57:22'),(4,33,'EMP003','2026-02-24 06:57:34','not_answered',NULL,NULL,NULL,'2026-02-24 06:57:34'),(5,18,'EMP002','2026-03-02 06:36:20','answered',NULL,NULL,NULL,'2026-03-02 06:36:20');
/*!40000 ALTER TABLE `candidate_call_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_dropout_reasons`
--

DROP TABLE IF EXISTS `candidate_dropout_reasons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_dropout_reasons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `employee_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dropout_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reason_category` enum('not_interested','salary_issues','location_issues','already_placed','personal_reasons','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `detailed_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `future_consideration` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'no',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_candidate_dropout` (`candidate_id`),
  KEY `id_employee_dropout` (`employee_id`),
  CONSTRAINT `fk_dropout_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dropout_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_dropout_reasons`
--

LOCK TABLES `candidate_dropout_reasons` WRITE;
/*!40000 ALTER TABLE `candidate_dropout_reasons` DISABLE KEYS */;
INSERT INTO `candidate_dropout_reasons` VALUES (1,3,'EMP003','2025-06-27 08:57:52','not_interested','Not Interested: salary_expectations - Notes: tff','yes','2025-06-27 08:57:52'),(2,3,'EMP003','2025-06-27 08:58:49','not_interested','Not Interested: location_preference - Notes: fddf','yes','2025-06-27 08:58:49');
/*!40000 ALTER TABLE `candidate_dropout_reasons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_keywords`
--

DROP TABLE IF EXISTS `candidate_keywords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_keywords` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `keyword` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `candidate_id` (`candidate_id`),
  CONSTRAINT `fk_candidate_keywords` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=137 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_keywords`
--

LOCK TABLES `candidate_keywords` WRITE;
/*!40000 ALTER TABLE `candidate_keywords` DISABLE KEYS */;
INSERT INTO `candidate_keywords` VALUES (1,1,'excel','2025-06-27 07:00:13'),(2,1,'hsc','2025-06-27 07:00:13'),(3,1,'ssc','2025-06-27 07:00:13'),(4,1,'b.com','2025-06-27 07:00:13'),(5,1,'english','2025-06-27 07:00:13'),(6,1,'hindi','2025-06-27 07:00:13'),(7,1,'goregaon east mumbai 400063','2025-06-27 07:00:13'),(8,1,'fresher','2025-06-27 07:00:13'),(9,2,'excel','2025-06-27 07:08:43'),(10,2,'computer','2025-06-27 07:08:43'),(11,2,'hsc','2025-06-27 07:08:43'),(12,2,'ssc','2025-06-27 07:08:43'),(13,2,'english','2025-06-27 07:08:43'),(14,2,'hindi','2025-06-27 07:08:43'),(15,2,'marathi','2025-06-27 07:08:43'),(16,2,'nesco ltd','2025-06-27 07:08:43'),(17,2,'big basket','2025-06-27 07:08:43'),(18,2,'hik vision ltd','2025-06-27 07:08:43'),(19,2,'400069','2025-06-27 07:08:43'),(20,2,'mumbai','2025-06-27 07:08:43'),(21,2,'andheri','2025-06-27 07:08:43'),(22,2,'experience','2025-06-27 07:08:43'),(23,3,'php','2025-06-27 08:57:31'),(24,3,'javascript','2025-06-27 08:57:31'),(25,3,'html','2025-06-27 08:57:31'),(26,3,'css','2025-06-27 08:57:31'),(27,3,'python','2025-06-27 08:57:31'),(28,3,'java','2025-06-27 08:57:31'),(29,3,'aws','2025-06-27 08:57:31'),(30,3,'excel','2025-06-27 08:57:31'),(31,3,'communication','2025-06-27 08:57:31'),(32,3,'hsc','2025-06-27 08:57:31'),(33,3,'mba','2025-06-27 08:57:31'),(34,3,'ssc','2025-06-27 08:57:31'),(35,3,'english','2025-06-27 08:57:31'),(36,3,'hindi','2025-06-27 08:57:31'),(37,3,'marathi','2025-06-27 08:57:31'),(38,3,'mumbai malad','2025-06-27 08:57:31'),(39,3,'fresher','2025-06-27 08:57:31'),(40,4,'communication','2025-06-30 04:41:52'),(41,4,'excel','2025-06-30 04:41:52'),(42,4,'sales','2025-06-30 04:41:52'),(43,4,'hsc','2025-06-30 04:41:52'),(44,4,'ssc','2025-06-30 04:41:52'),(45,4,'english','2025-06-30 04:41:52'),(46,4,'hindi','2025-06-30 04:41:52'),(47,4,'marathi','2025-06-30 04:41:52'),(48,4,'400015 mumbai','2025-06-30 04:41:52'),(49,4,'fresher','2025-06-30 04:41:52'),(50,5,'excel','2025-07-01 02:41:55'),(51,5,'word','2025-07-01 02:41:55'),(52,5,'powerpoint','2025-07-01 02:41:55'),(53,5,'communication','2025-07-01 02:41:55'),(54,5,'hsc','2025-07-01 02:41:55'),(55,5,'ssc','2025-07-01 02:41:55'),(56,5,'english','2025-07-01 02:41:55'),(57,5,'hindi','2025-07-01 02:41:55'),(58,5,'marathi','2025-07-01 02:41:55'),(59,5,'mumbai','2025-07-01 02:41:55'),(60,5,'malad','2025-07-01 02:41:55'),(61,5,'fresher','2025-07-01 02:41:55'),(62,6,'excel','2025-07-01 13:03:18'),(63,6,'word','2025-07-01 13:03:18'),(64,6,'communication','2025-07-01 13:03:18'),(65,6,'hsc','2025-07-01 13:03:18'),(66,6,'ssc','2025-07-01 13:03:18'),(67,6,'english','2025-07-01 13:03:18'),(68,6,'hindi','2025-07-01 13:03:18'),(69,6,'marathi','2025-07-01 13:03:18'),(70,6,'400052','2025-07-01 13:03:18'),(71,6,'mumbai','2025-07-01 13:03:18'),(72,6,'malad','2025-07-01 13:03:18'),(73,6,'fresher','2025-07-01 13:03:18'),(74,7,'javascript','2025-07-01 13:16:44'),(75,7,'html','2025-07-01 13:16:44'),(76,7,'css','2025-07-01 13:16:44'),(77,7,'mysql','2025-07-01 13:16:44'),(78,7,'python','2025-07-01 13:16:44'),(79,7,'java','2025-07-01 13:16:44'),(80,7,'git','2025-07-01 13:16:44'),(81,7,'communication','2025-07-01 13:16:44'),(82,7,'crm','2025-07-01 13:16:44'),(83,7,'hsc','2025-07-01 13:16:44'),(84,7,'ssc','2025-07-01 13:16:44'),(85,7,'english','2025-07-01 13:16:44'),(86,7,'hindi','2025-07-01 13:16:44'),(87,7,'mumbai andheri','2025-07-01 13:16:44'),(88,7,'fresher','2025-07-01 13:16:44'),(89,9,'java','2025-07-01 13:46:42'),(90,9,'ios','2025-07-01 13:46:42'),(91,9,'jira','2025-07-01 13:46:42'),(92,9,'agile','2025-07-01 13:46:42'),(93,9,'communication','2025-07-01 13:46:42'),(94,9,'hsc','2025-07-01 13:46:42'),(95,9,'ssc','2025-07-01 13:46:42'),(96,9,'english','2025-07-01 13:46:42'),(97,9,'mumbai','2025-07-01 13:46:42'),(98,9,'malad','2025-07-01 13:46:42'),(99,9,'fresher','2025-07-01 13:46:42'),(100,10,'excel','2025-07-01 14:00:29'),(101,10,'communication','2025-07-01 14:00:29'),(102,10,'hsc','2025-07-01 14:00:29'),(103,10,'ssc','2025-07-01 14:00:29'),(104,10,'mba','2025-07-01 14:00:29'),(105,10,'english','2025-07-01 14:00:29'),(106,10,'hindi','2025-07-01 14:00:29'),(107,10,'marathi','2025-07-01 14:00:29'),(108,10,'telugu','2025-07-01 14:00:29'),(109,10,'400089','2025-07-01 14:00:29'),(110,10,'mumbai','2025-07-01 14:00:29'),(111,10,'navbharat building','2025-07-01 14:00:29'),(112,10,'fresher','2025-07-01 14:00:29'),(113,11,'communication','2025-07-03 09:49:01'),(114,11,'hsc','2025-07-03 09:49:01'),(115,11,'mba','2025-07-03 09:49:01'),(116,11,'english','2025-07-03 09:49:01'),(117,11,'hindi','2025-07-03 09:49:01'),(118,11,'kannada','2025-07-03 09:49:01'),(119,11,'malayalam','2025-07-03 09:49:01'),(120,11,'671322 mumbai','2025-07-03 09:49:01'),(121,11,'fresher','2025-07-03 09:49:01'),(122,12,'excel','2025-07-03 10:52:37'),(123,12,'communication','2025-07-03 10:52:37'),(124,12,'hsc','2025-07-03 10:52:37'),(125,12,'ssc','2025-07-03 10:52:37'),(126,12,'english','2025-07-03 10:52:37'),(127,12,'hindi','2025-07-03 10:52:37'),(128,12,'marathi','2025-07-03 10:52:37'),(129,12,'5 lallu mestri compound tulij road','2025-07-03 10:52:37'),(130,12,'fresher','2025-07-03 10:52:37'),(131,14,'git','2025-07-04 08:08:59'),(132,14,'excel','2025-07-04 08:08:59'),(133,14,'english','2025-07-04 08:08:59'),(134,14,'hindi','2025-07-04 08:08:59'),(135,14,'mumbai','2025-07-04 08:08:59'),(136,14,'fresher','2025-07-04 08:08:59');
/*!40000 ALTER TABLE `candidate_keywords` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_not_interested`
--

DROP TABLE IF EXISTS `candidate_not_interested`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_not_interested` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `process_id` int NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `candidate_id` (`candidate_id`),
  KEY `process_id` (`process_id`),
  CONSTRAINT `candidate_not_interested_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `candidate_not_interested_ibfk_2` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_not_interested`
--

LOCK TABLES `candidate_not_interested` WRITE;
/*!40000 ALTER TABLE `candidate_not_interested` DISABLE KEYS */;
/*!40000 ALTER TABLE `candidate_not_interested` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_not_interested_processes`
--

DROP TABLE IF EXISTS `candidate_not_interested_processes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_not_interested_processes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `process_id` int NOT NULL,
  `employee_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Employee who marked as not interested',
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Reason for not being interested',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Additional notes',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_candidate_process_not_interested` (`candidate_id`,`process_id`),
  KEY `idx_candidate_not_interested` (`candidate_id`),
  KEY `idx_process_not_interested` (`process_id`),
  KEY `idx_employee_not_interested` (`employee_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_candidate_process_exclusion` (`candidate_id`,`process_id`),
  CONSTRAINT `fk_not_interested_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_not_interested_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_not_interested_process` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_not_interested_processes`
--

LOCK TABLES `candidate_not_interested_processes` WRITE;
/*!40000 ALTER TABLE `candidate_not_interested_processes` DISABLE KEYS */;
/*!40000 ALTER TABLE `candidate_not_interested_processes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_passed_log`
--

DROP TABLE IF EXISTS `candidate_passed_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_passed_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `employee_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_type_id` int DEFAULT NULL,
  `passed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_candidate_employee` (`candidate_id`,`employee_id`),
  KEY `fk_passed_data_type` (`data_type_id`),
  CONSTRAINT `fk_passed_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates_data` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_passed_data_type` FOREIGN KEY (`data_type_id`) REFERENCES `data_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_passed_log`
--

LOCK TABLES `candidate_passed_log` WRITE;
/*!40000 ALTER TABLE `candidate_passed_log` DISABLE KEYS */;
INSERT INTO `candidate_passed_log` VALUES (1,116,'EMP001',1,'2025-07-09 00:18:18','Not suitable for role'),(2,68,'EMP001',7,'2025-07-09 00:19:01','Better candidates available'),(3,72,'EMP001',7,'2025-07-09 00:19:15','Not suitable for role');
/*!40000 ALTER TABLE `candidate_passed_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_process_assignments`
--

DROP TABLE IF EXISTS `candidate_process_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_process_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `process_id` int NOT NULL,
  `assigned_by` int NOT NULL,
  `status` enum('assigned','working','passed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'assigned',
  `pass_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `candidate_id` (`candidate_id`),
  KEY `process_id` (`process_id`),
  KEY `assigned_by` (`assigned_by`),
  CONSTRAINT `candidate_process_assignments_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `candidate_process_assignments_ibfk_2` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `candidate_process_assignments_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_process_assignments`
--

LOCK TABLES `candidate_process_assignments` WRITE;
/*!40000 ALTER TABLE `candidate_process_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `candidate_process_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_process_matches`
--

DROP TABLE IF EXISTS `candidate_process_matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_process_matches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `process_id` int NOT NULL,
  `matching_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `matched_keywords` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `total_candidate_keywords` int DEFAULT '0',
  `total_process_keywords` int DEFAULT '0',
  `skill_matches` int DEFAULT '0',
  `language_matches` int DEFAULT '0',
  `education_matches` int DEFAULT '0',
  `location_matches` int DEFAULT '0',
  `hiring_type_matches` int DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_candidate_process` (`candidate_id`,`process_id`),
  KEY `idx_candidate_id` (`candidate_id`),
  KEY `idx_process_id` (`process_id`),
  KEY `idx_matching_score` (`matching_score`),
  KEY `idx_candidate_process_score` (`candidate_id`,`matching_score`),
  KEY `idx_process_candidate_score` (`process_id`,`matching_score`),
  CONSTRAINT `fk_match_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_match_process` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_process_matches`
--

LOCK TABLES `candidate_process_matches` WRITE;
/*!40000 ALTER TABLE `candidate_process_matches` DISABLE KEYS */;
/*!40000 ALTER TABLE `candidate_process_matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_reservations`
--

DROP TABLE IF EXISTS `candidate_reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_reservations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `reserved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_candidate` (`candidate_id`),
  KEY `fk_employee_res` (`employee_id`),
  CONSTRAINT `fk_candidate_res` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`),
  CONSTRAINT `fk_employee_res` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_reservations`
--

LOCK TABLES `candidate_reservations` WRITE;
/*!40000 ALTER TABLE `candidate_reservations` DISABLE KEYS */;
INSERT INTO `candidate_reservations` VALUES (33,31,3,'2026-02-24 06:35:46'),(65,20,4,'2026-03-17 07:16:43'),(83,26,2,'2026-03-27 19:00:18'),(84,27,2,'2026-03-27 19:00:18'),(85,28,2,'2026-03-27 19:00:18'),(86,35,2,'2026-03-27 19:00:18');
/*!40000 ALTER TABLE `candidate_reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_status_history`
--

DROP TABLE IF EXISTS `candidate_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `employee_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `change_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `changed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_candidate_history` (`candidate_id`),
  KEY `id_employee_history` (`employee_id`),
  KEY `id_status_change_date` (`changed_at`),
  CONSTRAINT `fk_history_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_history_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_status_history`
--

LOCK TABLES `candidate_status_history` WRITE;
/*!40000 ALTER TABLE `candidate_status_history` DISABLE KEYS */;
INSERT INTO `candidate_status_history` VALUES (1,12,'EMP002',NULL,'hold','Hold Reason','2026-02-24 04:12:23'),(2,12,'EMP002','hold','hold','Hold Reason','2026-02-24 04:12:30'),(3,13,'EMP002',NULL,'ring',NULL,'2026-02-24 04:13:28'),(4,14,'EMP002',NULL,'pass','Pass Reason','2026-02-24 04:14:20'),(5,11,'EMP002',NULL,'ring',NULL,'2026-02-24 04:16:29'),(6,12,'EMP002','hold','resume_selected','abc','2026-02-24 04:24:10'),(7,43,'EMP002',NULL,'assigned','Maually added candidate','2026-02-24 04:42:29'),(8,14,'EMP002','pass','joined',NULL,'2026-02-24 04:43:24'),(9,12,'EMP002','resume_selected','joined',NULL,'2026-02-24 04:44:51'),(10,13,'EMP002','ring','joined',NULL,'2026-02-24 04:45:36'),(11,14,'EMP002','joined','hold','Hold reason','2026-02-24 05:41:38'),(12,34,'EMP003',NULL,'joined',NULL,'2026-02-24 05:53:46'),(13,29,'EMP003',NULL,'joined',NULL,'2026-02-24 06:55:12'),(14,30,'EMP003',NULL,'callback_requested','','2026-02-24 06:57:22'),(15,33,'EMP003',NULL,'not_answered','','2026-02-24 06:57:34'),(16,29,'EMP003','joined','waiting_period','Payout generated','2026-02-24 07:15:42'),(17,29,'EMP003','joined','clawback',NULL,'2026-02-24 07:17:02'),(18,29,'EMP003','clawback','invoice_clear','Invoice cleared','2026-02-24 07:17:06'),(19,29,'EMP003','invoice_clear','approved','Approved by admin','2026-02-24 07:17:12'),(20,45,'EMP003',NULL,'assigned','Maually added candidate','2026-02-24 13:20:18'),(21,45,'EMP003','assigned','assigned','Maually added candidate','2026-02-24 13:21:21'),(22,13,'EMP002','joined','waiting_period','Payout generated','2026-02-26 08:03:27'),(23,29,'EMP003','joined','dropout','Resigned','2026-02-26 11:58:11'),(24,13,'EMP002','waiting_period','rejected','Reject Reason','2026-02-26 12:24:42'),(25,34,'EMP003','joined','joined','Payout generated','2026-02-26 12:33:04'),(26,10,'ADM001',NULL,'interview_scheduled','','2026-02-28 11:17:02'),(27,33,'ADM001','not_answered','interview_scheduled','','2026-02-28 11:23:40'),(28,14,'ADM001','hold','interview_scheduled','','2026-02-28 11:24:21'),(29,11,'ADM001','ring','interview_scheduled','','2026-02-28 11:24:34'),(30,18,'EMP002',NULL,'ring',NULL,'2026-03-02 06:36:20'),(31,18,'EMP002','ring','interview_scheduled','','2026-03-02 06:38:03'),(32,18,'EMP002','interview_scheduled','joined',NULL,'2026-03-02 06:38:31'),(33,18,'EMP002','joined','hold','','2026-03-02 06:39:02'),(34,18,'EMP002','hold','selected','','2026-03-02 06:40:44'),(35,12,'EMP002','joined','joined','Payout generated','2026-03-02 06:41:07'),(36,12,'EMP002','joined','clawback',NULL,'2026-03-02 06:41:21'),(37,12,'EMP002','clawback','invoice_clear','Invoice cleared','2026-03-02 06:41:28'),(38,12,'EMP002','invoice_clear','approved','Approved by admin','2026-03-02 06:41:36'),(39,12,'EMP002','approved','completely_joined','Fully joined','2026-03-02 06:41:47'),(40,18,'EMP002','selected','joined',NULL,'2026-03-02 06:52:44'),(41,18,'EMP002','joined','joined','Payout generated','2026-03-02 06:54:26'),(42,18,'EMP002','joined','clawback',NULL,'2026-03-02 06:54:35'),(43,18,'EMP002','clawback','invoice_clear','Invoice cleared','2026-03-02 06:54:49'),(44,18,'EMP002','invoice_clear','approved','Approved by admin','2026-03-02 06:54:54'),(45,34,'EMP003','joined','clawback',NULL,'2026-03-27 12:34:18'),(46,34,'EMP003','clawback','invoice_clear','Invoice cleared','2026-03-27 12:34:29'),(47,34,'EMP003','invoice_clear','approved','Approved by admin','2026-03-27 12:34:36'),(48,34,'EMP003','approved','completely_joined','Fully joined','2026-03-27 12:34:43'),(49,13,'EMP002','joined','clawback',NULL,'2026-03-27 13:05:09'),(50,13,'EMP002','clawback','invoice_clear','Invoice cleared','2026-03-27 13:05:13'),(51,13,'EMP002','invoice_clear','approved','Approved by admin','2026-03-27 14:30:19');
/*!40000 ALTER TABLE `candidate_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_work_actions`
--

DROP TABLE IF EXISTS `candidate_work_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_work_actions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assignment_id` int NOT NULL,
  `employee_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `candidate_id` int NOT NULL,
  `action_type` enum('ring','drop','done','pass','start_work') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ring_count` int DEFAULT '0',
  `drop_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `candidate_response_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `action_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assignment` (`assignment_id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_candidate` (`candidate_id`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_action_date` (`action_date`),
  CONSTRAINT `fk_action_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `employee_assignments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_action_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_action_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Logs all actions taken by employees on candidates';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_work_actions`
--

LOCK TABLES `candidate_work_actions` WRITE;
/*!40000 ALTER TABLE `candidate_work_actions` DISABLE KEYS */;
INSERT INTO `candidate_work_actions` VALUES (1,2,'EMP002',12,'start_work',0,NULL,NULL,NULL,'2026-02-24 04:12:23','2026-02-24 04:12:23'),(2,2,'EMP002',12,'start_work',0,NULL,NULL,NULL,'2026-02-24 04:12:30','2026-02-24 04:12:30'),(3,3,'EMP002',13,'ring',0,NULL,NULL,NULL,'2026-02-24 04:13:28','2026-02-24 04:13:28'),(4,4,'EMP002',14,'pass',0,NULL,NULL,NULL,'2026-02-24 04:14:20','2026-02-24 04:14:20'),(5,1,'EMP002',11,'ring',0,NULL,NULL,NULL,'2026-02-24 04:16:29','2026-02-24 04:16:29'),(6,2,'EMP002',12,'start_work',0,NULL,NULL,NULL,'2026-02-24 04:24:10','2026-02-24 04:24:10'),(7,4,'EMP002',14,'done',0,NULL,NULL,NULL,'2026-02-24 04:43:24','2026-02-24 04:43:24'),(8,2,'EMP002',12,'done',0,NULL,NULL,NULL,'2026-02-24 04:44:51','2026-02-24 04:44:51'),(9,3,'EMP002',13,'done',0,NULL,NULL,NULL,'2026-02-24 04:45:36','2026-02-24 04:45:36'),(10,4,'EMP002',14,'start_work',0,NULL,NULL,NULL,'2026-02-24 05:41:37','2026-02-24 05:41:37'),(11,7,'EMP003',34,'done',0,NULL,NULL,NULL,'2026-02-24 05:53:46','2026-02-24 05:53:46'),(12,9,'EMP003',29,'done',0,NULL,NULL,NULL,'2026-02-24 06:55:12','2026-02-24 06:55:12'),(13,8,'EMP003',30,'ring',0,NULL,NULL,NULL,'2026-02-24 06:57:22','2026-02-24 06:57:22'),(14,6,'EMP003',33,'ring',0,NULL,NULL,NULL,'2026-02-24 06:57:34','2026-02-24 06:57:34'),(15,11,'ADM001',10,'start_work',0,NULL,NULL,NULL,'2026-02-28 11:17:02','2026-02-28 11:17:02'),(16,6,'ADM001',33,'start_work',0,NULL,NULL,NULL,'2026-02-28 11:23:40','2026-02-28 11:23:40'),(17,4,'ADM001',14,'start_work',0,NULL,NULL,NULL,'2026-02-28 11:24:21','2026-02-28 11:24:21'),(18,1,'ADM001',11,'start_work',0,NULL,NULL,NULL,'2026-02-28 11:24:34','2026-02-28 11:24:34'),(19,15,'EMP002',18,'ring',0,NULL,NULL,NULL,'2026-03-02 06:36:20','2026-03-02 06:36:20'),(20,15,'EMP002',18,'start_work',0,NULL,NULL,NULL,'2026-03-02 06:38:03','2026-03-02 06:38:03'),(21,15,'EMP002',18,'done',0,NULL,NULL,NULL,'2026-03-02 06:38:31','2026-03-02 06:38:31'),(22,15,'EMP002',18,'start_work',0,NULL,NULL,NULL,'2026-03-02 06:39:02','2026-03-02 06:39:02'),(23,15,'EMP002',18,'start_work',0,NULL,NULL,NULL,'2026-03-02 06:40:44','2026-03-02 06:40:44'),(24,15,'EMP002',18,'done',0,NULL,NULL,NULL,'2026-03-02 06:52:44','2026-03-02 06:52:44');
/*!40000 ALTER TABLE `candidate_work_actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidates`
--

DROP TABLE IF EXISTS `candidates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('male','female','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `skills` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `qualifications` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `languages` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `work_experience` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `past_companies` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `resume_pdf_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experience_level` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'NA',
  `status` enum('available','assigned','reserved') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `uploaded_by_employee_id` int DEFAULT NULL,
  `age` tinyint unsigned DEFAULT NULL,
  `job_title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data_type_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_candidates_data_type` (`data_type_id`),
  CONSTRAINT `fk_candidates_datatype` FOREIGN KEY (`data_type_id`) REFERENCES `data_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidates`
--

LOCK TABLES `candidates` WRITE;
/*!40000 ALTER TABLE `candidates` DISABLE KEYS */;
INSERT INTO `candidates` VALUES (1,'Reyansh Sharma','reyansh.sharma1@gmail.com','male','9158220867','Hyderabad, Telangana',NULL,NULL,'[\"english\",\"telugu\"]',NULL,NULL,NULL,'experienced','available','2026-02-24 03:46:49','2026-03-17 07:16:40',1,33,'Support Executive',1),(2,'Vivaan Sharma','vivaan.sharma2@gmail.com','other','9877680720','Hyderabad, Telangana',NULL,NULL,'[\"english\",\"telugu\"]',NULL,NULL,NULL,'experienced','available','2026-02-24 03:46:49','2026-03-17 07:16:40',1,29,'Frontend Developer',1),(3,'Diya Patel','diya.patel3@gmail.com','male','9239538888','Hyderabad, Telangana',NULL,NULL,'[\"english\",\"hindi\"]',NULL,NULL,NULL,'fresher','available','2026-02-24 03:46:49','2026-02-24 05:49:02',1,24,'Backend Developer',1),(4,'Meera Kapoor','meera.kapoor4@gmail.com','male','9672140295','Bangalore, Karnataka',NULL,NULL,'[\"english\",\"marathi\"]',NULL,NULL,NULL,'fresher','available','2026-02-24 03:46:49','2026-02-24 03:46:49',1,22,'QA Engineer',1),(5,'Krishna Verma','krishna.verma5@gmail.com','female','9415921714','Delhi, India',NULL,NULL,'[\"english\",\"hindi\"]',NULL,NULL,NULL,'experienced','available','2026-02-24 03:46:49','2026-02-24 03:46:49',1,34,'QA Engineer',1),(6,'Krishna Kapoor','krishna.kapoor6@gmail.com','male','9391385818','Mumbai, Maharashtra',NULL,NULL,'[\"english\",\"marathi\"]',NULL,NULL,NULL,'fresher','available','2026-02-24 03:46:49','2026-03-27 18:59:05',1,23,'QA Engineer',1),(7,'Aarav Gupta','aarav.gupta7@gmail.com','female','9752743717','Hyderabad, Telangana',NULL,NULL,'[\"english\",\"telugu\"]',NULL,NULL,NULL,'fresher','available','2026-02-24 03:46:49','2026-03-27 18:59:05',1,32,'Backend Developer',1),(8,'Sara Nair','sara.nair8@gmail.com','male','9490924622','Delhi, India',NULL,NULL,'[\"english\",\"telugu\"]',NULL,NULL,NULL,'fresher','available','2026-02-24 03:46:49','2026-03-27 18:59:05',1,27,'DevOps Engineer',1),(9,'Kabir Gupta','kabir.gupta9@gmail.com','male','9695913903','Hyderabad, Telangana',NULL,NULL,'[\"english\",\"hindi\"]',NULL,NULL,NULL,'experienced','available','2026-02-24 03:46:49','2026-03-27 19:00:18',1,24,'QA Engineer',1),(10,'Krishna Joshi','krishna.joshi10@gmail.com','other','9796995920','Bangalore, Karnataka',NULL,NULL,'[\"english\",\"telugu\"]',NULL,NULL,NULL,'fresher','assigned','2026-02-24 03:46:49','2026-02-24 13:34:23',1,26,'Data Analyst',1),(11,'Aarav Reddy','aarav.reddy11@gmail.com','male','9902178320','Chennai, Tamil Nadu',NULL,NULL,'[\"english\",\"hindi\"]',NULL,NULL,'/uploads/resumes/11_resume.docx','experienced','assigned','2026-02-24 03:46:49','2026-02-24 04:18:21',1,27,'DevOps Engineer',1),(12,'Saanvi Joshi','saanvi.joshi12@gmail.com','other','9534564104','Pune, Maharashtra',NULL,NULL,'[\"english\",\"tamil\"]',NULL,NULL,NULL,'experienced','assigned','2026-02-24 03:46:49','2026-02-24 04:11:37',1,25,'Backend Developer',1),(13,'Krishna Kulkarni','krishna.kulkarni13@gmail.com','other','9566712574','Mumbai, Maharashtra',NULL,NULL,'[\"english\",\"marathi\"]',NULL,NULL,'/uploads/resumes/13_resume.pdf','fresher','assigned','2026-02-24 03:46:49','2026-02-24 04:19:54',1,33,'Data Analyst',1),(14,'Sara Gupta','sara.gupta14@gmail.com','other','9444528629','Pune, Maharashtra',NULL,NULL,'[\"english\",\"telugu\"]',NULL,NULL,NULL,'fresher','assigned','2026-02-24 03:46:49','2026-02-24 04:13:44',1,33,'DevOps Engineer',1),(15,'Krishna Gupta','krishna.gupta15@gmail.com','other','9561073388','Delhi, India',NULL,NULL,'[\"english\",\"tamil\"]',NULL,NULL,NULL,'experienced','available','2026-02-24 03:46:49','2026-03-27 19:00:18',1,27,'Backend Developer',1),(16,'Ishaan Mehta','ishaan.mehta16@gmail.com','other','9416895104','Hyderabad, Telangana',NULL,NULL,'[\"english\",\"telugu\"]',NULL,NULL,NULL,'fresher','available','2026-02-24 03:46:49','2026-03-27 19:00:18',1,21,'Frontend Developer',1),(17,'Diya Verma','diya.verma17@gmail.com','female','9775713141','Delhi, India',NULL,NULL,'[\"english\",\"tamil\"]',NULL,NULL,NULL,'fresher','available','2026-02-24 03:46:49','2026-03-27 18:59:01',1,32,'DevOps Engineer',1),(18,'Diya Nair','diya.nair18@gmail.com','female','9308465502','Hyderabad, Telangana',NULL,NULL,'[\"english\",\"hindi\"]',NULL,NULL,NULL,'fresher','assigned','2026-02-24 03:46:49','2026-03-02 06:35:55',1,28,'Support Executive',1),(19,'Sara Patel','sara.patel19@gmail.com','female','9608132616','Pune, Maharashtra',NULL,NULL,'[\"english\",\"telugu\"]',NULL,NULL,NULL,'experienced','assigned','2026-02-24 03:46:49','2026-03-17 07:16:44',1,22,'Backend Developer',1),(20,'Vivaan Mehta','vivaan.mehta20@gmail.com','other','9951606208','Pune, Maharashtra',NULL,NULL,'[\"english\",\"hindi\"]',NULL,NULL,NULL,'fresher','reserved','2026-02-24 03:46:49','2026-03-17 07:16:43',1,27,'Backend Developer',1),(21,'Meera Nair','meera.nair21@gmail.com','male','9221633976','Bangalore, Karnataka',NULL,NULL,'[\"english\",\"telugu\"]',NULL,NULL,NULL,'experienced','available','2026-02-24 03:46:49','2026-02-24 13:34:14',1,34,'QA Engineer',1),(22,'Saanvi Joshi','saanvi.joshi22@gmail.com','male','9345910818','Pune, Maharashtra',NULL,NULL,'[\"english\",\"hindi\"]',NULL,NULL,NULL,'experienced','available','2026-02-24 03:46:49','2026-03-27 19:00:16',1,24,'Software Developer',1),(23,'Aarav Verma','aarav.verma23@gmail.com','female','9666467368','Mumbai, Maharashtra',NULL,NULL,'[\"english\",\"tamil\"]',NULL,NULL,NULL,'fresher','available','2026-02-24 03:46:49','2026-03-27 19:00:16',1,24,'Software Developer',1),(24,'Sara Kapoor','sara.kapoor24@gmail.com','male','9928313084','Chennai, Tamil Nadu',NULL,NULL,'[\"english\",\"tamil\"]',NULL,NULL,NULL,'fresher','available','2026-02-24 03:46:49','2026-03-27 19:00:16',1,35,'Backend Developer',1),(25,'Riya Patel','riya.patel25@gmail.com','other','9988285720','Pune, Maharashtra',NULL,NULL,'[\"english\",\"marathi\"]',NULL,NULL,NULL,'experienced','available','2026-02-24 03:46:49','2026-03-27 19:00:16',1,24,'QA Engineer',1),(26,'Myra Reddy','myra.reddy26@gmail.com','male','9706541783','Mumbai, Maharashtra',NULL,NULL,'[\"english\",\"hindi\"]',NULL,NULL,NULL,'fresher','reserved','2026-02-24 03:46:49','2026-03-27 19:00:18',1,35,'DevOps Engineer',1),(27,'Krishna Nair','krishna.nair27@gmail.com','female','9621955657','Chennai, Tamil Nadu',NULL,NULL,'[\"english\",\"telugu\"]',NULL,NULL,NULL,'fresher','reserved','2026-02-24 03:46:49','2026-03-27 19:00:18',1,25,'QA Engineer',1),(28,'Kavya Verma','kavya.verma28@gmail.com','other','9578091040','Delhi, India',NULL,NULL,'[\"english\",\"tamil\"]',NULL,NULL,NULL,'fresher','reserved','2026-02-24 03:46:49','2026-03-27 19:00:18',1,26,'QA Engineer',1),(29,'Kabir Reddy','kabir.reddy29@gmail.com','female','9391900450','Hyderabad, Telangana',NULL,NULL,'[\"english\",\"hindi\"]',NULL,NULL,NULL,'experienced','assigned','2026-02-24 03:46:49','2026-02-24 06:39:39',1,25,'Frontend Developer',1),(30,'Sara Kulkarni','sara.kulkarni30@gmail.com','female','9408510258','Hyderabad, Telangana',NULL,NULL,'[\"english\",\"telugu\"]',NULL,NULL,NULL,'fresher','assigned','2026-02-24 03:46:49','2026-02-24 06:36:46',1,22,'Backend Developer',1),(31,'Saanvi Gupta','saanvi.gupta31@gmail.com','other','9929707162','Bangalore, Karnataka',NULL,NULL,'[\"english\",\"marathi\"]',NULL,NULL,NULL,'experienced','reserved','2026-02-24 03:46:49','2026-02-24 06:35:46',1,35,'Backend Developer',1),(32,'Diya Verma','diya.verma32@gmail.com','female','9156308359','Bangalore, Karnataka',NULL,NULL,'[\"english\",\"marathi\"]',NULL,NULL,NULL,'experienced','assigned','2026-02-24 03:46:50','2026-02-24 13:37:02',1,21,'Frontend Developer',1),(33,'Aarav Gupta','aarav.gupta33@gmail.com','male','9130837216','Bangalore, Karnataka',NULL,NULL,'[\"english\",\"tamil\"]',NULL,NULL,NULL,'fresher','assigned','2026-02-24 03:46:50','2026-02-24 05:49:09',1,32,'Support Executive',1),(34,'Kavya Verma','kavya.verma34@gmail.com','female','9722896086','Bangalore, Karnataka',NULL,NULL,'[\"english\",\"marathi\"]',NULL,NULL,NULL,'fresher','assigned','2026-02-24 03:46:50','2026-02-24 05:53:36',1,25,'Backend Developer',1),(35,'Reyansh Kapoor','reyansh.kapoor35@gmail.com','female','9453860612','Chennai, Tamil Nadu',NULL,NULL,'[\"english\",\"tamil\"]',NULL,NULL,NULL,'experienced','reserved','2026-02-24 03:46:50','2026-03-27 19:00:18',1,26,'Support Executive',1),(36,'Saanvi Nair','saanvi.nair36@gmail.com','other','9849231416','Mumbai, Maharashtra',NULL,NULL,'[\"english\",\"tamil\"]',NULL,NULL,NULL,'fresher','assigned','2026-02-24 03:46:50','2026-02-24 13:38:52',1,29,'QA Engineer',1),(37,'Vivaan Mehta','vivaan.mehta37@gmail.com','female','9500478734','Hyderabad, Telangana',NULL,NULL,'[\"english\",\"telugu\"]',NULL,NULL,NULL,'fresher','available','2026-02-24 03:46:50','2026-03-27 19:00:11',1,24,'Frontend Developer',1),(38,'Aadhya Reddy','aadhya.reddy38@gmail.com','male','9803689158','Chennai, Tamil Nadu',NULL,NULL,'[\"english\",\"telugu\"]',NULL,NULL,NULL,'fresher','available','2026-02-24 03:46:50','2026-03-27 19:00:11',1,24,'DevOps Engineer',1),(39,'Ishaan Joshi','ishaan.joshi39@gmail.com','male','9676554356','Bangalore, Karnataka',NULL,NULL,'[\"english\",\"hindi\"]',NULL,NULL,NULL,'experienced','available','2026-02-24 03:46:50','2026-03-27 19:00:11',1,33,'Frontend Developer',1),(40,'Arjun Verma','arjun.verma40@gmail.com','male','9801610363','Pune, Maharashtra',NULL,NULL,'[\"english\",\"hindi\"]',NULL,NULL,NULL,'fresher','available','2026-02-24 03:46:50','2026-02-24 03:46:50',1,34,'QA Engineer',1),(43,'Ravi Sharma','','male','7985641230','',NULL,NULL,NULL,NULL,NULL,NULL,'experienced','assigned','2026-02-24 04:42:29','2026-02-24 04:42:29',2,NULL,NULL,NULL),(45,'Janhavi',NULL,NULL,'9860193619','',NULL,NULL,NULL,NULL,NULL,NULL,'','assigned','2026-02-24 13:20:18','2026-02-24 13:20:18',3,NULL,NULL,NULL);
/*!40000 ALTER TABLE `candidates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `candidates_available_for_assignment`
--

DROP TABLE IF EXISTS `candidates_available_for_assignment`;
/*!50001 DROP VIEW IF EXISTS `candidates_available_for_assignment`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `candidates_available_for_assignment` AS SELECT 
 1 AS `id`,
 1 AS `full_name`,
 1 AS `mobile_no`,
 1 AS `email_id`,
 1 AS `experience_level`,
 1 AS `city`,
 1 AS `job_title`,
 1 AS `type_name`,
 1 AS `data_type_id`,
 1 AS `assignment_status`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `candidates_data`
--

DROP TABLE IF EXISTS `candidates_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidates_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'NA',
  `mobile_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `experience_level` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'NA',
  `languages_known` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'NA',
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'NA',
  `age` int DEFAULT NULL,
  `gender` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'NA',
  `job_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'NA',
  `type_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email_id`),
  UNIQUE KEY `unique_mobile` (`mobile_no`),
  KEY `idx_email` (`email_id`),
  KEY `idx_mobile` (`mobile_no`),
  KEY `idx_city` (`city`),
  KEY `idx_experience` (`experience_level`),
  KEY `idx_type_id` (`type_id`),
  CONSTRAINT `fk_candidates_data_type` FOREIGN KEY (`type_id`) REFERENCES `data_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=209 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidates_data`
--

LOCK TABLES `candidates_data` WRITE;
/*!40000 ALTER TABLE `candidates_data` DISABLE KEYS */;
INSERT INTO `candidates_data` VALUES (4,'Shahnawaz Shaikh','9769892902',NULL,'NA','[\"NA\"]','mumbai','Asalpha',20,'Male','BPO Tele calling',1,'2025-06-29 01:23:17','2025-06-29 01:23:17'),(5,'Ratiket Rangrao Patil','8928416258',NULL,'NA','[\"NA\"]','mumbai','Sanpada',24,'Male','BPO Tele calling',1,'2025-06-29 01:23:17','2025-06-29 01:23:17'),(6,'Sangitha balla','8928656840',NULL,'NA','[\"NA\"]','mumbai','Borivali West',20,'Female','Inside Sales Executive',4,'2025-06-29 01:23:17','2025-06-29 01:23:17'),(7,'Prajwal Panchbhai','8010950703',NULL,'NA','[\"NA\"]','mumbai','Kandivali',22,'Male','BPO Tele calling',1,'2025-06-29 01:23:17','2025-06-29 01:23:17'),(8,'Pramila Patiyan','9021995183',NULL,'NA','[\"NA\"]','mumbai','Kandivali',20,'Female','BPO Tele calling',1,'2025-06-29 01:23:17','2025-06-29 01:23:17'),(9,'Jinesh','9022747209',NULL,'NA','[\"NA\"]','mumbai','Kandivali West',31,'Male','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(10,'Akram Ansari','7039305457',NULL,'NA','[\"NA\"]','mumbai','Malad West',24,'Male','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(11,'Antima Pandey','7039187202',NULL,'NA','[\"NA\"]','mumbai','Powai',20,'Female','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(12,'Shah Mahira','9833830705',NULL,'NA','[\"NA\"]','mumbai','Vile Parle West',21,'Female','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(13,'Siddhi Yadav','7039366074',NULL,'NA','[\"NA\"]','mumbai','Borivali East',23,'Female','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(14,'asif ali khan','7977805173',NULL,'NA','[\"NA\"]','mumbai','Tilaknagar West',32,'Male','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(15,'Kashinath Poojari','7989995647',NULL,'NA','[\"NA\"]','mumbai','Nalasopara',23,'Male','Inside Sales Executive',4,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(16,'Saara Farooqui','8104745108',NULL,'NA','[\"NA\"]','mumbai','Andheri East',19,'Female','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(17,'Vinaykumar Narsayya Chinta','7302587534',NULL,'NA','[\"NA\"]','mumbai','All Mumbai',28,'Male','Inside Sales Executive',4,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(18,'San','9004547189',NULL,'NA','[\"NA\"]','mumbai','Oshiwara',29,'Female','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(19,'Kumar K','9619580721',NULL,'NA','[\"NA\"]','mumbai','Vile Parle West',24,'Male','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(20,'Tejas Ravnang','9619447355',NULL,'NA','[\"NA\"]','mumbai','Kandivali West',24,'Male','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(21,'Khizar','9699975779',NULL,'NA','[\"NA\"]','mumbai','Thane',25,'Male','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(22,'Karur Alfiya','9281401421',NULL,'NA','[\"NA\"]','mumbai','Sion East',24,'Male','Inside Sales Executive',4,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(23,'Khushboo kumari','9316571750',NULL,'NA','[\"NA\"]','mumbai','Powai',25,'Female','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(24,'Mingery Ajaykumar Babu','8454086852',NULL,'NA','[\"NA\"]','mumbai','Mahim East',24,'Male','Inside Sales Executive',4,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(25,'HARSHADA KESARINATH KADVE','8828907568',NULL,'NA','[\"NA\"]','mumbai','Jogeshwari East',27,'Female','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(26,'Shaikh Dilnawaz','9819723387',NULL,'NA','[\"NA\"]','mumbai','Malad',21,'Male','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(27,'Manasi Santosh Gamare','7304016081',NULL,'NA','[\"NA\"]','mumbai','Khar East',23,'Female','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(28,'Ziyaan Raut','9987603029',NULL,'NA','[\"NA\"]','mumbai','Jogeshwari East',19,'Male','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(29,'Rashmi Madwal','7756904631',NULL,'NA','[\"NA\"]','mumbai','Bhayander',25,'Female','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(30,'Shubham','9967337428',NULL,'NA','[\"NA\"]','mumbai','Goregaon West',21,'Male','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(31,'Nayan Jadhav','8806613418',NULL,'NA','[\"NA\"]','mumbai','Vithalwadi',22,'Female','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(32,'Neeta Deshmukh','9372815592',NULL,'NA','[\"NA\"]','mumbai','Sakinaka',21,'Female','Inside Sales Executive',4,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(33,'sagar seema','7045762810',NULL,'NA','[\"NA\"]','mumbai','Bandra West',25,'Male','Inside Sales Executive',4,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(34,'Shubham Mane','9136287661',NULL,'NA','[\"NA\"]','mumbai','Jogeshwari East',22,'Male','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(35,'manoj burkala','9867831163',NULL,'NA','[\"NA\"]','mumbai','Goregaon West',NULL,'Male','BPO Tele calling',1,'2025-06-29 01:23:18','2025-06-29 01:23:18'),(36,'NA','8097023776',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:38:27','2025-06-29 01:38:27'),(37,'NA','9820816379',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:38:27','2025-06-29 01:38:27'),(38,'NA','8291584284',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:38:27','2025-06-29 01:38:27'),(39,'NA','9833200547',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:38:27','2025-06-29 01:38:27'),(40,'NA','7039550827',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:38:27','2025-06-29 01:38:27'),(41,'NA','7845261829',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:38:27','2025-06-29 01:38:27'),(42,'NA','9653174023',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:38:27','2025-06-29 01:38:27'),(43,'NA','8983691615',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:38:27','2025-06-29 01:38:27'),(44,'NA','9920312529',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:38:27','2025-06-29 01:38:27'),(45,'NA','8811837550',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:38:27','2025-06-29 01:38:27'),(46,'NA','8451948929',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:38:27','2025-06-29 01:38:27'),(47,'NA','7039113404',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:38:27','2025-06-29 01:38:27'),(48,'NA','8828045873',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:38:27','2025-06-29 01:38:27'),(49,'NA','9076043905',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:38:27','2025-06-29 01:38:27'),(50,'NA','9076398368',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:38:27','2025-06-29 01:38:27'),(51,'NA','7709240488',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:38:27','2025-06-29 01:38:27'),(52,'NA','8850926554',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:40:42','2025-06-29 01:40:42'),(53,'NA','8657884647',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:40:42','2025-06-29 01:40:42'),(54,'NA','9022384843',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:40:42','2025-06-29 01:40:42'),(55,'NA','9156991206',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:40:42','2025-06-29 01:40:42'),(56,'NA','9372414987',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:40:42','2025-06-29 01:40:42'),(57,'NA','8097721666',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:40:42','2025-06-29 01:40:42'),(58,'NA','9892001523',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:40:42','2025-06-29 01:40:42'),(59,'NA','8976583659',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:40:42','2025-06-29 01:40:42'),(60,'NA','8369548917',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:40:42','2025-06-29 01:40:42'),(61,'NA','7081770518',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:40:42','2025-06-29 01:40:42'),(62,'NA','8591393971',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:40:42','2025-06-29 01:40:42'),(63,'NA','7045118054',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:40:42','2025-06-29 01:40:42'),(64,'NA','9967320497',NULL,'NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:40:42','2025-06-29 01:40:42'),(65,'NA',NULL,'vinayakannapurve5@gmail.com','NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:42:04','2025-06-29 01:42:04'),(66,'NA',NULL,'chinnuswathi504@gmail.com','NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:42:04','2025-06-29 01:42:04'),(67,'NA',NULL,'pasalkardivya17@gmail.com','NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:42:04','2025-06-29 01:42:04'),(68,'NA',NULL,'aathavlenikita@gmail.com','NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:42:04','2025-06-29 01:42:04'),(69,'NA',NULL,'laxmik14792@gmail.com','NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:42:04','2025-06-29 01:42:04'),(70,'NA',NULL,'ashwinibingi44@gmail.com','NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:42:04','2025-06-29 01:42:04'),(71,'NA',NULL,'hamiraniaalih3@gmail.com','NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:42:04','2025-06-29 01:42:04'),(72,'NA',NULL,'yogitagawas1997@gmail.com','NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:42:04','2025-06-29 01:42:04'),(73,'NA',NULL,'mojishan14240@gmail.com','NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:42:04','2025-06-29 01:42:04'),(74,'NA',NULL,'shravanchavan083@gmail.com','NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:42:04','2025-06-29 01:42:04'),(75,'NA',NULL,'kalyanigade141@gmail.com','NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:42:04','2025-06-29 01:42:04'),(76,'NA',NULL,'golsuladivya@gmail.com','NA','[\"NA\"]','NA','NA',NULL,'NA','NA',7,'2025-06-29 01:42:04','2025-06-29 01:42:04'),(77,'Vaishali Balmiki','9975681530','balmikivaishali8@gmail.com','experience','[\"punjabi\", \"kannada\", \"bengali\", \"telugu\", \"tamil\", \"gujarati\", \"urdu\", \"malayalam\", \"odia\", \"assamese\", \"santali\", \"meitei_manipuri\", \"sanskrit\"]','mumbai','Ulhasnagar',22,'Female','Inside Sales Executive',4,'2025-06-29 01:45:06','2025-06-29 01:45:06'),(78,'Kavita Sunil Pawar','8828911926','kavitamohite00@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"telugu\"]','mumbai','Kanjur Marg West',34,'Female','BPO Tele calling',1,'2025-06-29 01:45:07','2025-06-29 01:45:07'),(79,'ahamad sheikh','8879902447','shahrukhshaikh589@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"kannada\"]','mumbai','Jogeshwari East',24,'Male','BPO Tele calling',1,'2025-06-29 01:45:07','2025-06-29 01:45:07'),(80,'Kummaripelly Raju','7207708116','rajukummaripelly321@gmail.com','fresher','[\"english\", \"telugu\"]','mumbai','Kandivali',25,'Male','BPO Tele calling',1,'2025-06-29 01:45:07','2025-06-29 01:45:07'),(81,'Nakul','7303201345','nakulketkar@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Jogeshwari East',21,'Male','BPO Tele calling',1,'2025-06-29 01:45:07','2025-06-29 01:45:07'),(82,'Omkar','8591856053','ambekaromkar160@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','Malad East',19,'Male','BPO Tele calling',1,'2025-06-29 01:45:07','2025-06-29 01:45:07'),(83,'Mohd Faiz Shaikh','8898182486','officemail1to10@gmail.com','experience','[\"english\", \"hindi\", \"urdu\"]','mumbai','Mumbra',26,'Male','BPO Tele calling',1,'2025-06-29 01:45:07','2025-06-29 01:45:07'),(84,'Mohsin Shaikh','8652774295','mohsinnaaz2811@gmail.com','experience','[\"hindi\", \"marathi\", \"urdu\", \"english\"]','mumbai','Malad west',28,'Male','BPO Tele calling',1,'2025-06-29 01:45:07','2025-06-29 01:45:07'),(85,'Amit Yadav','9152644378','yadavamit9963@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','Dronagiri',23,'Male','BPO Tele calling',1,'2025-06-29 01:45:07','2025-06-29 01:45:07'),(86,'Dinesh Nadar','7900058989','dineshnadar358@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"telugu\", \"tamil\", \"malayalam\"]','mumbai','Ghansoli',26,'Male','Inside Sales Executive',4,'2025-06-29 01:45:07','2025-06-29 01:45:07'),(87,'iqra shaikh','8879184091','iqrashaikh6175@gmail.com','experience','[\"english\", \"hindi\"]','mumbai','Oshiwara',29,'Female','BPO Tele calling',1,'2025-06-29 01:45:07','2025-06-29 01:45:07'),(88,'kishan kumar','9137650662','vangalakishankumar9@gmail.com','experience','[\"telugu\", \"hindi\", \"english\"]','mumbai','Andheri West',22,'Male','BPO Tele calling',1,'2025-06-29 01:45:07','2025-06-29 01:45:07'),(89,'Ravi Gupta','7400359889','ravigupta7366@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"gujarati\"]','mumbai','Asalpha',25,'Male','Inside Sales Executive',4,'2025-06-29 01:45:07','2025-06-29 01:45:07'),(90,'Vishwakarma Sahil','9372095778','sahilvishwa2641@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"punjabi\"]','mumbai','Kandivali East',21,'Male','BPO Tele calling',1,'2025-06-29 01:45:07','2025-06-29 01:45:07'),(91,'Sagar Koli','8605349182','kolis6976@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"telugu\"]','mumbai','Ambernath',20,'Male','Inside Sales Executive',4,'2025-06-29 01:45:07','2025-06-29 01:45:07'),(92,'vinod Pullak','9653126611','vinodpullak1207@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"telugu\"]','mumbai','Andheri',24,'Male','Inside Sales Executive',4,'2025-06-29 01:45:07','2025-06-29 01:45:07'),(93,'Priyanka Patil','7249025858','patilpriyanka1709@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','IIT Area',25,'Female','BPO Tele calling',1,'2025-06-30 01:06:20','2025-06-30 01:06:20'),(94,'Ragini chauhan','8329447918','raginicahuhan15@gmail.com','experience','[\"hindi\", \"marathi\"]','mumbai','Vasai Road East',28,'Female','BPO Telecaller',17,'2025-06-30 01:06:20','2025-06-30 01:06:20'),(95,'amiruddin','9321079219','ameeruddinshaikh77@gmail.com','experience','[\"hindi\", \"marathi\", \"english\"]','mumbai','Malad',22,'Male','BPO Telecaller',17,'2025-06-30 01:06:20','2025-06-30 01:06:20'),(96,'pramila santosh gaikwad','7021259475','gaikwadpramila732@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"kannada\"]','mumbai','Mulund East',30,'Female','BPO Tele calling',1,'2025-06-30 01:06:20','2025-06-30 01:06:20'),(97,'Khan Shaziya Fahim','8433534639','shaziyafahimkhan@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"urdu\"]','mumbai','Saki Naka',26,'Female','BPO Tele calling',1,'2025-06-30 01:06:20','2025-06-30 01:06:20'),(98,'Shruti Anil Deshmane','7208173626','shrutideshmane71@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Thane',23,'Female','BPO Tele calling',1,'2025-06-30 01:06:20','2025-06-30 01:06:20'),(99,'Jyothi Koli','6303196237','jyothisurya2020@gmail.com','experience','[\"english\", \"hindi\", \"telugu\"]','mumbai','Thane West',26,'Female','Inside Sales Executive',4,'2025-06-30 01:06:20','2025-06-30 01:06:20'),(100,'Rajashree konda','8828756106','deepukonda1998@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"telugu\"]','mumbai','Sion East',21,'Female','Inside Sales Executive',4,'2025-06-30 01:06:20','2025-06-30 01:06:20'),(101,'Bhagyashree shivaji karbhari','7559116946','bkarbhari10@gmail.com','experience','[\"punjabi\", \"kannada\", \"tamil\", \"urdu\", \"gujarati\", \"bengali\", \"telugu\", \"malayalam\", \"odia\", \"assamese\", \"santali\", \"sanskrit\", \"meitei_manipuri\"]','mumbai','Vile Parle West',23,'Female','Inside Sales Executive',4,'2025-06-30 01:06:20','2025-06-30 01:06:20'),(102,'Abhishek Shejul','9152706166','abhishekshejul85@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','Kandivali East',19,'Male','BPO Tele calling',1,'2025-06-30 01:06:20','2025-06-30 01:06:20'),(103,'Sapna Manjhi','8857034413','sapnamanjhi688@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Boisar',22,'Female','BPO Tele calling',1,'2025-06-30 01:06:20','2025-06-30 01:06:20'),(104,'Rishi Rajendra Rachalwar','9892660102','rishirachalwar0@gmail.com','fresher','[\"english\", \"hindi\", \"telugu\"]','mumbai','Goregaon West',19,'Male','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(105,'ANIKET SANMUKH ZULEKAR','9137702512','aniketzulekar25@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','Vile Parle West',22,'Male','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(106,'Pragathi Sabbani','9326384301','sabbanipragathi22@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"telugu\"]','mumbai','Sewri West',24,'Female','Inside Sales Executive',4,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(107,'Vivek Rajbhar','8655566602','arvindasona@gmail.com','experience','[\"english\", \"hindi\"]','mumbai','Nerul',31,'Male','BPO Telecaller',17,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(108,'Aparna Sawant Shinde','9167719045','aps321.as@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','Kandivali',26,'Female','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(109,'aditi ravindra tambe','7506648228','tambe.aditi1997@gmail.com','experience','[\"hindi\", \"english\", \"marathi\"]','mumbai','Mira Road East',26,'Female','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(110,'Jyoti','7977734775','jyotilot56@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"punjabi\"]','mumbai','Kandivali East',22,'Female','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(111,'Nilofar Shaikh','9004254372','nilushaikh829@gmail.com','experience','[\"hindi\", \"marathi\", \"english\"]','mumbai','Miraroad',23,'Female','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(112,'Shezad Khan','8080348181','sshezadkhan934@gmail.com','experience','[\"english\", \"hindi\"]','mumbai','Powai',21,'Male','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(113,'Priya Dharshani','7400265431','priyadharshani0402@gmail.com','experience','[\"english\", \"hindi\", \"tamil\"]','mumbai','Chandivali',24,'Female','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(114,'ankita','9137531920','ankinvichare@gmail.com','experience','[\"kannada\", \"punjabi\", \"bengali\", \"telugu\", \"tamil\", \"gujarati\", \"urdu\", \"malayalam\", \"odia\", \"assamese\", \"santali\", \"meitei_manipuri\", \"sanskrit\"]','mumbai','Dahisar East',29,'Female','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(115,'Dhruv Visrani','8446487818','dhruvvisrani@gmail.com','fresher','[\"hindi\", \"english\"]','mumbai','Vile Parle West',19,'Male','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(116,'Gaurav Brijesh Jaiswal','9082475557','jaiswalgaurav263@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Powai',23,'Male','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(117,'Kirti javheri','7499349446','javheri011994@gmail.com','experience','[\"sanskrit\", \"meitei_manipuri\", \"santali\", \"assamese\", \"malayalam\", \"odia\", \"urdu\", \"gujarati\", \"bengali\", \"telugu\", \"tamil\", \"kannada\", \"punjabi\"]','mumbai','Ambernath',29,'Female','Inside Sales Executive',4,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(118,'sunil Kumar','7738165654','sunil593527@gmail.com','fresher','[\"english\", \"hindi\", \"kannada\", \"telugu\"]','mumbai','Kanjurmarg East',27,'Male','Inside Sales Executive',4,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(119,'Divya','8691985358','divyasonawane292003@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Fort',19,'Female','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(120,'Siddhesh Kasavkar','9152040691','sidkasavkar@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Andheri',25,'Male','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(121,'mayuri gangar','7738541697','mayurigangar5493@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"gujarati\"]','mumbai','Ghatkoper West',30,'Female','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(122,'Kriahnarawat','9372403302','krishnarawat64190@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','Bhayander East',23,'Male','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(123,'bhati sufiya','8693088505','bhatisufiya@gmail.com','experience','[\"english\", \"hindi\"]','mumbai','Andheri East',20,'Female','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(124,'Ruchita Yadav','7822867287','yadavruchi1605@gmail.com','experience','[\"hindi\", \"marathi\", \"telugu\"]','mumbai','Mansarovar',20,'Female','Inside Sales Executive',4,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(125,'Megha Koli','7738543987','kolimegha68@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','Kandivali East',30,'Female','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(126,'Shruti tiwari','8169139072','shurtitiwari933@gmail.com','experience','[\"english\", \"santali\", \"odia\", \"malayalam\", \"gujarati\", \"tamil\", \"bengali\", \"kannada\", \"punjabi\", \"telugu\", \"urdu\", \"assamese\", \"meitei_manipuri\", \"sanskrit\", \"marathi\"]','mumbai','Govandi',21,'Female','Inside Sales Executive',4,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(127,'k.s.MohanRaj','9489250876','mohankrish520@gmail.com','experience','[\"tamil\", \"english\", \"hindi\", \"telugu\"]','mumbai','goregaon',22,'Male','Inside Sales Executive',4,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(128,'Pathik Singh','8433894469','tomsingh864@gmail.com','experience','[\"english\", \"hindi\", \"gujarati\"]','mumbai','Mira Road',23,'Male','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(129,'varsha yashwad','7715967454','varshavicky0121@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Dahisar East',27,'Female','Inside Sales Executive',4,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(130,'shrikan maheshwaran','9960812783','shrikantmaheshwarm034@gmail.com','experience','[\"hindi\", \"english\", \"marathi\", \"telugu\"]','mumbai','Ulhasnagar',22,'Male','Inside Sales Executive',4,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(131,'Saniya','9769951316','saniyapotrick20@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"Urdu\"]','mumbai','Malad',31,'Female','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(132,'Alisha Chauhan','8591393285','alishachauhan8923@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','Thane',19,'Female','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(133,'Mamta Bendre','9768440788',NULL,'experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Andheri East',24,'Female','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(134,'Bethisa Mandal','8655077310','bethisamandal0812@gmail.com','experience','[\"english\", \"hindi\", \"bengali\"]','mumbai','Airoli',19,'Female','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(135,'KRISHNA GUPTA','8268637725','kg1169141@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','Bhayander West',21,'Male','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(136,'Devang Trivedi','8691867182','devang.trivedi91@gmail.com','experience','[\"english\", \"hindi\"]','mumbai','Mira Road West',32,'Male','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(137,'onkar gawas','8082006820','gawasonkar10@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Borivali',32,'Male','Inside Sales Executive',4,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(138,'Altafa mehjabeen imtiyaz','8291860402','altafashaikh89@gmail.com','experience','[\"Urdu\", \"marathi\", \"kannada\", \"punjabi\", \"bengali\", \"gujarati\", \"telugu\", \"tamil\", \"malayalam\", \"odia\", \"assamese\", \"santali\", \"meitei_manipuri\", \"sanskrit\"]','mumbai','Bandra East',28,'Female','Inside Sales Executive',4,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(139,'Shravani Siricilla','9028521110','shravani.siricilla22@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"telugu\"]','mumbai','Mansarovar',20,'Female','Inside Sales Executive',4,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(140,'Soundarya Mani','9768941656','soundaryamani2315@gmail.com','experience','[\"english\", \"hindi\", \"tamil\"]','mumbai','Malad West',21,'Female','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(141,'Sahil Chavan','7304344134','sk4171150@gmail.com','experience','[\"english\", \"hindi\"]','mumbai','Mumbra East',27,'Male','BPO Telecaller',17,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(142,'SURAJ GAGLANI','9834386289','surajgaglani999@gmail.com','experience','[\"english\", \"hindi\", \"gujarati\"]','mumbai','Borivali West',24,'Male','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(143,'Rajas','9372334736','rajas.vichare1997@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Kanjurmarg East',26,'Male','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(144,'Vishnu Ram Sadiye','9167514665','vishnusadiye63@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','Goregaon West',29,'Male','BPO Tele calling',1,'2025-06-30 01:08:35','2025-06-30 01:08:35'),(145,'Siddhesh M','7738232415','ssmilkcentergs@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"gujarati\"]','mumbai','Vikhroli West',26,'Male','BPO Tele calling',1,'2025-06-30 02:31:38','2025-06-30 02:31:38'),(146,'sarvare alam','9137751140','srvareansari0043@gmail.com','fresher','[\"english\", \"hindi\"]','mumbai','Malad East',23,'Male','BPO Tele calling',1,'2025-06-30 02:31:38','2025-06-30 02:31:38'),(147,'Mohd Arsh','9236145171','arshmohd0101@gmail.com','fresher','[\"english\", \"hindi\"]','mumbai','Oshiwara',23,'Male','BPO Tele calling',1,'2025-06-30 02:31:38','2025-06-30 02:31:38'),(148,'Qais khan','9768101039','qaishashimkhan601@gmail.com','fresher','[\"english\", \"hindi\"]','mumbai','Khar Danda',21,'Male','BPO Tele calling',1,'2025-06-30 02:31:38','2025-06-30 02:31:38'),(149,'Ramya Vishnu Tannir','9152151033','ramyavtannir@gmail.com','fresher','[\"english\", \"hindi\", \"telugu\"]','mumbai','Sion East',22,'Female','Inside Sales Executive',4,'2025-06-30 02:31:38','2025-06-30 02:31:38'),(150,'Neha','9820163124',NULL,'experience','[\"english\", \"hindi\", \"marathi\", \"telugu\"]','mumbai','Dahisar East',21,'Female','BPO Tele calling',1,'2025-06-30 02:31:38','2025-06-30 02:31:38'),(151,'Mounika Koninti','8655519785','mounikakoninti2018@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\", \"telugu\"]','mumbai','Chembur East',23,'Female','Inside Sales Executive',4,'2025-06-30 02:31:38','2025-06-30 02:31:38'),(152,'Aradhna ulidri','7304865709','anitaulidri@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"telugu\"]','mumbai','Masjid West',23,'Female','Inside Sales Executive',4,'2025-06-30 02:31:38','2025-06-30 02:31:38'),(153,'Gayle swami','8104359425','gayleswami17@gmail.com','experience','[\"english\", \"hindi\", \"tamil\"]','mumbai','Kandivali West',22,'Female','BPO Tele calling',1,'2025-06-30 02:31:39','2025-06-30 02:31:39'),(154,'Amol kamble','8805025539','kamblemol43@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"kannada\"]','mumbai','Kandivali',32,'Male','BPO Tele calling',1,'2025-06-30 02:31:39','2025-06-30 02:31:39'),(155,'Pooja Singh','7021765516','poja3828@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','Bhayander West',24,'Female','BPO Tele calling',1,'2025-06-30 02:31:39','2025-06-30 02:31:39'),(156,'Shahjade khan','8840741250','amikkrami@gmail.com','fresher','[\"english\", \"hindi\", \"Urdu\"]','mumbai','Kurla',27,'Male','BPO Tele calling',1,'2025-06-30 02:31:39','2025-06-30 02:31:39'),(157,'Harshada Faske','9004870253','harshadafaske33@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Taloja',26,'Female','BPO Tele calling',1,'2025-06-30 02:31:39','2025-06-30 02:31:39'),(158,'Prabha manoj Devkule','9082136028','prabhasakat94@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Malad',29,'Female','BPO Tele calling',1,'2025-07-01 02:37:19','2025-07-01 02:37:19'),(159,'Isha Jha','9324552496','ishamohanjha@gmail.com','experience','[\"hindi\"]','mumbai','Kandivali East',21,'Female','BPO Tele calling',1,'2025-07-01 02:37:19','2025-07-01 02:37:19'),(160,'Darshana Hemant Nandoskar','8369409637','darshanabhosale21@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Vile Parle',32,'Female','BPO Telecaller',17,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(161,'Yengkokpam Sheetal Devi','9612702550','devishee23@gmail.com','experience','[\"english\", \"hindi\", \"meitei_manipuri\", \"assamese\", \"tamil\", \"marathi\", \"bengali\"]','mumbai','Versova',25,'Female','BPO Tele calling',1,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(162,'Kunal jain','9000592918','kunalj410@gmail.com','experience','[\"english\", \"hindi\", \"gujarati\", \"telugu\"]','mumbai','Malad',30,'Male','Inside Sales Executive',4,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(163,'Pramila','8261099378','pramilagurav335@gmail.com','experience','[\"english\", \"marathi\", \"hindi\"]','mumbai','Malad East',20,'Female','BPO Tele calling',1,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(164,'Nitesh Gupta','9004708856','niteshgupta9191o@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Fort',23,'Male','BPO Tele calling',1,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(165,'Jaiswar Santosh','8976875829','js076719@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Malad East',26,'Male','Inside Sales Executive',4,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(166,'Preeti sapan das','9004783445','dpreetisa@gmail.com','experience','[\"english\", \"hindi\"]','mumbai','Kandivali',20,'Female','BPO Tele calling',1,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(167,'Prathama Shetty','8169245266','shettyprathama2001@gmail.com','experience','[\"hindi\", \"english\", \"marathi\", \"kannada\"]','mumbai','Andheri East',23,'Female','BPO Tele calling',1,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(168,'Sandhya','9136566454','bsandya72@gmail.com','experience','[\"english\", \"hindi\", \"telugu\"]','mumbai','Borivali West',26,'Female','Inside Sales Executive',4,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(169,'Thirupath Jangil','8108921183','karthikj0710@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"telugu\"]','mumbai','Seawoods-Darave',26,'Male','Inside Sales Executive',4,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(170,'Sachin Ramesh Chavan','9372751216','sachinchavan2002.mail@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Bhayander West',22,'Male','Inside Sales Executive',4,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(171,'Rajesh Khanjode','8888183057','rkhanjode8@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Ghansoli',30,'Male','BPO Tele calling',1,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(172,'Himanshu Pathak','9082623805','phimanshu1209@gmail.com','experience','[\"hindi\", \"english\", \"marathi\"]','mumbai','Thane West',24,'Male','BPO Telecaller',17,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(173,'Sneha Dilip Solanki','7738822174','snehasolanki142@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"gujarati\"]','mumbai','Dronagiri',19,'Female','BPO Tele calling',1,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(174,'Shahid','9892286313','shahid.hakim8414@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Mira Road West',34,'Male','BPO Tele calling',1,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(175,'Esakkithai','7738141708','isaacesther694@gmail.com','fresher','[\"tamil\"]','mumbai','Malad West',26,'Female','BPO Tele calling',1,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(176,'Anup kamble','9326485507','anupkamble139@gmail.com','fresher','[\"marathi\", \"english\", \"hindi\"]','mumbai','Kandivali',25,'Male','BPO Tele calling',1,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(177,'Rupika','7977981937','rupikarao2002@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"telugu\"]','mumbai','Belapur',21,'Female','Inside Sales Executive',4,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(178,'Prem','9152453230','premkumardeshaveni@gmail.com','fresher','[\"english\", \"hindi\", \"telugu\"]','mumbai','Borivali West',24,'Male','BPO Tele calling',1,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(179,'Shaikh Saibaj','8850394528','shaikhsaibaj676@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Powai',22,'Male','BPO Tele calling',1,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(180,'Gomathi Periasamy','9892511238','gomathikounder29@gmail.com','experience','[\"tamil\", \"hindi\", \"english\"]','mumbai','Malad West',20,'Female','BPO Tele calling',1,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(181,'Ravi Krishna Shetty','8369820876','ravishetty.rs90@gmail.com','experience','[\"english\", \"hindi\", \"marathi\", \"kannada\"]','mumbai','Malad East',33,'Male','BPO Tele calling',1,'2025-07-01 02:37:20','2025-07-01 02:37:20'),(182,'Priyanka Sawardekar','7400452926','priyusaw044@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','Ghatkopar',28,'Female','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(183,'Jayendra Mitna','9324262307','maddysingh052@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\", \"gujarati\"]','mumbai','Malad East',25,'Male','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(184,'Deepu Singh','9326914677',NULL,'experience','[\"english\", \"hindi\", \"marathi\", \"telugu\"]','mumbai','Dahisar East',23,'Female','Inside Sales Executive',4,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(185,'manigandan Ganesh Devendra','9082816607','manigandandevendra52@gmail.com','fresher','[\"english\", \"hindi\", \"tamil\"]','mumbai','Juhu',20,'Male','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(186,'rahul kamble','9167378237','rk9167378237@gmail.com','experience','[\"english\", \"hindi\", \"kannada\"]','mumbai','Goregaon East',30,'Male','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(187,'Mound Jesu Rajan Nadar','7738789599','rmountjesu@gmail.com','fresher','[\"english\", \"hindi\", \"tamil\"]','mumbai','Kandivali',33,'Male','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(188,'Anil Kumar Yadav','8840646437','anilyadavanilyadav17914@gmail.com','fresher','[\"hindi\"]','mumbai','Asalpha',28,'Male','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(189,'MARUF SHAIKH','9324847845','marufshaikh1911@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Versova',21,'Male','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(190,'Kajal','8657732834','kajallot85@gmail.com','fresher','[\"hindi\", \"english\"]','mumbai','Kandivali East',22,'Female','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(191,'Kiran','9372689100','kjaiswar970@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Goregaon West',23,'Female','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(192,'Annu Sharma','9892915470','sharmaannu9572@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','Kandivali East',20,'Female','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(193,'Deepa vishwakarma','7718929063','vishwadeepa5@gmail.com','experience','[\"english\", \"hindi\"]','mumbai','Malad',18,'Female','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(194,'Aniket Desai','8452024296','aniketd052@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Jogeshwari East',25,'Male','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(195,'Sneha Anand Gupta','9324600523','sneha.r.balla@gmail.com','experience','[\"marathi\", \"telugu\", \"english\", \"hindi\"]','mumbai','Kurla West',31,'Female','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(196,'Shadaf Raza','8767903274','shadafraza57@gmail.com','fresher','[\"english\", \"hindi\", \"urdu\"]','mumbai','Khar East',21,'Male','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(197,'Shaik intiyaz','8919358425','intiyaz0099@gmail.com','experience','[\"english\", \"hindi\", \"telugu\"]','mumbai','Airoli East',25,'Male','Inside Sales Executive',4,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(198,'Vedika Puri','7977069910','garateganesh101@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','Borivali',23,'Female','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(199,'shriya sharma','9324556181','shriya2417@gmail.com','experience','[\"marathi\", \"english\", \"hindi\"]','mumbai','Malad East',22,'Female','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(200,'Ranjitha Reggichettu','7021908659','ranjithareggichettu@gmail.com','experience','[\"hindi\", \"telugu\"]','mumbai','Malad East',21,'Female','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(201,'Vikram Vishwakarma','8009605902','vikramvipul.vi12345@gmail.com','experience','[\"english\", \"hindi\", \"marathi\"]','mumbai','Nala Sopara',21,'Male','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(202,'Nayan','8446017918','balasahebskp@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','Malad',18,'Female','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(203,'Muskan patawa','9326799581','muskanpatwa23010@gmail.com','experience','[\"english\", \"hindi\"]','mumbai','Vikhroli',23,'Female','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(204,'Sakshi','9619242086','sakshiphadke201@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','Kurla Junction East',19,'Female','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(205,'Bhagyalaxmi Kisan Nagal','9082588501','bhagyalaxmijogmalu@gmail.com','experience','[\"hindi\", \"english\", \"marathi\", \"telugu\"]','mumbai','Kandivali',32,'Male','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(206,'Pawan Singh Gehlot','9131673178','pawangehlot13097@gmail.com','experience','[\"english\", \"hindi\", \"telugu\"]','mumbai','Nala Sopara',26,'Male','Inside Sales Executive',4,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(207,'RUPESh','9823686212','ganeshlad9503422346@gmail.com','fresher','[\"english\", \"hindi\", \"marathi\"]','mumbai','Virar East',32,'Male','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18'),(208,'Adil khan','8693854796','khanrulezz77@gmail.com','fresher','[\"english\", \"hindi\"]','mumbai','Andheri East',25,'Male','BPO Tele calling',1,'2025-07-01 04:01:18','2025-07-01 04:01:18');
/*!40000 ALTER TABLE `candidates_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_employee_assignments`
--

DROP TABLE IF EXISTS `client_employee_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_employee_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `client_employee_assignments_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `client_employee_assignments_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_employee_assignments`
--

LOCK TABLES `client_employee_assignments` WRITE;
/*!40000 ALTER TABLE `client_employee_assignments` DISABLE KEYS */;
INSERT INTO `client_employee_assignments` VALUES (1,1,2,'2026-02-23 05:47:49'),(2,1,3,'2026-02-23 05:47:49'),(5,3,4,'2026-02-23 05:48:06'),(7,3,2,'2026-02-23 05:48:20'),(10,2,3,'2026-02-23 05:49:31'),(12,3,2,'2026-03-02 06:28:44'),(13,3,3,'2026-03-02 06:28:44'),(14,2,2,'2026-03-02 06:28:44'),(15,2,3,'2026-03-02 06:28:44');
/*!40000 ALTER TABLE `client_employee_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cp_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Contact Person Name',
  `cp_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Contact Person Email',
  `cp_phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Contact Person Phone',
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `approx_revenue` decimal(15,2) DEFAULT '0.00',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cp_email` (`cp_email`),
  UNIQUE KEY `cp_phone` (`cp_phone`),
  KEY `idx_status` (`status`),
  KEY `idx_cp_email` (`cp_email`),
  KEY `idx_cp_phone` (`cp_phone`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,'Call 2 Connect','Vinit kedari','vinitkedari123@gmail.com','9656297803','abc','','active',1000.00,'','2026-02-23 05:37:10','2026-02-23 05:37:32'),(2,'pace setter','Janhavi','janhavi123@gmail.com','7869456890','XYZ','https://pacesetter.com','active',2500.00,'Test note','2026-02-23 05:42:55','2026-02-23 05:42:55'),(3,'J. P. Morgan','Shravita','shravita123@gmail.com','4596364580','Mumbai','https://jpmorgan.com','inactive',5200.00,'Test note 3','2026-02-23 05:45:04','2026-03-10 05:52:45'),(5,'SBI bank','Vijay','vijay@gmail.com','9869854526','Raigad ','','inactive',1200.00,'','2026-03-10 06:11:57','2026-03-10 06:11:57');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_types`
--

DROP TABLE IF EXISTS `data_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `employee_view_limit` int DEFAULT '10' COMMENT 'Number of candidate rows employees can view at once for this type',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_type_name` (`type_name`),
  KEY `idx_type_name` (`type_name`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_view_limit` (`employee_view_limit`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores all data type definitions for candidate categorization';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_types`
--

LOCK TABLES `data_types` WRITE;
/*!40000 ALTER TABLE `data_types` DISABLE KEYS */;
INSERT INTO `data_types` VALUES (1,'Apna hire','Data Type Description 1',1,'John Smith','2026-02-24 03:44:05','2026-02-24 03:44:05',4),(2,'Manual addition','Manually added candidates from line up tracker',1,'John Smith','2026-02-24 04:41:07','2026-02-24 04:41:07',2);
/*!40000 ALTER TABLE `data_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drop_reasons`
--

DROP TABLE IF EXISTS `drop_reasons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drop_reasons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reason_text` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason_category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'General',
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_category` (`reason_category`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Predefined reasons for dropping candidates';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drop_reasons`
--

LOCK TABLES `drop_reasons` WRITE;
/*!40000 ALTER TABLE `drop_reasons` DISABLE KEYS */;
INSERT INTO `drop_reasons` VALUES (1,'Candidate not interested','Interest',1,'System','2025-06-30 00:32:25'),(2,'Wrong contact information','Contact',1,'System','2025-06-30 00:32:25'),(3,'Overqualified for position','Qualification',1,'System','2025-06-30 00:32:25'),(4,'Underqualified for position','Qualification',1,'System','2025-06-30 00:32:25'),(5,'Salary expectation too high','Compensation',1,'System','2025-06-30 00:32:25'),(6,'Location preference mismatch','Location',1,'System','2025-06-30 00:32:25'),(7,'Already employed elsewhere','Employment',1,'System','2025-06-30 00:32:25'),(8,'Not available for interview','Availability',1,'System','2025-06-30 00:32:25'),(9,'Skills mismatch','Skills',1,'System','2025-06-30 00:32:25'),(10,'Communication issues','Communication',1,'System','2025-06-30 00:32:25'),(11,'Other','General',1,'System','2025-06-30 00:32:25');
/*!40000 ALTER TABLE `drop_reasons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dropped_candidates`
--

DROP TABLE IF EXISTS `dropped_candidates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dropped_candidates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `candidate_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `candidate_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `candidate_mobile` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data_type_id` int DEFAULT NULL,
  `data_type_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `drop_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dropped_by` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Admin ID who dropped the candidate',
  `dropped_by_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dropped_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `previous_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Status before dropping (passed, assigned, etc.)',
  `future_consideration` enum('yes','no') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_candidate_id` (`candidate_id`),
  KEY `idx_dropped_by` (`dropped_by`),
  KEY `idx_dropped_at` (`dropped_at`),
  KEY `idx_data_type` (`data_type_id`),
  CONSTRAINT `fk_dropped_candidates_admin` FOREIGN KEY (`dropped_by`) REFERENCES `admins` (`admin_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dropped_candidates_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates_data` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dropped_candidates_data_type` FOREIGN KEY (`data_type_id`) REFERENCES `data_types` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dropped_candidates`
--

LOCK TABLES `dropped_candidates` WRITE;
/*!40000 ALTER TABLE `dropped_candidates` DISABLE KEYS */;
INSERT INTO `dropped_candidates` VALUES (1,80,'Kummaripelly Raju','rajukummaripelly321@gmail.com','7207708116',1,'BPO Tele calling','najjj','ADM_001','Vinit vinod kedari','2025-07-04 18:16:28','passed','no',NULL);
/*!40000 ALTER TABLE `dropped_candidates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `employee_assignment_summary`
--

DROP TABLE IF EXISTS `employee_assignment_summary`;
/*!50001 DROP VIEW IF EXISTS `employee_assignment_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `employee_assignment_summary` AS SELECT 
 1 AS `employee_id`,
 1 AS `full_name`,
 1 AS `designation`,
 1 AS `type_name`,
 1 AS `employee_view_limit`,
 1 AS `current_assigned`,
 1 AS `total_completed`,
 1 AS `total_dropped`,
 1 AS `total_passed`,
 1 AS `total_rings`,
 1 AS `available_slots`,
 1 AS `last_assignment_date`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `employee_assignments`
--

DROP TABLE IF EXISTS `employee_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `candidate_id` int NOT NULL,
  `data_type_id` int NOT NULL,
  `assignment_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('assigned','in_progress','completed','passed','dropped') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'assigned',
  `assigned_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'System',
  `priority` tinyint(1) DEFAULT '1' COMMENT '1=Normal, 2=High, 3=Urgent',
  `deadline` datetime DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_assignment` (`employee_id`,`candidate_id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_candidate` (`candidate_id`),
  KEY `idx_data_type` (`data_type_id`),
  KEY `idx_status` (`status`),
  KEY `idx_assignment_date` (`assignment_date`),
  CONSTRAINT `fk_assign_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_assign_data_type` FOREIGN KEY (`data_type_id`) REFERENCES `data_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_assign_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks which candidates are assigned to which employees';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_assignments`
--

LOCK TABLES `employee_assignments` WRITE;
/*!40000 ALTER TABLE `employee_assignments` DISABLE KEYS */;
INSERT INTO `employee_assignments` VALUES (1,'EMP002',11,1,'2026-02-24 04:11:10','in_progress','EMP002',1,NULL,NULL,'2026-02-24 04:11:10','2026-02-24 04:16:29'),(2,'EMP002',12,1,'2026-02-24 04:11:37','completed','EMP002',1,NULL,NULL,'2026-02-24 04:11:37','2026-02-24 04:44:51'),(3,'EMP002',13,1,'2026-02-24 04:13:19','completed','EMP002',1,NULL,NULL,'2026-02-24 04:13:19','2026-02-24 04:45:36'),(4,'EMP002',14,1,'2026-02-24 04:13:44','in_progress','EMP002',1,NULL,NULL,'2026-02-24 04:13:44','2026-02-24 05:41:37'),(5,'EMP002',43,2,'2026-02-24 04:42:29','assigned','EMP002',1,NULL,NULL,'2026-02-24 04:42:29','2026-02-24 04:42:29'),(6,'EMP003',33,1,'2026-02-24 05:49:09','in_progress','EMP003',1,NULL,NULL,'2026-02-24 05:49:09','2026-02-28 11:23:40'),(7,'EMP003',34,1,'2026-02-24 05:53:36','completed','EMP003',1,NULL,NULL,'2026-02-24 05:53:36','2026-02-24 05:53:46'),(8,'EMP003',30,1,'2026-02-24 06:36:46','assigned','EMP003',1,NULL,NULL,'2026-02-24 06:36:46','2026-02-24 06:36:46'),(9,'EMP003',29,1,'2026-02-24 06:39:39','completed','EMP003',1,NULL,NULL,'2026-02-24 06:39:39','2026-02-24 06:55:12'),(10,'EMP003',45,2,'2026-02-24 13:20:18','assigned','EMP003',1,NULL,NULL,'2026-02-24 13:20:18','2026-02-24 13:20:18'),(11,'EMP004',10,1,'2026-02-24 13:34:23','in_progress','EMP004',1,NULL,NULL,'2026-02-24 13:34:23','2026-02-28 11:17:02'),(12,'EMP004',32,1,'2026-02-24 13:37:02','assigned','EMP004',1,NULL,NULL,'2026-02-24 13:37:02','2026-02-24 13:37:02'),(13,'EMP004',36,1,'2026-02-24 13:38:52','assigned','EMP004',1,NULL,NULL,'2026-02-24 13:38:52','2026-02-24 13:38:52'),(14,'EMP002',36,1,'2026-02-28 11:48:17','assigned','ADM001',1,NULL,NULL,'2026-02-28 11:48:17','2026-02-28 11:48:17'),(15,'EMP002',18,1,'2026-03-02 06:35:55','completed','EMP002',1,NULL,NULL,'2026-03-02 06:35:55','2026-03-02 06:52:44'),(16,'EMP004',19,1,'2026-03-17 07:16:44','assigned','EMP004',1,NULL,NULL,'2026-03-17 07:16:44','2026-03-17 07:16:44');
/*!40000 ALTER TABLE `employee_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_data_types`
--

DROP TABLE IF EXISTS `employee_data_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_data_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `data_type_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_emp_dtype` (`employee_id`,`data_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_data_types`
--

LOCK TABLES `employee_data_types` WRITE;
/*!40000 ALTER TABLE `employee_data_types` DISABLE KEYS */;
INSERT INTO `employee_data_types` VALUES (1,2,1),(2,3,1),(3,4,1),(4,8,1);
/*!40000 ALTER TABLE `employee_data_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_lop_records`
--

DROP TABLE IF EXISTS `employee_lop_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_lop_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lop_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lop_date` date NOT NULL,
  `lop_amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_lop_employee` (`employee_id`),
  CONSTRAINT `fk_lop_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_lop_records`
--

LOCK TABLES `employee_lop_records` WRITE;
/*!40000 ALTER TABLE `employee_lop_records` DISABLE KEYS */;
INSERT INTO `employee_lop_records` VALUES (2,'EMP002','LOP Reason 2','2026-02-22',20.00,'2026-02-23 07:34:11'),(3,'EMP003','LOP Reason 3','2026-02-17',10.00,'2026-02-23 07:34:43'),(6,'EMP003','lop reason','2026-03-10',551.00,'2026-03-10 10:38:38');
/*!40000 ALTER TABLE `employee_lop_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_online_status`
--

DROP TABLE IF EXISTS `employee_online_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_online_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_online` tinyint(1) NOT NULL DEFAULT '0',
  `last_active` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_employee` (`employee_id`),
  CONSTRAINT `fk_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_online_status`
--

LOCK TABLES `employee_online_status` WRITE;
/*!40000 ALTER TABLE `employee_online_status` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_online_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_pip_records`
--

DROP TABLE IF EXISTS `employee_pip_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_pip_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pip_start_date` date NOT NULL,
  `pip_end_date` date NOT NULL,
  `pip_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('active','completed','terminated') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `status` (`status`),
  CONSTRAINT `employee_pip_records_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_pip_records`
--

LOCK TABLES `employee_pip_records` WRITE;
/*!40000 ALTER TABLE `employee_pip_records` DISABLE KEYS */;
INSERT INTO `employee_pip_records` VALUES (1,'EMP003','2025-06-27','2025-07-02','brwer','completed','Aditya kedari','2025-06-27 07:52:00','2025-06-27 07:52:18'),(2,'EMP001','2025-07-01','2025-07-02','abc','completed','Vinit kedari','2025-07-01 01:55:13','2025-07-01 02:48:53'),(3,'EMP001','2025-07-01','2025-08-02','abc','completed','Vinit kedari','2025-07-01 03:55:15','2025-12-28 17:59:01'),(4,'EMP002','2025-12-28','2025-12-31','Trial pip','completed','Admin','2025-12-28 17:58:43','2025-12-28 18:00:08'),(5,'EMP001','2025-12-28','2025-12-31','sfghj','completed','Admin','2025-12-28 18:04:05','2025-12-28 18:04:26'),(6,'EMP002','2026-03-10','2026-03-13','','completed','John Smith','2026-03-10 07:36:58','2026-03-10 07:42:58'),(7,'EMP005','2026-03-10','2026-03-17','','completed','John Smith','2026-03-10 07:42:48','2026-03-27 11:49:28');
/*!40000 ALTER TABLE `employee_pip_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_workload`
--

DROP TABLE IF EXISTS `employee_workload`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_workload` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_type_id` int NOT NULL,
  `assigned_count` int DEFAULT '0',
  `completed_count` int DEFAULT '0',
  `dropped_count` int DEFAULT '0',
  `passed_count` int DEFAULT '0',
  `total_ring_count` int DEFAULT '0',
  `last_assignment_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_employee_data_type` (`employee_id`,`data_type_id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_data_type` (`data_type_id`),
  KEY `idx_assigned_count` (`assigned_count`),
  CONSTRAINT `fk_workload_data_type` FOREIGN KEY (`data_type_id`) REFERENCES `data_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_workload_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=259 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks employee workload per data type';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_workload`
--

LOCK TABLES `employee_workload` WRITE;
/*!40000 ALTER TABLE `employee_workload` DISABLE KEYS */;
INSERT INTO `employee_workload` VALUES (1,'EMP001',1,12,3,0,0,1,'2026-02-13 05:27:32','2025-06-30 00:38:33','2026-02-20 04:28:12'),(2,'EMP002',1,11,4,0,1,1,'2026-02-28 11:48:17','2025-06-30 00:38:33','2026-02-28 11:48:17'),(3,'EMP003',1,12,2,0,0,0,'2026-02-24 06:39:39','2025-06-30 00:38:33','2026-02-24 06:55:12'),(4,'EMP004',1,13,0,0,0,0,'2026-02-24 13:38:52','2025-06-30 00:38:33','2026-02-24 13:38:52'),(37,'EMP001',4,0,0,0,1,0,'2026-02-20 04:22:17','2025-06-30 00:48:44','2026-02-20 04:22:17'),(38,'EMP002',4,0,0,0,0,0,NULL,'2025-06-30 00:48:44','2025-07-08 14:12:01'),(39,'EMP003',4,0,0,0,0,0,NULL,'2025-06-30 00:48:44','2025-07-08 14:12:01'),(40,'EMP004',4,5,0,0,0,0,'2025-06-30 01:08:45','2025-06-30 00:48:44','2025-07-08 14:12:01'),(49,'EMP001',7,0,0,0,0,0,NULL,'2025-06-30 00:48:44','2025-07-08 14:12:01'),(50,'EMP002',7,0,0,0,0,0,NULL,'2025-06-30 00:48:44','2025-07-08 14:12:01'),(51,'EMP003',7,0,0,0,0,0,NULL,'2025-06-30 00:48:44','2025-07-08 14:12:01'),(52,'EMP004',7,10,0,0,0,0,'2025-06-30 00:48:44','2025-06-30 00:48:44','2025-07-08 14:12:01'),(97,'EMP001',17,0,0,0,0,0,NULL,'2025-06-30 01:06:28','2025-07-08 14:12:01'),(98,'EMP002',17,0,0,0,0,0,NULL,'2025-06-30 01:06:28','2025-07-08 14:26:48'),(121,'EMP005',1,10,0,0,0,0,'2025-07-10 07:44:13','2025-07-03 14:06:48','2025-07-10 07:44:13'),(171,'EMP005',4,0,0,0,0,0,NULL,'2025-07-03 14:06:48','2025-07-08 14:12:01'),(180,'EMP003',17,0,0,0,0,0,NULL,'2025-07-03 14:06:48','2025-07-08 14:12:01'),(181,'EMP005',17,0,0,0,0,0,NULL,'2025-07-03 14:06:48','2025-07-08 14:12:01'),(192,'EMP001',15,0,0,0,0,0,NULL,'2025-07-08 12:31:10','2025-07-08 14:12:01'),(197,'EMP002',15,0,0,0,0,0,NULL,'2025-07-08 12:31:10','2025-07-08 14:12:01'),(202,'EMP003',15,0,0,0,0,0,NULL,'2025-07-08 12:31:10','2025-07-08 14:12:01'),(207,'EMP004',15,0,0,0,0,0,NULL,'2025-07-08 12:31:10','2025-07-08 14:12:01'),(208,'EMP004',17,0,0,0,0,0,NULL,'2025-07-08 12:31:10','2025-07-08 14:12:01'),(211,'EMP005',7,0,0,0,0,0,NULL,'2025-07-08 12:31:10','2025-07-08 14:12:01'),(212,'EMP005',15,0,0,0,0,0,NULL,'2025-07-08 12:31:10','2025-07-08 14:12:01'),(217,'EMP006',1,5,0,0,0,0,'2026-02-18 15:24:19','2026-02-02 14:36:06','2026-02-18 15:24:19'),(218,'EMP007',1,1,0,0,0,0,'2026-02-02 16:54:22','2026-02-02 16:54:22','2026-02-02 16:54:22'),(219,'EMP004',42,1,0,0,0,0,'2026-02-03 18:26:27','2026-02-03 18:26:27','2026-02-03 18:26:27'),(220,'EMP001',42,5,0,0,0,0,'2026-02-20 04:08:23','2026-02-03 18:53:35','2026-02-20 04:08:23'),(225,'EMP003',42,1,0,0,0,0,'2026-02-04 10:23:00','2026-02-04 10:23:00','2026-02-04 10:23:00'),(226,'EMP002',42,2,0,0,0,0,'2026-02-04 10:25:43','2026-02-04 10:24:09','2026-02-04 10:25:43'),(228,'ADM_001',42,0,1,1,0,0,'2026-02-04 13:24:24','2026-02-04 12:50:24','2026-02-18 16:44:52'),(249,'EMP002',2,1,0,0,0,0,'2026-02-24 04:42:29','2026-02-24 04:42:29','2026-02-24 04:42:29'),(254,'EMP003',2,1,0,0,0,0,'2026-02-24 13:20:18','2026-02-24 13:20:18','2026-02-24 13:20:18');
/*!40000 ALTER TABLE `employee_workload` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('male','female','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dob` date NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `recovery_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `aadhar_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `correspondence_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pan_number` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `aadhar_number` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `aadhar_file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pan_file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cancelled_cheque_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `bank_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ifsc_code` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_holder_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `designation` enum('employee','admin','core','manager','team_leader','salaryemp','freelancer') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'employee',
  `view_limit` int DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `show_payout` enum('actual','fake') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'fake',
  `salary` decimal(10,2) DEFAULT NULL,
  `selection_date` date DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `status` enum('pending','active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `pan_number` (`pan_number`),
  UNIQUE KEY `aadhar_number` (`aadhar_number`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_email` (`email`),
  KEY `idx_phone` (`phone`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'ADM001','John  Smith','John','','Smith','male','1995-03-15','vinitkedari04@gmail.com','vinitkedari04@gmail.com','9171234567','123 Main St, Quezon City, Philippines','123 Main St, Quezon City, Philippines','BACDE1234F','341234123412','/uploads/employees/ADM001_aadhar.png','/uploads/employees/ADM001_pan.jpg','/uploads/employees/ADM001_cheque.png','HDFC Bank','MG Road Branch','HDFC0004321','123456789090','John Michael Smith','$2b$10$cCVlOKSRTjoz57lgwOIEceXRXUFlnUI2ltEXaJBojYKviiqkowv/G','admin',4,NULL,'actual',NULL,'2026-02-10','2026-02-15','active','2026-02-22 15:11:49','2026-02-24 05:23:17'),(2,'EMP002','Priya Sushil Mehta','Priya','Sushil','Mehta','female','1995-09-13','priya.mehta@example.com','priya.mehta@example.com','9123456780','78 Park Street, Mumbai, Maharashtra, India','78 Park Street, Mumbai, Maharashtra, India','PQRSX5678L','234523452345','/uploads/employees/EMP002_aadhar.png','/uploads/employees/EMP002_pan.jpg','/uploads/employees/EMP002_cheque.png','ICICI Bank','Andheri Branch','ICIC0005678','234567890123','Priya Mehta','$2b$10$2vlLccbYf9spQWPGB5nVJeH1sw5XF9cKz2QJnwC7vltAmefYE.6cu','salaryemp',5,2.50,'actual',NULL,'2026-03-25','2026-03-26','active','2026-02-22 17:10:33','2026-03-27 13:37:50'),(3,'EMP003','Rahul  Sharma','Rahul','','Sharma','male','1992-04-13','rahul.sharma@example.com','rahul.sharma@example.com','9876543210','12 MG Road, Bengaluru, Karnataka, India','12 MG Road, Bengaluru, Karnataka, India','ABCDE1234F','123412341234','/uploads/employees/EMP003_aadhar.png','/uploads/employees/EMP003_pan.jpg','/uploads/employees/EMP003_cheque.png','HDFC Bank','MG Road Branch','HDFC0001234','123456789012','Rahul Kumar Sharma','$2b$10$97l.yQTkIcCOP0P6V2r6p.SO.9jDvPVwFqqW5YTgzp2DwiowgbmG.','salaryemp',3,NULL,'fake',NULL,NULL,NULL,'active','2026-02-22 18:03:24','2026-03-27 13:38:36'),(4,'EMP004','Neha R. Verma','Neha','R.','Verma','female','1993-06-30','neha.verma@example.com','neha.verma@example.com','9988776655','56 Civil Lines, Jaipur, Rajasthan, India','56 Civil Lines, Jaipur, Rajasthan, India','UVWXY3456Z','456745674567','/uploads/employees/EMP004_aadhar.png','/uploads/employees/EMP004_pan.jpg','/uploads/employees/EMP004_cheque.png','Axis Bank','MI Road Branch','UTIB0003456','456789012345','Neha Verma','$2b$10$eZwkFNpTv7mQ5GhCh1WPuuqWaLsXEFF1dN93DK830UvLEB9ERbS22','salaryemp',2,5.00,'fake',NULL,'2026-02-01','2026-02-10','inactive','2026-02-22 18:17:48','2026-02-22 18:17:48'),(5,'ADM002','Maria Isabel Garcia','Maria','Isabel','Garcia','female','1990-07-22','sushantkocharekar271@gmail.com','maria.recovery@example.com','9281234567','456 Mabini St, Manila, Philippines','456 Mabini St, Manila, Philippines','BACDE1237F','341234123436','/uploads/employees/ADM002_aadhar.png','/uploads/employees/ADM002_pan.jpg','/uploads/employees/ADM002_cheque.png','ICICI Bank','Andheri Branch','ICIC0005612','234567890185','Maria Garcia','$2b$10$EK3JTR7XwM0rZUjGMG36Xuia1rjmcs3MR8SQkUN5.zJnFreiYv3/u','admin',0,NULL,'actual',NULL,NULL,NULL,'active','2026-02-23 04:08:50','2026-02-24 05:26:51'),(6,'ADM003','David Lee Johnson','David','Lee','Johnson','male','1982-11-05','shravitakelkar@gmail.com','shravitakelkar@gmail.com','9391234567','789 Rizal Ave, Cebu City, Philippines','789 Rizal Ave, Cebu City, Philippines','ABCDE1279F','123412341262','/uploads/employees/ADM006_aadhar.png','/uploads/employees/ADM006_pan.jpg','/uploads/employees/ADM006_cheque.png','Axis Bank','Karnataka','UTIB0003475','456789012327','David Johnson','$2b$10$Al2CLX234MjgLP6nMVj/GOV6ZTZmG0R1LxOiE4BrpjQk9bOMXd8ra','admin',0,NULL,'actual',NULL,NULL,NULL,'active','2026-02-23 04:30:38','2026-03-28 13:19:20'),(7,'ADM004','Angela Marie Reyes','Angela','Marie','Reyes','female','1995-01-30','janhavibandbe30@gmail.com','janhavibandbe30@gmail.com','9451234567','321 Bonifacio St, Davao City, Philippines','321 Bonifacio St, Davao City, Philippines','UVWXY3458U','456745674589','/uploads/employees/ADM007_aadhar.png','/uploads/employees/ADM007_pan.jpg','/uploads/employees/ADM007_cheque.png','Axis Bank','marol','UTIB0003467','456789012339','Angela Reyes','$2b$10$LN0Vucc4b2p1c0LQ9NDKRePWazdHDA6pHusKFHDO/Sufj8ylqBp4G','admin',0,NULL,'actual',NULL,NULL,NULL,'active','2026-02-23 04:42:33','2026-02-24 05:33:56'),(8,'EMP005','Amit Raj Mehta','Amit','Raj','Mehta','male','2005-06-19','amit.mehta@example.com','amit.recovery@example.com','9345678901','45 SG Highway, Ahmedabad, 380015','45 SG Highway, Ahmedabad, 380015','LMNOP4321Q','345634563456','/uploads/employees/EMP005_aadhar.png','/uploads/employees/EMP005_pan.jpg','/uploads/employees/EMP005_cheque.png','ICICI Bank','Satellite Branch','ICIC0005639','789123456789','Amit Raj Mehta','$2b$10$6AO3qrmQaaYTEctt6.MydekDJa/S5PPZ7PmX5uLp544dxqclGh46K','employee',5,6.00,'actual',NULL,'2026-02-12','2026-03-05','inactive','2026-02-23 04:56:23','2026-02-23 04:56:23'),(10,'EMP009','Sanika Raman Rathod','Sanika','Raman','Rathod','female','2004-01-30','sanika.rathod@example.com','sanika.rathod@example.com','6663339990','Address_of_Sanika','Address_of_Sanika','ABCDE1237Y','111144442229','/uploads/employees/EMP009_aadhar.png','/uploads/employees/EMP009_pan.jpg','/uploads/employees/EMP009_cheque.png','Axis Bank','Pune','SBIN0001274','12345678946','Sanika Rathod','$2b$10$Bjd95OfKkUTYcTA1PohoredzI.oHBx9NKdQV6HsDcaubPieZMN5Cm','employee',6,2.00,'fake',NULL,'2026-03-02','2026-03-27','active','2026-03-27 14:07:46','2026-03-27 14:07:46');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meetings`
--

DROP TABLE IF EXISTS `meetings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meetings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `meeting_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `google_meet_link` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `members` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `meeting_date` datetime DEFAULT NULL,
  `duration_minutes` int DEFAULT '60',
  `created_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('scheduled','ongoing','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'scheduled',
  PRIMARY KEY (`id`),
  KEY `idx_meetings_date` (`meeting_date`),
  KEY `idx_meetings_status` (`status`),
  KEY `idx_meetings_created_by` (`created_by`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meetings`
--

LOCK TABLES `meetings` WRITE;
/*!40000 ALTER TABLE `meetings` DISABLE KEYS */;
INSERT INTO `meetings` VALUES (1,'Sales Strategy Discussion','https://meet.google.com/abc-defg-hij','[\"EMP002\",\"EMP003\"]','Discussion about Q1 sales targets and strategy planning.','2026-02-25 17:50:00',30,'John Smith','2026-02-23 07:23:25','2026-02-23 07:23:25','scheduled'),(2,'Marketing Campaign Review','https://meet.google.com/klm-nopq-rst','[\"EMP004\",\"EMP005\"]','','2026-02-23 16:00:00',45,'John Smith','2026-02-23 07:27:19','2026-02-23 07:28:04','completed'),(3,'Project Kickoff Meeting','https://meet.google.com/efg-hijk-lmn','[\"EMP002\",\"EMP003\"]','Initial kickoff meeting for the new client project.','2026-02-24 15:30:00',60,'John Smith','2026-02-23 07:29:31','2026-02-23 07:29:31','scheduled'),(4,'Team Leader Sync','https://meet.google.com/uvw-xyza-bcd','[\"EMP002\",\"EMP003\",\"EMP004\",\"EMP005\"]','Weekly sync-up meeting for all team leaders.','2026-02-24 17:00:00',15,'John Smith','2026-02-23 07:30:56','2026-02-23 07:30:56','scheduled'),(5,'Freelancer Coordination Call','https://meet.google.com/opq-rstu-vwx','[\"\"]','Coordination call with freelance contributors.','2026-02-25 19:15:00',60,'John Smith','2026-02-23 07:32:09','2026-02-23 07:32:09','scheduled');
/*!40000 ALTER TABLE `meetings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_type` enum('admin','employee') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_sender` (`sender_type`,`sender_id`),
  KEY `idx_receiver` (`receiver_id`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_conversation` (`sender_id`,`receiver_id`,`timestamp`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,'admin','ADM_001','EMP003','hii','2025-06-30 12:13:37',1),(2,'admin','ADM_001','EMP_001','Welcome to the messaging system! Feel free to reach out if you have any questions.','2025-06-30 12:31:19',0),(3,'admin','ADM_001','EMP_001','Welcome to the messaging system! Feel free to reach out if you have any questions.','2025-06-30 12:32:04',0),(4,'admin','ADM_001','EMP001','sjsjs','2025-06-30 12:34:26',1),(5,'employee','EMP001','ADM_001','bsdjsjsssjnsnjs','2025-06-30 12:51:29',1),(6,'employee','EMP003','ADM_002','hdjhjsjjh','2025-06-30 12:54:38',1),(7,'admin','ADM_001','EMP_001','Test message 1 from Vinit - 2025-06-30 20:26:01','2025-06-30 12:56:01',0),(8,'admin','ADM_001','EMP_001','Test message 2 from Vinit - 2025-06-30 20:26:01','2025-06-30 12:56:02',0),(9,'admin','ADM_002','EMP_001','Test message 1 from Aditya - 2025-06-30 20:26:01','2025-06-30 12:56:02',0),(10,'admin','ADM_002','EMP_001','Test message 2 from Aditya - 2025-06-30 20:26:01','2025-06-30 12:56:02',0),(11,'admin','ADM_002','EMP_001','Test message 3 from Aditya - 2025-06-30 20:26:01','2025-06-30 12:56:02',0),(12,'admin','ADM_002','EMP003','hwjhjsjja','2025-06-30 12:56:58',1),(13,'admin','ADM_002','EMP003','jjjsj','2025-06-30 12:57:48',1),(14,'employee','EMP003','ADM_002','hsalhlaassan','2025-06-30 13:00:29',1),(15,'admin','ADM_002','EMP003','hjhdshjsa','2025-06-30 13:00:41',1),(16,'admin','ADM_002','EMP003','bdjsjs','2025-06-30 13:15:51',1),(17,'employee','EMP003','ADM_002','ndsk','2025-06-30 13:23:04',1),(18,'employee','EMP003','ADM_001','jdsjs','2025-06-30 13:23:13',1),(19,'employee','EMP003','ADM_002','sjsjjs','2025-06-30 13:25:13',1),(20,'admin','ADM_001','EMP003','hiii','2025-06-30 15:11:42',1),(21,'admin','ADM_001','EMP001','hiii','2025-06-30 15:11:42',1),(22,'admin','ADM_001','EMP002','hiii','2025-06-30 15:11:42',1),(23,'admin','ADM_001','EMP004','hiii','2025-06-30 15:11:42',1),(24,'admin','ADM_001','EMP001','sndsjs','2025-06-30 15:17:54',1),(25,'admin','ADM_001','EMP002','sndsjs','2025-06-30 15:17:54',1),(26,'admin','ADM_001','EMP003','sndsjs','2025-06-30 15:17:54',1),(27,'admin','ADM_001','EMP004','sndsjs','2025-06-30 15:17:54',1),(28,'admin','ADM_001','EMP001','ss','2025-06-30 15:23:17',1),(29,'admin','ADM_001','EMP001','vgss','2025-06-30 15:49:09',1),(30,'admin','ADM_001','EMP002','vgss','2025-06-30 15:49:09',1),(31,'admin','ADM_001','EMP003','vgss','2025-06-30 15:49:09',1),(32,'admin','ADM_001','EMP004','vgss','2025-06-30 15:49:09',1),(33,'admin','ADM_001','EMP001','hieee','2025-07-01 02:25:13',1),(34,'admin','ADM_001','EMP001','hey aditya','2025-07-01 02:25:44',1),(35,'admin','ADM_001','EMP001','heyyyyyyyy','2025-07-01 02:27:45',1),(36,'admin','ADM_001','EMP001','hello hii','2025-07-01 02:29:35',1),(37,'admin','ADM_001','EMP002','hello hii','2025-07-01 02:29:35',1),(38,'admin','ADM_001','EMP003','hello hii','2025-07-01 02:29:35',1),(39,'admin','ADM_001','EMP001','hello','2025-07-01 04:17:11',1),(40,'admin','ADM_001','EMP001','hello team 5','2025-07-01 04:20:17',1),(41,'admin','ADM_001','EMP002','hello team 5','2025-07-01 04:20:17',1),(42,'admin','ADM_001','EMP003','hello team 5','2025-07-01 04:20:17',1),(43,'employee','EMP001','ADM_001','hello tl 5','2025-07-01 04:20:45',1),(44,'admin','ADM_001','EMP001','bj','2025-07-01 14:04:46',1),(45,'employee','EMP001','ADM_001','jjshshja','2025-07-02 02:56:26',1),(46,'employee','EMP004','ADM_001','ssbbbsbbbkkbkbsssdbhbs','2025-07-02 03:18:33',1),(47,'admin','ADM_001','EMP001','js','2025-07-02 03:19:35',1),(48,'admin','ADM_001','EMP004','hh','2025-07-02 05:29:38',1),(49,'admin','ADM_002','EMP001','ajasjsjlss','2025-07-03 12:51:22',1),(50,'admin','ADM_001','EMP001','jnajnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn','2025-07-03 12:52:21',1),(51,'employee','EMP001','ADM_002','jsjbjabjbjasbjlbjljla','2025-07-03 12:53:15',1),(52,'admin','ADM_001','EMP003','whats&#039;s going on','2025-07-04 10:58:30',1),(53,'admin','ADM_001','EMP003','what&#039;s going on','2025-07-04 10:58:48',1),(54,'admin','ADM_001','EMP003','what&#039;s going on','2025-07-04 11:02:07',1),(55,'admin','ADM_001','EMP003','what&#039;s going on','2025-07-04 11:05:34',1),(56,'admin','ADM_001','EMP003','//.;;.;.;','2025-07-04 11:05:45',1),(57,'admin','ADM_001','EMP003','.a','2025-07-04 11:05:45',1),(58,'employee','EMP003','ADM_001','what\'s going on','2025-07-04 11:08:05',1),(59,'admin','ADM_001','EMP003','what&#039;s going on','2025-07-04 11:09:01',1),(60,'admin','ADM_001','EMP003','what&#039;s going on','2025-07-04 11:12:48',1),(61,'admin','ADM_001','EMP003','bjkasbas','2025-07-04 11:15:15',1),(62,'admin','ADM_001','EMP001','what&#039;s going on','2025-07-04 11:19:17',1),(63,'employee','EMP003','ADM_001','what\'s going on','2025-07-04 12:36:36',1),(64,'admin','ADM_001','EMP003','what&#039;s going on','2025-07-04 12:37:05',1),(65,'admin','ADM_001','EMP002','jjakka\\','2025-07-04 19:50:53',1),(66,'employee','EMP002','ADM_001','what\'s app','2025-07-04 19:59:08',1),(67,'admin','ADM_001','EMP002','bbhahah','2025-07-04 20:04:42',1),(68,'admin','ADM_001','EMP002','nnajnzj','2025-07-04 20:05:08',1),(69,'admin','ADM_001','EMP002','nxdxvbxbc','2025-07-04 20:06:18',1),(70,'admin','ADM_001','EMP002','jbasjjkkjak','2025-07-04 20:26:34',1),(71,'admin','ADM_001','EMP002','gura','2025-07-04 20:27:09',1),(72,'admin','ADM_001','EMP002','as','2025-07-04 20:27:11',1),(73,'admin','ADM_001','EMP002','hhhhhkbk','2025-07-04 20:29:04',1),(74,'admin','ADM_001','EMP002','nsjajnas','2025-07-04 20:33:05',1),(75,'admin','ADM_001','EMP002','hiii','2025-07-04 20:33:27',1),(76,'admin','ADM_001','EMP002','nsfdjsf','2025-07-04 20:33:56',1),(77,'admin','ADM_001','EMP002','nanns','2025-07-04 20:34:40',1),(78,'admin','ADM_001','EMP002','najo','2025-07-04 20:41:45',1),(79,'admin','ADM_001','EMP002','aka','2025-07-04 20:41:51',1),(80,'admin','ADM_001','EMP002','akka','2025-07-04 20:42:07',1),(81,'admin','ADM_001','EMP002','abkksjsjh','2025-07-04 20:47:40',1),(82,'admin','ADM_001','EMP002','njassld','2025-07-04 20:49:33',1);
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `monthly_target`
--

DROP TABLE IF EXISTS `monthly_target`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_target` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `revenue_target` int NOT NULL,
  `candidate_target` int NOT NULL,
  `assigned_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_monthly_target_employee_idx` (`employee_id`),
  KEY `fk_monthly_target_assigned_by_idx` (`assigned_by`),
  CONSTRAINT `fk_monthly_target_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `admins` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_monthly_target_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monthly_target`
--

LOCK TABLES `monthly_target` WRITE;
/*!40000 ALTER TABLE `monthly_target` DISABLE KEYS */;
INSERT INTO `monthly_target` VALUES (1,1,7000,5,1,'2026-02-22 15:11:49'),(2,2,10000,5,1,'2026-02-22 17:10:33'),(3,3,7500,0,1,'2026-02-22 18:13:17'),(4,4,5000,0,1,'2026-02-22 18:17:48'),(5,5,0,0,1,'2026-02-23 04:08:50'),(6,6,0,0,1,'2026-02-23 04:30:38'),(7,7,0,0,1,'2026-02-23 04:42:33'),(8,8,6000,0,1,'2026-02-23 04:56:23'),(9,2,10000,5,1,'2026-02-24 03:47:30'),(10,2,10000,4,1,'2026-02-28 14:33:29'),(12,2,10000,4,1,'2026-03-10 07:40:53'),(13,2,10000,4,1,'2026-03-27 13:16:35'),(14,2,10000,4,1,'2026-03-27 13:21:18'),(15,2,10000,4,1,'2026-03-27 13:23:58'),(16,2,10000,4,1,'2026-03-27 13:29:05'),(17,2,10000,4,1,'2026-03-27 13:37:18'),(18,2,10000,4,1,'2026-03-27 13:37:50'),(19,3,7500,5,1,'2026-03-27 13:38:36'),(20,10,5000,3,1,'2026-03-27 14:07:46');
/*!40000 ALTER TABLE `monthly_target` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payouts`
--

DROP TABLE IF EXISTS `payouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payouts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `employee_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `process_id` int NOT NULL,
  `payout_basis` enum('actual','fake') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payout_type` enum('Fix','Percentage') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_percentage` decimal(5,2) DEFAULT NULL COMMENT 'Employee percentage for payout calculation',
  `calculated_amount` decimal(10,2) NOT NULL,
  `joined_date` date NOT NULL,
  `clawback_start` date NOT NULL,
  `clawback_end` date NOT NULL,
  `invoice_start` date NOT NULL,
  `invoice_end` date NOT NULL,
  `status` enum('joined','clawback','invoice_clear','approved','completely_joined','dropout','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'clawback',
  `generated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clawback_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_candidate_payout` (`candidate_id`),
  KEY `idx_payout_candidate` (`candidate_id`),
  KEY `idx_payout_employee` (`employee_id`),
  KEY `idx_payout_process` (`process_id`),
  KEY `idx_payout_status` (`status`),
  KEY `idx_payout_dates` (`clawback_end`,`invoice_end`),
  CONSTRAINT `fk_payout_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payout_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payout_process` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Payouts table with workflow: clawback → invoice_clear → approved → completely_joined';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payouts`
--

LOCK TABLES `payouts` WRITE;
/*!40000 ALTER TABLE `payouts` DISABLE KEYS */;
INSERT INTO `payouts` VALUES (1,29,'EMP003',1,'fake','Fix',0.00,0.00,'2026-02-24','2026-02-24','2026-10-03','2026-10-04','2026-11-13','dropout','2026-02-24 07:15:42','2026-02-24 07:17:12','ADM001',NULL,NULL,'2026-02-26 11:58:11'),(2,13,'EMP002',1,'actual','Fix',0.00,0.00,'2026-02-24','2026-02-24','2026-10-03','2026-10-04','2026-11-13','approved','2026-02-26 08:03:27','2026-03-27 14:30:19','ADM001',NULL,'Reject Reason','2026-03-27 14:30:19'),(3,34,'EMP003',2,'fake','Percentage',0.00,0.00,'2026-02-24','2026-02-26','2026-10-23','2026-10-24','2027-06-02','completely_joined','2026-02-26 12:33:04','2026-03-27 12:34:36','ADM001',NULL,NULL,'2026-03-27 12:34:43'),(4,12,'EMP002',3,'actual','Percentage',0.00,0.00,'2026-02-24','2026-03-02','2026-03-25','2026-03-26','2026-11-20','completely_joined','2026-03-02 06:41:07','2026-03-02 06:41:36','ADM001',NULL,NULL,'2026-03-02 06:41:47'),(5,18,'EMP002',2,'actual','Percentage',0.00,0.00,'2026-03-02','2026-03-02','2026-03-25','2026-03-26','2026-11-20','approved','2026-03-02 06:54:26','2026-03-02 06:54:54','ADM001',NULL,NULL,'2026-03-02 06:54:54');
/*!40000 ALTER TABLE `payouts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `process_keywords`
--

DROP TABLE IF EXISTS `process_keywords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `process_keywords` (
  `id` int NOT NULL AUTO_INCREMENT,
  `process_id` int NOT NULL,
  `keyword` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `category` enum('skill','language','education','location','hiring_type') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_editable` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `process_id` (`process_id`),
  CONSTRAINT `process_keywords_ibfk_1` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `process_keywords`
--

LOCK TABLES `process_keywords` WRITE;
/*!40000 ALTER TABLE `process_keywords` DISABLE KEYS */;
/*!40000 ALTER TABLE `process_keywords` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `processes`
--

DROP TABLE IF EXISTS `processes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `processes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `process_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `process_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `hiring_type` enum('Fresher','Experienced','Combined') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `openings` int NOT NULL,
  `locations` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `requirements` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `salary` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `interview_dates` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `clawback_duration` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `invoice_clear_time` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `payout_type` enum('Fix','Percentage') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `payout_amount` decimal(10,2) NOT NULL,
  `real_payout_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('Active','Inactive','Completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Active',
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_process_client` (`client_id`),
  KEY `idx_process_status` (`status`),
  CONSTRAINT `processes_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `processes`
--

LOCK TABLES `processes` WRITE;
/*!40000 ALTER TABLE `processes` DISABLE KEYS */;
INSERT INTO `processes` VALUES (1,1,'Bharti axa renewal collection process','','Fresher',7,'Pune, Mumbai','Good communication skills, Basic computer knowledge','17000','07/05/2026','5','4','Fix',0.00,5000.00,'Active','2026-02-23 11:32:43','2026-02-23 11:32:43'),(2,1,'Business loan process','Develop and maintain enterprise applications','Experienced',10,'Ratnagiri','Strong negotiation skills','7500','07/05/2026','5','5','Percentage',800.00,850.00,'Active','2026-02-23 11:40:32','2026-02-23 11:40:32'),(3,3,'Customer Support Executive','Handle inbound and outbound customer queries','Fresher',10,'New York','Good communication skills, Basic computer knowledge','17000','07/05/2026','5','5','Percentage',4200.00,8000.00,'Active','2026-02-23 11:44:31','2026-03-10 12:24:37'),(4,2,'HRMS','abc','Experienced',6,'Bengaluru','MERN stack developer','25000','01/01/2026','5','5','Fix',0.00,7500.00,'Active','2026-02-23 11:51:12','2026-03-10 12:19:43');
/*!40000 ALTER TABLE `processes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resume_matches`
--

DROP TABLE IF EXISTS `resume_matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resume_matches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `process_id` int NOT NULL,
  `match_score` decimal(5,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `candidate_id` (`candidate_id`),
  KEY `process_id` (`process_id`),
  CONSTRAINT `resume_matches_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `resume_matches_ibfk_2` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resume_matches`
--

LOCK TABLES `resume_matches` WRITE;
/*!40000 ALTER TABLE `resume_matches` DISABLE KEYS */;
/*!40000 ALTER TABLE `resume_matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spocs`
--

DROP TABLE IF EXISTS `spocs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spocs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `process_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Active',
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_spoc_process` (`process_id`),
  KEY `idx_spoc_status` (`status`),
  CONSTRAINT `spocs_ibfk_1` FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spocs`
--

LOCK TABLES `spocs` WRITE;
/*!40000 ALTER TABLE `spocs` DISABLE KEYS */;
INSERT INTO `spocs` VALUES (1,1,'John Smith','1234567890','john.smith@example.com','HR Manager',NULL,'Active','2026-02-23 11:32:43','2026-02-23 11:32:43'),(2,2,'Michael Brown','3456789012','michael.brown@example.com','HR Executive',NULL,'Active','2026-02-23 11:40:32','2026-02-23 11:40:32'),(6,4,'Vinit','7860193619','vinit123@gmail.com','Human Resource Manager',NULL,'Active','2026-03-10 12:19:43','2026-03-10 12:19:43'),(8,3,'John Smith','1234567890','john.smith@example.com','HR Manager',NULL,'Active','2026-03-10 12:24:37','2026-03-10 12:24:37');
/*!40000 ALTER TABLE `spocs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_leader_broadcast_group_members`
--

DROP TABLE IF EXISTS `team_leader_broadcast_group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_leader_broadcast_group_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `employee_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_group_member` (`group_id`,`employee_id`),
  KEY `idx_group_id` (`group_id`),
  KEY `idx_employee_id` (`employee_id`),
  CONSTRAINT `team_leader_broadcast_group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `team_leader_broadcast_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_leader_broadcast_group_members_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_leader_broadcast_group_members`
--

LOCK TABLES `team_leader_broadcast_group_members` WRITE;
/*!40000 ALTER TABLE `team_leader_broadcast_group_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `team_leader_broadcast_group_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_leader_broadcast_groups`
--

DROP TABLE IF EXISTS `team_leader_broadcast_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_leader_broadcast_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_by_employee_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_created_by` (`created_by_employee_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `team_leader_broadcast_groups_ibfk_1` FOREIGN KEY (`created_by_employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_leader_broadcast_groups`
--

LOCK TABLES `team_leader_broadcast_groups` WRITE;
/*!40000 ALTER TABLE `team_leader_broadcast_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `team_leader_broadcast_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_leader_broadcast_message_recipients`
--

DROP TABLE IF EXISTS `team_leader_broadcast_message_recipients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_leader_broadcast_message_recipients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `broadcast_message_id` int NOT NULL,
  `recipient_employee_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_recipient_message` (`broadcast_message_id`,`recipient_employee_id`),
  KEY `idx_broadcast_message` (`broadcast_message_id`),
  KEY `idx_recipient` (`recipient_employee_id`),
  KEY `idx_read_status` (`is_read`),
  CONSTRAINT `team_leader_broadcast_message_recipients_ibfk_1` FOREIGN KEY (`broadcast_message_id`) REFERENCES `team_leader_broadcast_messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_leader_broadcast_message_recipients_ibfk_2` FOREIGN KEY (`recipient_employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_leader_broadcast_message_recipients`
--

LOCK TABLES `team_leader_broadcast_message_recipients` WRITE;
/*!40000 ALTER TABLE `team_leader_broadcast_message_recipients` DISABLE KEYS */;
/*!40000 ALTER TABLE `team_leader_broadcast_message_recipients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_leader_broadcast_messages`
--

DROP TABLE IF EXISTS `team_leader_broadcast_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_leader_broadcast_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `sender_employee_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_group_id` (`group_id`),
  KEY `idx_sender` (`sender_employee_id`),
  KEY `idx_sent_at` (`sent_at`),
  CONSTRAINT `team_leader_broadcast_messages_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `team_leader_broadcast_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_leader_broadcast_messages_ibfk_2` FOREIGN KEY (`sender_employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_leader_broadcast_messages`
--

LOCK TABLES `team_leader_broadcast_messages` WRITE;
/*!40000 ALTER TABLE `team_leader_broadcast_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `team_leader_broadcast_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `team_employee_unique` (`team_id`,`employee_id`),
  KEY `team_id` (`team_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `team_members_employee_fk` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_members_team_fk` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_members`
--

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
INSERT INTO `team_members` VALUES (9,3,2,'2026-02-23 07:09:39'),(10,4,3,'2026-02-23 07:10:18'),(11,5,2,'2026-02-23 07:12:22'),(12,5,3,'2026-02-23 07:12:22');
/*!40000 ALTER TABLE `team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_messages`
--

DROP TABLE IF EXISTS `team_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_type` enum('team_leader','team_member') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_sender` (`sender_type`,`sender_id`),
  KEY `idx_receiver` (`receiver_id`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_conversation` (`sender_id`,`receiver_id`,`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_messages`
--

LOCK TABLES `team_messages` WRITE;
/*!40000 ALTER TABLE `team_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `team_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `team_type` enum('salaryemp','employee','freelancer') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `destination` enum('core','team_leader','manager') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `leader_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `leader_id` (`leader_id`),
  CONSTRAINT `teams_leader_fk` FOREIGN KEY (`leader_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (3,'Alpha Sales Team','salaryemp','team_leader',3,'2026-02-23 07:05:23','2026-02-23 07:09:39'),(4,'Marketing Leaders','employee','team_leader',2,'2026-02-23 07:10:18','2026-02-23 07:10:18'),(5,'Freelance Ops Squad','freelancer','manager',3,'2026-02-23 07:12:22','2026-02-23 07:12:22');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `candidates_available_for_assignment`
--

/*!50001 DROP VIEW IF EXISTS `candidates_available_for_assignment`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `candidates_available_for_assignment` AS select `cd`.`id` AS `id`,`cd`.`full_name` AS `full_name`,`cd`.`mobile_no` AS `mobile_no`,`cd`.`email_id` AS `email_id`,`cd`.`experience_level` AS `experience_level`,`cd`.`city` AS `city`,`cd`.`job_title` AS `job_title`,`dt`.`type_name` AS `type_name`,`dt`.`id` AS `data_type_id`,(case when (`ea`.`id` is not null) then 'Assigned' when (`aq`.`id` is not null) then 'In Queue' else 'Available' end) AS `assignment_status` from (((`candidates_data` `cd` left join `data_types` `dt` on((`cd`.`type_id` = `dt`.`id`))) left join `employee_assignments` `ea` on(((`cd`.`id` = `ea`.`candidate_id`) and (`ea`.`status` in ('assigned','in_progress'))))) left join `assignment_queue` `aq` on((`cd`.`id` = `aq`.`candidate_id`))) where (`dt`.`is_active` = 1) order by `cd`.`created_at` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `employee_assignment_summary`
--

/*!50001 DROP VIEW IF EXISTS `employee_assignment_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `employee_assignment_summary` AS select `e`.`employee_id` AS `employee_id`,`e`.`full_name` AS `full_name`,`e`.`designation` AS `designation`,`dt`.`type_name` AS `type_name`,`dt`.`employee_view_limit` AS `employee_view_limit`,coalesce(`ew`.`assigned_count`,0) AS `current_assigned`,coalesce(`ew`.`completed_count`,0) AS `total_completed`,coalesce(`ew`.`dropped_count`,0) AS `total_dropped`,coalesce(`ew`.`passed_count`,0) AS `total_passed`,coalesce(`ew`.`total_ring_count`,0) AS `total_rings`,(`dt`.`employee_view_limit` - coalesce(`ew`.`assigned_count`,0)) AS `available_slots`,`ew`.`last_assignment_date` AS `last_assignment_date` from ((`employees` `e` join `data_types` `dt`) left join `employee_workload` `ew` on(((`e`.`employee_id` = `ew`.`employee_id`) and (`dt`.`id` = `ew`.`data_type_id`)))) where ((`e`.`status` = 'active') and (`dt`.`is_active` = 1)) order by `e`.`employee_id`,`dt`.`type_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-08 15:57:22
