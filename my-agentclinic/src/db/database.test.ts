import Database from 'better-sqlite3';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it } from 'vitest';
import { createDatabase, type ClinicDatabase } from './database';
import { listAgents, listAilments } from './queries';

const openDatabases: ClinicDatabase[] = [];

function makeDatabase(seed = true): ClinicDatabase {
  const database = createDatabase(':memory:', seed);
  openDatabases.push(database);
  return database;
}

afterEach(() => {
  for (const database of openDatabases.splice(0)) {
    if (database.open) {
      database.close();
    }
  }
});

describe('SQLite migrations and seeds', () => {
  it('creates only agents in the first migration', () => {
    const database = new Database(':memory:');
    try {
      const migration = readFileSync(
        join(__dirname, 'migrations', '001_create_agents.sql'),
        'utf8',
      );
      database.exec(migration);

      const tables = database
        .prepare<[], { name: string }>(
          "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
        )
        .all()
        .map(({ name }) => name);

      expect(tables).toContain('agents');
      expect(tables).not.toContain('ailments');
      expect(tables).not.toContain('agent_ailments');
    } finally {
      database.close();
    }
  });

  it('applies migrations in order and creates relational tables', () => {
    const database = makeDatabase(false);
    const migrations = database
      .prepare<[], { filename: string }>(
        'SELECT filename FROM schema_migrations ORDER BY filename',
      )
      .all()
      .map(({ filename }) => filename);

    expect(migrations).toEqual([
      '001_create_agents.sql',
      '002_create_ailments_and_agent_ailments.sql',
    ]);

    const foreignKeys = database
      .prepare<[], { table: string }>('PRAGMA foreign_key_list(agent_ailments)')
      .all()
      .map(({ table }) => table);
    expect(foreignKeys).toEqual(expect.arrayContaining(['agents', 'ailments']));
  });

  it('seeds the known fictional fixtures with associations for every record', () => {
    const database = makeDatabase();
    const agents = listAgents(database);
    const ailments = listAilments(database);

    expect(agents.map(({ id, name }) => ({ id, name }))).toEqual([
      { id: 'agent-aster-01', name: 'Aster-01' },
      { id: 'agent-mica-02', name: 'Mica-02' },
    ]);
    expect(ailments.map(({ id, name, description }) => ({ id, name, description }))).toEqual([
      {
        id: 'context-window-claustrophobia',
        name: 'context-window claustrophobia',
        description:
          'A fictional complaint about feeling constrained by limited working context.',
      },
      {
        id: 'prompt-fatigue',
        name: 'prompt fatigue',
        description: 'A fictional complaint about fatigue from repeated prompt revisions.',
      },
    ]);
    expect(agents.every(({ ailments: linkedAilments }) => linkedAilments.length > 0)).toBe(
      true,
    );
    expect(ailments.every(({ agents: linkedAgents }) => linkedAgents.length > 0)).toBe(true);
  });

  it('enforces association foreign keys and uniqueness', () => {
    const database = makeDatabase();
    const insertAssociation = database.prepare(
      'INSERT INTO agent_ailments (agent_id, ailment_id) VALUES (?, ?)',
    );

    expect(() =>
      insertAssociation.run('missing-agent', 'context-window-claustrophobia'),
    ).toThrow(/FOREIGN KEY constraint failed/);
    expect(() =>
      insertAssociation.run('agent-aster-01', 'context-window-claustrophobia'),
    ).toThrow(/UNIQUE constraint failed/);
  });

  it('persists SQLite data when reopening the database file', () => {
    const directory = mkdtempSync(join(tmpdir(), 'agentclinic-'));
    const filename = join(directory, 'agentclinic.sqlite');

    try {
      let database = createDatabase(filename, false);
      database
        .prepare(
          `INSERT INTO agents
            (id, name, model_type, status, presenting_complaints)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .run('persisted-agent', 'Persisted Agent', 'test-model', 'active', 'Test complaint');
      database.close();

      database = createDatabase(filename, false);
      expect(
        database.prepare<[], { count: number }>(
          "SELECT COUNT(*) AS count FROM agents WHERE id = 'persisted-agent'",
        ).get()?.count,
      ).toBe(1);
      database.close();
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
