import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Role mapping from new format back to old format
const roleReplacements = [
  { from: '"SUPER_ADMIN"', to: '"SuperAdmin"' },
  { from: "'SUPER_ADMIN'", to: "'SuperAdmin'" },
  { from: '"HR_ADMIN"', to: '"HR"' },
  { from: "'HR_ADMIN'", to: "'HR'" },
  { from: '"HR_MANAGER"', to: '"HR"' },
  { from: "'HR_MANAGER'", to: "'HR'" },
  { from: '"EMPLOYEE"', to: '"Employee"' },
  { from: "'EMPLOYEE'", to: "'Employee'" },
];

// Function to recursively find all .js files in a directory
function findJSFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git', 'logs', 'uploads', 'tests'].includes(file)) {
          findJSFiles(filePath, fileList);
        }
      } else if (file.endsWith('.js') && !file.includes('test') && !file.includes('spec')) {
        fileList.push(filePath);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return fileList;
}

// Function to update roles in a file
function updateRolesInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Apply role replacements
    roleReplacements.forEach(({ from, to }) => {
      if (content.includes(from)) {
        content = content.replace(new RegExp(from, 'g'), to);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${path.relative(__dirname, filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

async function revertBackendRoles() {
  console.log('🔄 Reverting backend route files to use old role format...\n');
  
  // Find all JS files in src directory
  const srcDir = path.join(__dirname, 'src');
  const jsFiles = findJSFiles(srcDir);
  
  let updatedFiles = 0;
  let totalFiles = 0;
  
  jsFiles.forEach(filePath => {
    // Only process route files and middleware files
    if (filePath.includes('routes') || filePath.includes('middleware')) {
      totalFiles++;
      console.log(`🔍 Processing: ${path.relative(__dirname, filePath)}`);
      if (updateRolesInFile(filePath)) {
        updatedFiles++;
      }
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`- Total route/middleware files processed: ${totalFiles}`);
  console.log(`- Files updated: ${updatedFiles}`);
  console.log(`- Files unchanged: ${totalFiles - updatedFiles}`);
  
  if (updatedFiles > 0) {
    console.log('\n✅ Backend role reversion completed successfully!');
    console.log('🔧 All backend routes now use old role format (SuperAdmin, HR, Employee)');
  } else {
    console.log('\n✅ No changes needed - files already use correct role format');
  }
}

revertBackendRoles().catch(console.error);