-- MySQL dump 10.13  Distrib 26.7.0, for Win64 (x86_64)
--
-- Host: localhost    Database: resolvex
-- ------------------------------------------------------
-- Server version	26.7.0

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'ba39ee62-a6d2-11f1-b121-0a0027000003:1-124';

--
-- Current Database: `resolvex`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `resolvex` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `resolvex`;

--
-- Table structure for table `complaint_categories`
--

DROP TABLE IF EXISTS `complaint_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKcws63jrferlotywajrvv2qpcp` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint_categories`
--

LOCK TABLES `complaint_categories` WRITE;
/*!40000 ALTER TABLE `complaint_categories` DISABLE KEYS */;
INSERT INTO `complaint_categories` VALUES (1,_binary '','2026-09-18 22:55:14.160039','Wi-Fi, internet, computer systems and network issues.','IT / Network','2026-09-18 22:55:14.160039'),(2,_binary '','2026-09-18 22:55:14.206464','Lights, fans, switches and other electrical problems.','Electrical','2026-09-18 22:55:14.206464'),(3,_binary '','2026-09-18 22:55:14.219470','Pipes, taps, leakage and washroom plumbing problems.','Plumbing','2026-09-18 22:55:14.219470'),(4,_binary '','2026-09-18 22:55:14.227464','Cleaning, waste disposal and hygiene related issues.','Cleanliness','2026-09-18 22:55:14.227464'),(5,_binary '','2026-09-18 22:55:14.237654','Hostel rooms, facilities and accommodation related complaints.','Hostel','2026-09-18 22:55:14.237654'),(6,_binary '','2026-09-18 22:55:14.243653','Classroom furniture, equipment and facility issues.','Classroom','2026-09-18 22:55:14.243653'),(7,_binary '','2026-09-18 22:55:14.253821','Building, road, furniture and campus infrastructure problems.','Infrastructure','2026-09-18 22:55:14.253821'),(8,_binary '','2026-09-18 22:55:14.260818','Drinking water and campus water supply problems.','Water Supply','2026-09-18 22:55:14.260818'),(9,_binary '','2026-09-18 22:55:14.270240','Campus security, access and safety related issues.','Security','2026-09-18 22:55:14.270240'),(10,_binary '','2026-09-18 22:55:14.279241','Complaints that do not belong to another available category.','Other','2026-09-18 22:55:14.279241');
/*!40000 ALTER TABLE `complaint_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaints`
--

DROP TABLE IF EXISTS `complaints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaints` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(100) NOT NULL,
  `complaint_code` varchar(30) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` text NOT NULL,
  `location` varchar(200) NOT NULL,
  `priority` varchar(30) NOT NULL,
  `resolution_note` text,
  `resolved_at` datetime(6) DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  `title` varchar(200) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  `assigned_user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_complaint_code` (`complaint_code`),
  KEY `FK83j5gqkd7ku4vc908g4rtmglr` (`user_id`),
  KEY `FKcfn0c12eahvqxbtk3o7po94i4` (`assigned_user_id`),
  CONSTRAINT `FK83j5gqkd7ku4vc908g4rtmglr` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKcfn0c12eahvqxbtk3o7po94i4` FOREIGN KEY (`assigned_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaints`
--

LOCK TABLES `complaints` WRITE;
/*!40000 ALTER TABLE `complaints` DISABLE KEYS */;
INSERT INTO `complaints` VALUES (1,'IT & Network','SU-CMP-67788A28','2026-09-17 18:43:17.702452','The WiFi connection is not working properly in the AI & DS laboratory.','AI & DS Lab','HIGH',NULL,NULL,'OPEN','WiFi not working in AI Lab','2026-09-17 18:43:17.702452',2,NULL),(2,'Classroom & Lab','SU-CMP-50B92DEA','2026-09-17 19:01:45.525611','solve the problem fastly','Dept of AIDS','URGENT',NULL,NULL,'OPEN','Wifi not working','2026-09-17 19:01:45.525611',4,NULL),(3,'Classroom','SU-CMP-8301A437','2026-09-19 10:28:08.999122','please give the best girls for hackthon team','Dept of AIDS','URGENT',NULL,NULL,'OPEN','required girls for SIH project','2026-09-19 10:28:08.999122',4,NULL);
/*!40000 ALTER TABLE `complaints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `complaint_id` bigint DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `message` text NOT NULL,
  `is_read` bit(1) NOT NULL,
  `title` varchar(150) NOT NULL,
  `type` varchar(30) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9y21adhxn0ayjhfocscqox7bh` (`user_id`),
  CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,3,'2026-09-19 10:28:09.637978','Your complaint SU-CMP-8301A437 has been submitted successfully.',_binary '\0','Complaint Submitted','SUCCESS',4);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `name` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` varchar(30) NOT NULL,
  `active` bit(1) NOT NULL,
  `department` varchar(150) DEFAULT NULL,
  `program` varchar(150) DEFAULT NULL,
  `university_id` varchar(50) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `academic_year` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `uk_users_email` (`email`),
  UNIQUE KEY `uk_users_university_id` (`university_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'2026-09-15 13:02:26.137941','testuser@gmail.com','Test User','$2a$10$W3cdNBX0RpJhGZcL2Nnx8ug28M2BjU9oh6Uff6Dw/Vzfmc3ApLiJG','9876543210','USER',_binary '\0',NULL,NULL,'',NULL,NULL),(2,'2026-09-17 07:32:09.705791','teststudent@resolvex.com','Test Student','$2a$10$oUPNx3QK/J0RtEiUUW/vsuJc55wWMhVVbG0g5QsAA7jIxFsf8fbI6','9876543210','STUDENT',_binary '','Artificial Intelligence and Data Science','B.Tech AI & DS','SU2026TEST001','2026-09-17 07:32:09.705791','Second Year'),(3,'2026-09-17 07:56:44.845913','harshadahire77@gmail.com','Harshad Ahire','$2a$10$h5Fr0WFOSyg3XFe4OQSmheW5kK5HvM5eN.9nwA5Z.3eok3v3KUS3C','08657873118','ADMIN',_binary '','AIDS','BTech AIDS','2576','2026-09-17 07:56:44.845913','Second Year'),(4,'2026-09-17 19:00:37.581215','harshadahire0515@gmail.com','Harshad Ahire','$2a$10$sKkhFiN3nDp7/jHrtPx8c.y3K2MSSK2FzQ6yEAN4wd5nR7waq4n5a','08657873118','STUDENT',_binary '','CSE','BTech CSE','2549','2026-09-17 19:00:37.581215','Third Year'),(5,'2026-09-18 12:54:22.253909','suyash.6011@gmail.com','Suyash Sonawane','$2a$10$Z54IdmwkJbvjX.bPQZRw4ecvgVLGNkA.dCy5SE8nBycV38OzkA/5u','9168516011','STUDENT',_binary '','AIDS','B.Tech AI & DS','2541','2026-09-18 12:54:22.253909','Second Year');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'resolvex'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-19 11:07:59
