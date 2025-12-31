-- Migration: Create Departments and Designations tables
-- Date: 2024-12-31
-- Description: Create proper department and designation management tables

-- Create Departments table
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  code VARCHAR(10) UNIQUE,
  managerId INT,
  parentDepartmentId INT,
  budget DECIMAL(15, 2),
  location VARCHAR(255),
  costCenter VARCHAR(255),
  isActive BOOLEAN DEFAULT TRUE,
  employeeCount INT DEFAULT 0,
  createdBy INT,
  updatedBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_departments_name (name),
  INDEX idx_departments_code (code),
  INDEX idx_departments_manager (managerId),
  INDEX idx_departments_parent (parentDepartmentId),
  INDEX idx_departments_active (isActive)
);

-- Create Designations table
CREATE TABLE IF NOT EXISTS designations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  departmentId INT,
  level ENUM('intern', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive') DEFAULT 'junior',
  minSalary DECIMAL(10, 2),
  maxSalary DECIMAL(10, 2),
  responsibilities JSON,
  requirements JSON,
  skills JSON,
  isActive BOOLEAN DEFAULT TRUE,
  employeeCount INT DEFAULT 0,
  createdBy INT,
  updatedBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_designations_title (title),
  INDEX idx_designations_department (departmentId),
  INDEX idx_designations_level (level),
  INDEX idx_designations_active (isActive),
  
  FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE SET NULL
);

-- Update Users table to include new roles
ALTER TABLE users 
MODIFY COLUMN role ENUM('SuperAdmin', 'HR Administrator', 'HR Manager', 'Payroll Officer', 'Manager', 'Employee') DEFAULT 'Employee';

-- Update Employees table to include designation and department relationships
ALTER TABLE employees 
ADD COLUMN designationId INT AFTER reportingManager,
ADD COLUMN departmentId INT AFTER designationId,
ADD COLUMN salary DECIMAL(10, 2) AFTER departmentId,
ADD COLUMN currency VARCHAR(3) DEFAULT 'USD' AFTER salary;

-- Add indexes for new employee fields
ALTER TABLE employees 
ADD INDEX idx_employees_designation (designationId),
ADD INDEX idx_employees_department_new (departmentId);

