// Quick fix script to remove activeTab reference
import fs from 'fs';

const filePath = 'HRM-System/frontend/src/modules/calendar/admin/CalendarificManagement.jsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove the problematic console.log line
  content = content.replace(
    /\s*\{console\.log\([^}]*activeTab[^}]*\)\}/g,
    ''
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed activeTab reference in CalendarificManagement.jsx');
  
} catch (error) {
  console.error('❌ Error fixing file:', error.message);
}