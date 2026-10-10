import 'dotenv/config';
import { createApp } from './app.js';
import { getDb, initSchema } from './config/database.js';
import { seedDatabase } from './db/seed.js';

const PORT = process.env.PORT || 5000;

// Ensure database and schema are ready before listening
try {
  const db = getDb();
  initSchema(db);
  seedDatabase(db);
  console.log('Database connected and initialized.');
} catch (err) {
  console.error('Failed to initialize database during startup:', err.message);
  process.exit(1);
}

const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 InternHub Backend Server running on port ${PORT}`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
  console.log(`💓 Health:   http://localhost:${PORT}/api/health`);
  console.log(`📋 API:      http://localhost:${PORT}/api/internships`);
  console.log(`===============================================`);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\nGracefully shutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
