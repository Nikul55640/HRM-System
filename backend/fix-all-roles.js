#!/usr/bin/env node

/**
 * Comprehensive Role Standardization Fix Script
 * This script fixes all remaining user.role references to use user.systemRole
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files that need fixing based on search results
const filesToFix = [
  'src/services/admin/designation.service.js',
  'src/services/admin/systemPolicy.service.js', 
  'src/services/admin/leaveBalance.service.js',
  'src/controllers/admin/emailConfig.controller.js',
  'src/controllers/admin/employeeManagement.controller.js',
  'src/controllers/admin/liveAttendance.controller.js',
  'src/controllers/admin/attendanceManagement.controller.js',
  'src/controllers/admin/user.controller.js',
  'src/controllers/admin/department.controller.js',
  'src/controllers/admin/shift.controller.js',
  'src/controllers/admin/holiday.controller.js',
  'src/controllers/admin/lead.controller.js',
  'src/controllers/employee/attendanceSelf.controller.js',
  'src/controllers/employee/leaveRequest.controller.js',
  'src/controllers/employee/profile.controller.js',
  'src/services/user.service.js',
  'src/config/rolePermissions.js'
];

function fixRoleChecks(content) {
  let modified = false;
  
  // Pattern 1: Fix role comparisons with ROLES constants
  const roleComparisonPattern = /(\s+)(\/\/.*role.*\n\s*)(if\s*\(\s*user\.role\s*[!=]==?\s*ROLES\.)/gi;
  const newContent1 = content.replace(roleComparisonPattern, (match, indent, comment, ifStatement) => {
    modified = true;
    return `${indent}${comment}const userSystemRole = user.systemRole || user.role;\n${indent}${ifStatement.replace('user.role', 'userSystemRole')}`;
  });
  
  // Pattern 2: Fix standalone role comparisons
  const standalonePattern = /user\.role\s*([!=]==?)\s*ROLES\./g;
  const newContent2 = newContent1.replace(standalonePattern, (match, operator) => {
    modified = true;
    return `userSystemRole ${operator} ROLES.`;
  });
  
  // Pattern 3: Fix req.user.role in controllers
  const reqUserPattern = /(\s+)(\/\/.*role.*\n\s*)(if\s*\(\s*req\.user\.role\s*[!=]==?\s*ROLES\.)/gi;
  const newContent3 = newContent2.replace(reqUserPattern, (match, indent, comment, ifStatement) => {
    modified = true;
    return `${indent}${comment}const userSystemRole = req.user.systemRole || req.user.role;\n${indent}${ifStatement.replace('req.user.role', 'userSystemRole')}`;
  });
  
  // Pattern 4: Fix standalone req.user.role comparisons
  const reqStandalonePattern = /req\.user\.role\s*([!=]==?)\s*ROLES\./g;
  const newContent4 = newContent3.replace(reqStandalonePattern, (match, operator) => {
    modified = true;
    return `userSystemRole ${operator} ROLES.`;
  });
  
  return { content: newContent4, modified };
}

function processFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  const originalContent = fs.readFileSync(fullPath, 'utf8');
  const { content: newContent, modified } = fixRoleChecks(originalContent);
  
  if (modified) {
    fs.writeFileSync(fullPath, newContent);
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`⚪ No changes needed: ${filePath}`);
  }
}

console.log('🔧 Starting comprehensive role standardization fix...\n');

filesToFix.forEach(processFile);

console.log('\n✅ Comprehensive role standardization fix completed!');
console.log('\n📝 Manual review still needed for:');
console.log('- Complex conditional logic');
console.log('- Ternary operators with role checks');
console.log('- Role checks in template literals');
console.log('- Route middleware using old role strings');