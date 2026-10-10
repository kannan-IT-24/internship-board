import 'dotenv/config';
import { getDb, initSchema } from '../config/database.js';

export function runInit() {
  console.log('Initializing database schema...');
  const db = getDb();
  initSchema(db);
  console.log('Database schema successfully initialized.');
}

if (process.argv[1] && process.argv[1].endsWith('init.js')) {
  try {
    runInit();
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  }
}
