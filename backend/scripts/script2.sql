-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: hrms_dev
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `announcement`
--

DROP TABLE IF EXISTS `announcement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcement` (
                                `announcement_id` int NOT NULL AUTO_INCREMENT,
                                `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                                `description` tinytext COLLATE utf8mb4_unicode_ci NOT NULL,
                                `status` enum('DRAFT','PUBLISHED','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL,
                                `current_version` int NOT NULL DEFAULT '1',
                                `created_by` int NOT NULL,
                                `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                `published_by` int DEFAULT NULL,
                                `published_date` datetime DEFAULT NULL,
                                PRIMARY KEY (`announcement_id`),
                                KEY `fk_ann_created_by` (`created_by`),
                                KEY `fk_ann_published_by` (`published_by`),
                                CONSTRAINT `fk_ann_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_auth` (`user_id`),
                                CONSTRAINT `fk_ann_published_by` FOREIGN KEY (`published_by`) REFERENCES `user_auth` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcement`
--

LOCK TABLES `announcement` WRITE;
/*!40000 ALTER TABLE `announcement` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcement_version`
--

DROP TABLE IF EXISTS `announcement_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcement_version` (
                                        `version_id` int NOT NULL AUTO_INCREMENT,
                                        `announcement_id` int NOT NULL,
                                        `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                                        `description` tinytext COLLATE utf8mb4_unicode_ci NOT NULL,
                                        `edited_by` int NOT NULL,
                                        `edited_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                        PRIMARY KEY (`version_id`),
                                        KEY `fk_ver_ann` (`announcement_id`),
                                        KEY `fk_ver_editor` (`edited_by`),
                                        CONSTRAINT `fk_ver_ann` FOREIGN KEY (`announcement_id`) REFERENCES `announcement` (`announcement_id`),
                                        CONSTRAINT `fk_ver_editor` FOREIGN KEY (`edited_by`) REFERENCES `user_auth` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcement_version`
--

LOCK TABLES `announcement_version` WRITE;
/*!40000 ALTER TABLE `announcement_version` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcement_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_event`
--

DROP TABLE IF EXISTS `attendance_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_event` (
                                    `event_id` int NOT NULL AUTO_INCREMENT,
                                    `employee_id` int NOT NULL,
                                    `event_type` enum('CHECK_IN','CHECK_OUT','BREAK_OUT','BREAK_IN','MANUAL') COLLATE utf8mb4_unicode_ci NOT NULL,
                                    `evt_ts` datetime NOT NULL,
                                    `evt_date` date NOT NULL,
                                    PRIMARY KEY (`event_id`),
                                    KEY `fk_att_emp` (`employee_id`),
                                    CONSTRAINT `fk_att_emp` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_event`
--

LOCK TABLES `attendance_event` WRITE;
/*!40000 ALTER TABLE `attendance_event` DISABLE KEYS */;
INSERT INTO `attendance_event` (`event_id`, `employee_id`, `event_type`, `evt_ts`, `evt_date`) VALUES (1,14,'CHECK_IN','2025-07-24 12:04:51','2025-07-24'),(2,14,'BREAK_OUT','2025-07-24 12:07:04','2025-07-24'),(3,14,'BREAK_IN','2025-07-24 12:07:39','2025-07-24'),(4,14,'CHECK_OUT','2025-07-24 12:08:08','2025-07-24');
/*!40000 ALTER TABLE `attendance_event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
                            `employee_id` int NOT NULL,
                            `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                            `contact` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                            `job_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                            `hire_date` date DEFAULT NULL,
                            `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                            `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                            PRIMARY KEY (`employee_id`),
                            CONSTRAINT `fk_emp_user` FOREIGN KEY (`employee_id`) REFERENCES `user_auth` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` (`employee_id`, `name`, `contact`, `job_title`, `hire_date`, `address`, `email`) VALUES (14,'Alice Perera','0711255555','Lecturer','2025-07-23','Kandy','alice1@corp.com');
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
                                         `installed_rank` int NOT NULL,
                                         `version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                                         `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                                         `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                                         `script` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                                         `checksum` int DEFAULT NULL,
                                         `installed_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                                         `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                         `execution_time` int NOT NULL,
                                         `success` tinyint(1) NOT NULL,
                                         PRIMARY KEY (`installed_rank`),
                                         KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_opening`
--

DROP TABLE IF EXISTS `job_opening`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_opening` (
                               `id` bigint NOT NULL AUTO_INCREMENT,
                               `active` bit(1) NOT NULL,
                               `department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                               `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                               `posted_date` date DEFAULT NULL,
                               `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                               PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_opening`
--

LOCK TABLES `job_opening` WRITE;
/*!40000 ALTER TABLE `job_opening` DISABLE KEYS */;
INSERT INTO `job_opening` (`id`, `active`, `department`, `description`, `posted_date`, `title`) VALUES (1,_binary '\0','Computer Science','ML','2025-08-06','Senior Lecture'),(2,_binary '\0','Computer Science','ML','2025-08-07','Lecture'),(3,_binary '\0','Computer Science','Software Engineering','2025-08-07','Lecture'),(4,_binary '\0','Computer Science','ML','2025-08-08','Lecturer');
/*!40000 ALTER TABLE `job_opening` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_application`
--

DROP TABLE IF EXISTS `leave_application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_application` (
                                     `leave_id` int NOT NULL AUTO_INCREMENT,
                                     `employee_id` int NOT NULL,
                                     `leave_type` enum('ANNUAL','SICK','CASUAL') COLLATE utf8mb4_unicode_ci NOT NULL,
                                     `start_date` date NOT NULL,
                                     `end_date` date NOT NULL,
                                     `status` enum('PENDING','APPROVED','REJECTED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL,
                                     `reason` text COLLATE utf8mb4_unicode_ci,
                                     `medical_doc_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                                     `requested_at` datetime NOT NULL,
                                     `decided_at` datetime DEFAULT NULL,
                                     `decided_by` int DEFAULT NULL,
                                     PRIMARY KEY (`leave_id`),
                                     KEY `fk_leave_emp` (`employee_id`),
                                     CONSTRAINT `fk_leave_emp` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_application`
--

LOCK TABLES `leave_application` WRITE;
/*!40000 ALTER TABLE `leave_application` DISABLE KEYS */;
INSERT INTO `leave_application` (`leave_id`, `employee_id`, `leave_type`, `start_date`, `end_date`, `status`, `reason`, `medical_doc_url`, `requested_at`, `decided_at`, `decided_by`) VALUES (1,14,'ANNUAL','2025-08-12','2025-08-14','APPROVED','Family trip',NULL,'2025-07-25 15:10:38','2025-07-25 15:28:49',2),(2,14,'CASUAL','2025-08-12','2025-08-14','APPROVED','Family trip',NULL,'2025-07-25 15:30:09','2025-07-25 15:30:36',2),(3,14,'CASUAL','2025-08-12','2025-08-14','APPROVED','Family trip',NULL,'2025-07-31 11:26:35','2025-07-31 11:32:19',2);
/*!40000 ALTER TABLE `leave_application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_balance`
--

DROP TABLE IF EXISTS `leave_balance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_balance` (
                                 `balance_id` int NOT NULL AUTO_INCREMENT,
                                 `employee_id` int NOT NULL,
                                 `leave_type` enum('ANNUAL','SICK','CASUAL') COLLATE utf8mb4_unicode_ci NOT NULL,
                                 `year` int NOT NULL,
                                 `entitled` int NOT NULL,
                                 `taken` int NOT NULL,
                                 PRIMARY KEY (`balance_id`),
                                 UNIQUE KEY `uk_balance` (`employee_id`,`leave_type`,`year`),
                                 UNIQUE KEY `UK61c3n1y5cq2a8ph8uj21ynou4` (`employee_id`,`leave_type`,`year`),
                                 CONSTRAINT `fk_bal_emp` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_balance`
--

LOCK TABLES `leave_balance` WRITE;
/*!40000 ALTER TABLE `leave_balance` DISABLE KEYS */;
INSERT INTO `leave_balance` (`balance_id`, `employee_id`, `leave_type`, `year`, `entitled`, `taken`) VALUES (3,14,'ANNUAL',2025,14,3),(4,14,'SICK',2025,14,0),(5,14,'CASUAL',2025,7,6);
/*!40000 ALTER TABLE `leave_balance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `policy`
--

DROP TABLE IF EXISTS `policy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `policy` (
                          `policy_id` int NOT NULL AUTO_INCREMENT,
                          `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                          `description` tinytext COLLATE utf8mb4_unicode_ci NOT NULL,
                          `effective_date` date NOT NULL,
                          `status` enum('PENDING','APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL,
                          `created_by` int NOT NULL,
                          `decided_by` int DEFAULT NULL,
                          `decided_at` datetime DEFAULT NULL,
                          `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          PRIMARY KEY (`policy_id`),
                          KEY `fk_policy_created_by` (`created_by`),
                          KEY `fk_policy_decided_by` (`decided_by`),
                          CONSTRAINT `fk_policy_created_by` FOREIGN KEY (`created_by`) REFERENCES `user_auth` (`user_id`),
                          CONSTRAINT `fk_policy_decided_by` FOREIGN KEY (`decided_by`) REFERENCES `user_auth` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `policy`
--

LOCK TABLES `policy` WRITE;
/*!40000 ALTER TABLE `policy` DISABLE KEYS */;
/*!40000 ALTER TABLE `policy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
                        `role_id` int NOT NULL AUTO_INCREMENT,
                        `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                        PRIMARY KEY (`role_id`),
                        UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` (`role_id`, `code`) VALUES (3,'ADMIN'),(4,'DIRECTOR'),(1,'EMPLOYEE'),(2,'HR');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_slip`
--

DROP TABLE IF EXISTS `salary_slip`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salary_slip` (
                               `slip_id` int NOT NULL AUTO_INCREMENT,
                               `employee_id` int NOT NULL,
                               `period_year` int NOT NULL,
                               `period_month` int NOT NULL,
                               `basic_pay` decimal(38,2) DEFAULT NULL,
                               `allowances` decimal(38,2) DEFAULT NULL,
                               `deductions` decimal(38,2) DEFAULT NULL,
                               `net_pay` decimal(38,2) DEFAULT NULL,
                               `pdf_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                               `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
                               PRIMARY KEY (`slip_id`),
                               UNIQUE KEY `uk_slip` (`employee_id`,`period_year`,`period_month`),
                               CONSTRAINT `fk_slip_emp` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_slip`
--

LOCK TABLES `salary_slip` WRITE;
/*!40000 ALTER TABLE `salary_slip` DISABLE KEYS */;
INSERT INTO `salary_slip` (`slip_id`, `employee_id`, `period_year`, `period_month`, `basic_pay`, `allowances`, `deductions`, `net_pay`, `pdf_url`, `created_at`) VALUES (1,14,2025,7,125000.00,15000.00,9000.00,131000.00,NULL,'2025-07-24 16:15:46'),(2,14,2025,6,125000.00,15000.00,8800.00,131200.00,NULL,'2025-07-24 16:15:46');
/*!40000 ALTER TABLE `salary_slip` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_auth`
--

DROP TABLE IF EXISTS `user_auth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_auth` (
                             `user_id` int NOT NULL AUTO_INCREMENT,
                             `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                             `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
                             `active` tinyint(1) NOT NULL DEFAULT '1',
                             `verified` tinyint(1) NOT NULL DEFAULT '0',
                             `password_changed_at` datetime DEFAULT NULL,
                             PRIMARY KEY (`user_id`),
                             UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_auth`
--

LOCK TABLES `user_auth` WRITE;
/*!40000 ALTER TABLE `user_auth` DISABLE KEYS */;
INSERT INTO `user_auth` (`user_id`, `email`, `password`, `active`, `verified`, `password_changed_at`) VALUES (2,'admin@corp.com','$2a$10$6ZBGj1XUvEiwCbfC4uSyreYbYaSQrxRwsh/EpWD2qucAhdci4iJzO',1,1,NULL),(14,'alice1@corp.com','$2a$10$nBLDZh1FkAfdJGmYuMWkAuaN85HGQ8E8bk5qI7JMuwidBIemN7mp6',1,1,NULL);
/*!40000 ALTER TABLE `user_auth` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_role`
--

DROP TABLE IF EXISTS `user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role` (
                             `user_id` int NOT NULL,
                             `role_id` int NOT NULL,
                             PRIMARY KEY (`user_id`,`role_id`),
                             KEY `role_id` (`role_id`),
                             CONSTRAINT `user_role_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_auth` (`user_id`),
                             CONSTRAINT `user_role_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_role`
--

LOCK TABLES `user_role` WRITE;
/*!40000 ALTER TABLE `user_role` DISABLE KEYS */;
INSERT INTO `user_role` (`user_id`, `role_id`) VALUES (14,2),(2,3);
/*!40000 ALTER TABLE `user_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'hrms_dev'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-08 12:53:51
