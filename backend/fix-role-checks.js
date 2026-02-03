#!/usr/bin/env node

/**
 * Script to fix all user.role references to use user.systemRole
 * This ensures proper role standardization across the backend
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to process
const filesToProcess = [
  'src/services/admin/employee.service.js',
  'src/services/admin/attendance.service.js',
  'src/services/admin/leaveBalance.service.js',
  'src/services/admin/designation.service.js',
  'src/services/admin/department.service.js',
  'src/services/admin/shift.service.js',
  'src/services/admin/holiday.service.js',
  'src/services/admin/lead.service.js',
  'src/services/user.service.js',
  'src/controllers/admin/liveAttendance.controller.js',
  'src/controllers/admin/attendanceManagement.controller.js',
  'src/controllers/admin/user.controller.js',
  'src/controllers/admin/employee.controller.js',
  'src/controllers/admin/department.controller.js',
  'src/controllers/admin/shift.controller.js',
  'src/controllers/admin/holiday.controller.js',
  'src/controllers/admin/lead.controller.js',
  'src/controllers/admin/leaveApproval.controller.js',
  'src/controllers/employee/attendanceSelf.controller.js',
  'src/controllers/employee/leaveRequest.controller.js',
  'src/controllers/employee/profile.controller.js',
];

// Patterns to fix
const patterns = [
  // Basic role comparisons
  {
    search: /if\s*\(\s*user\.role\s*(!==?|===?)\s*ROLES\./g,
    replace: (match) => {
      return match.replace('user.role', 'userSystemRole');
    }
  },
  {
    search: /user\.role\s*===\s*ROLES\./g,
    replace: (match) => {
      return match.replace('user.role', 'userSystemRole');
    }
  },
  {
    search: /user\.role\s*!==\s*ROLES\./g,
    replace: (match) => {
      return match.replace('user.role', 'userSystemRole');
    }
  },
  {
    search: /user\.role\s*==\s*ROLES\./g,
    replace: (match) => {
      return match.replace('user.role', 'userSystemRole');
    }
  },
  {
    search: /user\.role\s*!=\s*ROLES\./g,
    replace: (match) => {
      return match.replace('user.role', 'userSystemRole');
    }
  }
];

function processFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Check if file already has systemRole logic
  if (content.includes('const userSystemRole = user.systemRole || user.role;')) {
    console.log(`✅ ${filePath} - Already has systemRole logic`);
    return;
  }

  // Add systemRole declaration at the beginning of functions that need it
  const functionPatterns = [
    /(\s+)(try\s*{\s*\n\s*\/\/\s*Role-based access control\s*\n\s*if\s*\(\s*user\.role)/g,
    /(\s+)(\/\/\s*Role-based access control\s*\n\s*if\s*\(\s*user\.role)/g,
    /(\s+)(\/\/\s*Apply role-based filtering\s*\n\s*if\s*\(\s*user\.role)/g,
    /(\s+)(\/\/\s*Permission check\s*\n\s*if\s*\(\s*user\.role)/g,
  ];

  functionPatterns.forEach(pattern => {
    content = content.replace(pattern, (match, indent, rest) => {
      return `${indent}const userSystemRole = user.systemRole || user.role;\n${indent}${rest.replace('user.role', 'userSystemRole')}`;
    });
  });

  // Apply pattern replacements
  patterns.forEach(pattern => {
    const originalContent = content;
    content = content.replace(pattern.search, pattern.replace);
    if (content !== originalContent) {
      modified = true;
    }
  });

  // Additional specific replacements
  content = content.replace(/user\.role\s*===\s*ROLES\./g, 'userSystemRole === ROLES.');
  content = content.replace(/user\.role\s*!==\s*ROLES\./g, 'userSystemRole !== ROLES.');
  content = content.replace(/user\.role\s*==\s*ROLES\./g, 'userSystemRole === ROLES.');
  content = content.replace(/user\.role\s*!=\s*ROLES\./g, 'userSystemRole !== ROLES.');

  if (modified || content !== fs.readFileSync(fullPath, 'utf8')) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`⚪ No changes needed: ${filePath}`);
  }
}

console.log('🔧 Starting role standardization fix...\n');

filesToProcess.forEach(processFile);

console.log('\n✅ Role standardization fix completed!');
console.log('\n📝 Manual review needed for:');
console.log('- Complex conditional logic');
console.log('- Ternary operators with role checks');
console.log('- Role checks in template literals');