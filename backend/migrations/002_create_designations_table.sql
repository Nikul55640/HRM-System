-- Create Designations Table Migration
-- This migration creates the designations table and updates employee table to reference it

-- Create designations table
CREATE TABLE IF NOT EXISTS `designations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text,
  `level` enum('intern','junior','mid','senior','lead','manager','director','vp','c_level') DEFAULT 'mid',
  `departmentId` int DEFAULT NULL,
  `requirements` json DEFAULT NULL,
  `responsibilities` json DEFAULT NULL,
  `salaryRange` json DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `employeeCount` int DEFAULT '0' COMMENT 'Number of employees with this designation',
  `createdBy` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_title_department` (`title`,`departmentId`),
  KEY `idx_department` (`departmentId`),
  KEY `idx_level` (`level`),
  KEY `idx_active` (`isActive`),
  CONSTRAINT `fk_designation_department` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_designation_created_by` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_designation_updated_by` FOREIGN KEY (`updatedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add designationId column to employees table if it doesn't exist
ALTER TABLE `employees` 
ADD COLUMN IF NOT EXISTS `designationId` int DEFAULT NULL,
ADD CONSTRAINT `fk_employee_designation` FOREIGN KEY (`designationId`) REFERENCES `designations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Add departmentId column to employees table if it doesn't exist
ALTER TABLE `employees` 
ADD COLUMN IF NOT EXISTS `departmentId` int DEFAULT NULL,
ADD CONSTRAINT `fk_employee_department` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Create some default designations for common departments
INSERT IGNORE INTO `designations` (`title`, `description`, `level`, `departmentId`, `requirements`, `responsibilities`, `isActive`, `employeeCount`, `createdAt`, `updatedAt`) VALUES
('Software Engineer', 'Develops and maintains software applications', 'mid', 1, '["Bachelor\'s degree in Computer Science", "2+ years experience"]', '["Write clean code", "Participate in code reviews", "Debug issues"]', 1, 0, NOW(), NOW()),
('Senior Software Engineer', 'Senior level software development role', 'senior', 1, '["Bachelor\'s degree in Computer Science", "5+ years experience"]', '["Lead technical projects", "Mentor junior developers", "Architecture decisions"]', 1, 0, NOW(), NOW()),
('HR Manager', 'Manages human resources operations', 'manager', 2, '["Bachelor\'s degree in HR", "3+ years HR experience"]', '["Manage recruitment", "Handle employee relations", "Policy implementation"]', 1, 0, NOW(), NOW()),
('Marketing Specialist', 'Handles marketing campaigns and strategies', 'mid', 3, '["Bachelor\'s degree in Marketing", "2+ years experience"]', '["Create marketing campaigns", "Analyze market trends", "Manage social media"]', 1, 0, NOW(), NOW());

-- Update existing employees to link with departments and designations where possible
-- This is a basic mapping - you may need to adjust based on your actual data
UPDATE `employees` e 
LEFT JOIN `departments` d ON e.department = d.name 
SET e.departmentId = d.id 
WHERE d.id IS NOT NULL AND e.departmentId IS NULL;

-- Update designation counts based on existing employees
UPDATE `designations` d 
SET d.employeeCount = (
  SELECT COUNT(*) 
  FROM `employees` e 
  WHERE e.designationId = d.id AND e.status = 'Active'
) 
WHERE d.id IS NOT NULL;