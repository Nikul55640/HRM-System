#!/usr/bin/env node

/**
 * Batch fix for role standardization
 * This script fixes the most common patterns in critical files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Critical files that need immediate fixing
const criticalFiles = [
  'src/services/admin/systemPolicy.service.js',
  'src/services/admin/leaveBalance.service.js',
  'src/controllers/admin/emailConfig.controller.js',
  'src/controllers/admin/employeeManagement.controller.js',
  'src/config/rolePermissions.js'
];

function batchFixFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Pattern 1: Fix simple role checks with ROLES constants
  const simpleRolePattern = /(\s+)(\/\/.*[Oo]nly.*can.*\n\s*)(if\s*\(\s*user\.role\s*[!=]==?\s*ROLES\.)/g;
  content = content.replace(simpleRolePattern, (match, indent, comment, ifStatement) => {
    modified = true;
    return `${indent}${comment}const userSystemRole = user.systemRole || user.role;\n${indent}${ifStatement.replace('user.role', 'userSystemRole')}`;
  });

  // Pattern 2: Fix req.user.role in controllers
  const reqRolePattern = /(\s+)(\/\/.*[Oo]nly.*can.*\n\s*)(if\s*\(\s*req\.user\.role\s*[!=]==?\s*ROLES\.)/g;
  content = content.replace(reqRolePattern, (match, indent, comment, ifStatement) => {
    modified = true;
    return `${indent}${comment}const userSystemRole = req.user.systemRole || req.user.role;\n${indent}${ifStatement.replace('req.user.role', 'userSystemRole')}`;
  });

  // Pattern 3: Fix remaining user.role comparisons
  content = content.replace(/user\.role\s*([!=]==?)\s*ROLES\./g, (match, operator) => {
    modified = true;
    return `userSystemRole ${operator} ROLES.`;
  });

  // Pattern 4: Fix remaining req.user.role comparisons
  content = content.replace(/req\.user\.role\s*([!=]==?)\s*ROLES\./g, (match, operator) => {
    modified = true;
    return `userSystemRole ${operator} ROLES.`;
  });

  // Pattern 5: Fix role checks in rolePermissions.js
  if (filePath.includes('rolePermissions.js')) {
    content = content.replace(/user\.role\s*===/g, 'user.systemRole ===');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`⚪ No changes needed: ${filePath}`);
  }
}

console.log('🔧 Starting batch role standardization fix...\n');

criticalFiles.forEach(batchFixFile);

console.log('\n✅ Batch role standardization fix completed!');