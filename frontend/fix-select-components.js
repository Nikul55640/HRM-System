/**
 * Script to find and report all Select components missing placeholders
 * This will help identify all instances that need fixing
 */

import fs from 'fs';
import path from 'path';

const findSelectIssues = (dir) => {
  const issues = [];
  
  const scanDirectory = (currentDir) => {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
        scanDirectory(filePath);
      } else if (file.endsWith('.jsx') || file.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Check if file uses Select components
          if (content.includes('SelectValue') && content.includes('SelectTrigger')) {
            const lines = content.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              
              // Look for SelectValue without placeholder
              if (line.includes('<SelectValue') && line.includes('/>') && !line.includes('placeholder=')) {
                issues.push({
                  file: filePath.replace(process.cwd() + '/', ''),
                  line: i + 1,
                  content: line.trim(),
                  issue: 'Missing placeholder'
                });
              }
            }
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
  };
  
  scanDirectory(dir);
  return issues;
};

// Scan the frontend src directory
const srcDir = path.join(process.cwd(), 'src');
const issues = findSelectIssues(srcDir);

console.log('🔍 ShadCN Select Component Issues Found:');
console.log('=====================================');

if (issues.length === 0) {
  console.log('✅ No issues found! All Select components have placeholders.');
} else {
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.file}:${issue.line}`);
    console.log(`   Issue: ${issue.issue}`);
    console.log(`   Code: ${issue.content}`);
    console.log('');
  });
  
  console.log(`📊 Total issues found: ${issues.length}`);
  console.log('\n🔧 Fix pattern:');
  console.log('Replace: <SelectValue />');
  console.log('With:    <SelectValue placeholder="Select..." />');
}