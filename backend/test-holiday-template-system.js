/**
 * Test Holiday Template System
 * Tests the complete holiday selection template functionality
 */

import express from 'express';
import cors from 'cors';
import holidaySelectionTemplateRoutes from './src/routes/admin/holidaySelectionTemplate.routes.js';
import calendarificRoutes from './src/routes/admin/calendarific.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import sequelize from './src/config/sequelize.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock authentication middleware for testing
app.use((req, res, next) => {
  req.user = {
    id: 1,
    email: 'admin@test.com',
    role: 'Admin'
  };
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/holiday-templates', holidaySelectionTemplateRoutes);
app.use('/api/admin/calendarific', calendarificRoutes);

// Test endpoints
app.get('/test/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Holiday Template System Test Server Running',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = 3001;

async function startTestServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    app.listen(PORT, () => {
      console.log(`🚀 Holiday Template Test Server running on port ${PORT}`);
      console.log('\n📋 Available Test Endpoints:');
      console.log(`   GET  http://localhost:${PORT}/test/health`);
      console.log(`   GET  http://localhost:${PORT}/api/admin/holiday-templates`);
      console.log(`   POST http://localhost:${PORT}/api/admin/holiday-templates`);
      console.log(`   GET  http://localhost:${PORT}/api/admin/calendarific/test-connection`);
      console.log(`   POST http://localhost:${PORT}/api/admin/calendarific/sync-with-template/:templateId`);
      console.log('\n🧪 Test the Holiday Selection Template system!');
      console.log('\n📖 Example Template Creation:');
      console.log(`
POST http://localhost:${PORT}/api/admin/holiday-templates
{
  "name": "Test Company Holidays",
  "description": "Test template for company holidays",
  "country": "IN",
  "holidayTypes": ["national", "religious"],
  "selectedHolidays": ["Republic Day", "Independence Day", "Diwali"],
  "maxHolidays": 10,
  "isDefault": false
}
      `);
    });
    
  } catch (error) {
    console.error('❌ Failed to start test server:', error);
    process.exit(1);
  }
}

startTestServer();