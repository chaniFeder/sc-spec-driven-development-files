import Database from 'better-sqlite3';
import { readdirSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { seedDatabase } from './seed';

export type ClinicDatabase = Database.Database;

const migrationDirectory = join(__dirname, 'migrations');
export const defaultDatabasePath = join(process.cwd(), 'data', 'agentclinic.sqlite');

function migrationFiles(): string[] {
  return readdirSync(migrationDirectory)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

export function migrateDatabase(database: ClinicDatabase): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const appliedMigrations = new Set(
    database
      .prepare<[], { filename: string }>(
        'SELECT filename FROM schema_migrations ORDER BY filename',
      )
      .all()
      .map(({ filename }) => filename),
  );
  const recordMigration = database.prepare(
    'INSERT INTO schema_migrations (filename) VALUES (?)',
  );

  for (const filename of migrationFiles()) {
    if (appliedMigrations.has(filename)) {
      continue;
    }

    const sql = readFileSync(join(migrationDirectory, filename), 'utf8');
    database.transaction(() => {
      database.exec(sql);
      recordMigration.run(filename);
    })();
  }
}

export function createDatabase(
  filename = defaultDatabasePath,
  seed = true,
): ClinicDatabase {
  if (filename !== ':memory:') {
    mkdirSync(dirname(resolve(filename)), { recursive: true });
  }

  const database = new Database(filename);
  database.pragma('foreign_keys = ON');
  migrateDatabase(database);

  if (seed) {
    seedDatabase(database);
  }

  return database;
}
