import 'dotenv/config';
import { getDb, initSchema } from '../config/database.js';

export const SEED_INTERNSHIPS = [
  {
    id: 'INT-001',
    title: 'Frontend Practice Internship',
    domain: 'Web Development',
    mode: 'Remote',
    duration_weeks: 4,
    applications_open: 1,
  },
  {
    id: 'INT-002',
    title: 'Data Dashboard Internship',
    domain: 'Data Analytics',
    mode: 'Remote',
    duration_weeks: 6,
    applications_open: 1,
  },
  {
    id: 'INT-003',
    title: 'Product Design Internship',
    domain: 'UI/UX',
    mode: 'Hybrid',
    duration_weeks: 4,
    applications_open: 1,
  },
  {
    id: 'INT-004',
    title: 'C++ Utility Internship',
    domain: 'C++ Programming',
    mode: 'Remote',
    duration_weeks: 5,
    applications_open: 0,
  },
];

/**
 * Seeds the database idempotently by inserting only missing records.
 * Existing records are preserved without overwriting modifications.
 * @param {import('node:sqlite').DatabaseSync} db
 * @returns {{ insertedCount: number, skippedCount: number }}
 */
export function seedDatabase(db = getDb()) {
  initSchema(db);

  const checkStmt = db.prepare('SELECT id FROM internships WHERE id = ?');
  const insertStmt = db.prepare(`
    INSERT INTO internships (id, title, domain, mode, duration_weeks, applications_open)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  let insertedCount = 0;
  let skippedCount = 0;

  db.exec('BEGIN TRANSACTION;');
  try {
    for (const record of SEED_INTERNSHIPS) {
      const existing = checkStmt.get(record.id);
      if (existing) {
        skippedCount++;
      } else {
        insertStmt.run(
          record.id,
          record.title,
          record.domain,
          record.mode,
          record.duration_weeks,
          record.applications_open
        );
        insertedCount++;
      }
    }
    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  return { insertedCount, skippedCount };
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  try {
    const { insertedCount, skippedCount } = seedDatabase();
    console.log(
      `Database seeded successfully: ${insertedCount} inserted, ${skippedCount} already existed (preserved).`
    );
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error.message);
    process.exit(1);
  }
}
