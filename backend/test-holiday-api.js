import express from 'express';
import { Holiday } from './src/models/index.js';

const app = express();

// Test endpoint to check holiday data
app.get('/test-holidays', async (req, res) => {
  try {
    console.log('🔍 Testing Holiday API...');
    
    // Get holidays for January 2026
    const startDate = new Date(2026, 0, 1);
    const endDate = new Date(2026, 0, 31);
    
    const holidays = await Holiday.getHolidaysInRange(startDate, endDate);
    
    console.log(`Found ${holidays.length} holidays:`);
    holidays.forEach(h => {
      console.log(`  ${h.name}: ${h.date} (${typeof h.date})`);
    });
    
    res.json({
      success: true,
      count: holidays.length,
      holidays: holidays.map(h => ({
        id: h.id,
        name: h.name,
        date: h.date,
        dateType: typeof h.date,
        rawData: h
      }))
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Visit http://localhost:3001/test-holidays to test holiday data');
});