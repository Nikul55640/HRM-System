import { sequelize } from './src/models/sequelize/index.js';

async function syncDatabase() {
  try {
    console.log('🔄 Syncing database...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
}

syncDatabase();