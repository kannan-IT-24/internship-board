import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let defaultDbInstance = null;

/**
 * Initializes and returns a SQLite DatabaseSync connection.
 * @param {string} [customPath] Optional custom DB path (e.g., ':memory:' for tests)
 * @returns {DatabaseSync}
 */
export function getDb(customPath) {
  if (customPath) {
    if (customPath !== ':memory:') {
      const dir = path.dirname(customPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    const db = new DatabaseSync(customPath);
    db.exec('PRAGMA foreign_keys = ON;');
    return db;
  }

  if (defaultDbInstance) {
    return defaultDbInstance;
  }

  const rawPath = process.env.DATABASE_PATH || './data/internships.db';
  const resolvedPath = rawPath === ':memory:'
    ? ':memory:'
    : path.resolve(__dirname, '../../', rawPath);

  if (resolvedPath !== ':memory:') {
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  defaultDbInstance = new DatabaseSync(resolvedPath);
  defaultDbInstance.exec('PRAGMA foreign_keys = ON;');
  return defaultDbInstance;
}

/**
 * Initializes schema on the target database instance.
 * @param {DatabaseSync} db
 */
export function initSchema(db = getDb()) {
  const schemaPath = path.resolve(__dirname, '../db/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(sql);
}

/**
 * Closes the default database instance if open.
 */
export function closeDefaultDb() {
  if (defaultDbInstance) {
    try {
      defaultDbInstance.close();
    } catch {
      // Ignore if already closed
    }
    defaultDbInstance = null;
  }
}
