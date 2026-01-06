/**
 * Fix Role Names Script
 * Updates all route files to use the new normalized role names
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Role mapping from old to new
const roleMapping = {
  'SuperAdmin': 'SUPER_ADMIN',
  'HR Administrator': 'HR_ADMIN', 
  'HR Manager': 'HR_MANAGER',
  'HR': 'HR_ADMIN', // Generic HR maps to HR_ADMIN
  'Employee': 'EMPLOYEE'
};

// Function to recursively find all .js files in routes directory
function findRouteFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findRouteFiles(fullPath));
    } else if (item.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to update role names in a file
function updateRoleNames(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Replace role names in authorize() calls
  for (const [oldRole, newRole] of Object.entries(roleMapping)) {
    const patterns = [
      // Single quotes
      new RegExp(`'${oldRole}'`, 'g'),
      // Double quotes  
      new RegExp(`"${oldRole}"`, 'g'),
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, `"${newRole}"`);
        updated = true;
      }
    }
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${path.relative(__dirname, filePath)}`);
    return true;
  }
  
  return false;
}

// Main execution
async function fixRoleNames() {
  console.log('🚀 Starting Role Names Fix...\n');
  
  const routesDir = path.join(__dirname, 'src', 'routes');
  const routeFiles = findRouteFiles(routesDir);
  
  let updatedCount = 0;
  
  console.log(`Found ${routeFiles.length} route files to check:\n`);
  
  for (const filePath of routeFiles) {
    if (updateRoleNames(filePath)) {
      updatedCount++;
    }
  }
  
  console.log(`\n✅ Role Names Fix completed!`);
  console.log(`📊 Updated ${updatedCount} files`);
  console.log(`📋 Role Mapping Applied:`);
  
  for (const [oldRole, newRole] of Object.entries(roleMapping)) {
    console.log(`   "${oldRole}" → "${newRole}"`);
  }
  
  console.log(`\n🔧 Next Steps:`);
  console.log(`   1. Restart your backend server`);
  console.log(`   2. Test authentication with updated roles`);
  console.log(`   3. Update frontend role checks if needed`);
}

// Run the fix
fixRoleNames().catch(console.error);