-- Add foreign key constraints
ALTER TABLE employees 
ADD CONSTRAINT fk_employees_designation 
  FOREIGN KEY (designationId) REFERENCES designations(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_employees_department 
  FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_employees_manager 
  FOREIGN KEY (reportingManager) REFERENCES employees(id) ON DELETE SET NULL;

-- Add foreign key constraints for departments
ALTER TABLE departments 
ADD CONSTRAINT fk_departments_manager 
  FOREIGN KEY (managerId) REFERENCES employees(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_departments_parent 
  FOREIGN KEY (parentDepartmentId) REFERENCES departments(id) ON DELETE SET NULL;

-- Insert default departments
INSERT INTO departments (name, description, code, isActive) VALUES
('Human Resources', 'Manages employee relations, recruitment, and HR policies', 'HR', TRUE),
('Information Technology', 'Manages technology infrastructure and software development', 'IT', TRUE),
('Finance', 'Handles financial planning, accounting, and budgeting', 'FIN', TRUE),
('Marketing', 'Manages marketing campaigns, brand promotion, and customer acquisition', 'MKT', TRUE),
('Sales', 'Handles sales operations and customer relationships', 'SALES', TRUE),
('Operations', 'Manages day-to-day business operations and processes', 'OPS', TRUE),
('Customer Support', 'Provides customer service and technical support', 'CS', TRUE),
('Legal', 'Handles legal matters, compliance, and contracts', 'LEGAL', TRUE),
('Research & Development', 'Focuses on innovation and product development', 'RND', TRUE),
('Quality Assurance', 'Ensures product and service quality standards', 'QA', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert default designations
INSERT INTO designations (title, description, level, departmentId, isActive) VALUES
-- IT Designations
('Software Engineer', 'Develops and maintains software applications', 'mid', (SELECT id FROM departments WHERE code = 'IT'), TRUE),
('Senior Software Engineer', 'Senior developer with leadership responsibilities', 'senior', (SELECT id FROM departments WHERE code = 'IT'), TRUE),
('Tech Lead', 'Technical leadership and architecture decisions', 'lead', (SELECT id FROM departments WHERE code = 'IT'), TRUE),
('Engineering Manager', 'Manages engineering teams and projects', 'manager', (SELECT id FROM departments WHERE code = 'IT'), TRUE),
('DevOps Engineer', 'Manages deployment and infrastructure', 'mid', (SELECT id FROM departments WHERE code = 'IT'), TRUE),
('QA Engineer', 'Ensures software quality through testing', 'mid', (SELECT id FROM departments WHERE code = 'QA'), TRUE),

-- HR Designations
('HR Specialist', 'Handles HR operations and employee relations', 'mid', (SELECT id FROM departments WHERE code = 'HR'), TRUE),
('HR Manager', 'Manages HR department and policies', 'manager', (SELECT id FROM departments WHERE code = 'HR'), TRUE),
('Recruiter', 'Handles talent acquisition and recruitment', 'junior', (SELECT id FROM departments WHERE code = 'HR'), TRUE),
('HR Business Partner', 'Strategic HR support for business units', 'senior', (SELECT id FROM departments WHERE code = 'HR'), TRUE),

-- Finance Designations
('Accountant', 'Handles accounting and financial records', 'mid', (SELECT id FROM departments WHERE code = 'FIN'), TRUE),
('Financial Analyst', 'Analyzes financial data and trends', 'mid', (SELECT id FROM departments WHERE code = 'FIN'), TRUE),
('Finance Manager', 'Manages financial operations and planning', 'manager', (SELECT id FROM departments WHERE code = 'FIN'), TRUE),
('Controller', 'Oversees accounting and financial reporting', 'senior', (SELECT id FROM departments WHERE code = 'FIN'), TRUE),

-- Marketing Designations
('Marketing Specialist', 'Handles marketing campaigns and promotion', 'junior', (SELECT id FROM departments WHERE code = 'MKT'), TRUE),
('Digital Marketing Manager', 'Manages digital marketing strategies', 'manager', (SELECT id FROM departments WHERE code = 'MKT'), TRUE),
('Content Creator', 'Creates marketing content and materials', 'junior', (SELECT id FROM departments WHERE code = 'MKT'), TRUE),
('Brand Manager', 'Manages brand strategy and positioning', 'senior', (SELECT id FROM departments WHERE code = 'MKT'), TRUE),

-- Sales Designations
('Sales Representative', 'Handles sales and customer relationships', 'junior', (SELECT id FROM departments WHERE code = 'SALES'), TRUE),
('Sales Manager', 'Manages sales team and targets', 'manager', (SELECT id FROM departments WHERE code = 'SALES'), TRUE),
('Account Manager', 'Manages key client accounts', 'mid', (SELECT id FROM departments WHERE code = 'SALES'), TRUE),
('Business Development Manager', 'Identifies new business opportunities', 'senior', (SELECT id FROM departments WHERE code = 'SALES'), TRUE),

-- Operations Designations
('Operations Specialist', 'Handles operational processes', 'mid', (SELECT id FROM departments WHERE code = 'OPS'), TRUE),
('Operations Manager', 'Manages operational activities', 'manager', (SELECT id FROM departments WHERE code = 'OPS'), TRUE),
('Project Manager', 'Manages projects and deliverables', 'senior', (SELECT id FROM departments WHERE code = 'OPS'), TRUE),

-- Customer Support Designations
('Customer Support Representative', 'Provides customer service', 'junior', (SELECT id FROM departments WHERE code = 'CS'), TRUE),
('Customer Support Manager', 'Manages customer support team', 'manager', (SELECT id FROM departments WHERE code = 'CS'), TRUE),
('Technical Support Specialist', 'Provides technical customer support', 'mid', (SELECT id FROM departments WHERE code = 'CS'), TRUE)

ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Update employee count for departments and designations
UPDATE departments d 
SET employeeCount = (
  SELECT COUNT(*) 
  FROM employees e 
  WHERE e.departmentId = d.id
);

UPDATE designations des 
SET employeeCount = (
  SELECT COUNT(*) 
  FROM employees e 
  WHERE e.designationId = des.id
);