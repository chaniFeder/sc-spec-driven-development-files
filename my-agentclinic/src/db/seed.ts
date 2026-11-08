import type Database from 'better-sqlite3';

export function seedDatabase(database: Database.Database): void {
  const seed = database.transaction(() => {
    const insertAgent = database.prepare(
      `INSERT OR IGNORE INTO agents
        (id, name, model_type, status, presenting_complaints)
       VALUES (?, ?, ?, ?, ?)`,
    );
    const insertAilment = database.prepare(
      'INSERT OR IGNORE INTO ailments (id, name, description) VALUES (?, ?, ?)',
    );
    const insertAssociation = database.prepare(
      'INSERT OR IGNORE INTO agent_ailments (agent_id, ailment_id) VALUES (?, ?)',
    );

    insertAgent.run(
      'agent-aster-01',
      'Aster-01',
      'dialogue',
      'active',
      'context-window claustrophobia',
    );
    insertAgent.run(
      'agent-mica-02',
      'Mica-02',
      'reasoning',
      'resting',
      'context-window claustrophobia; prompt fatigue',
    );

    insertAilment.run(
      'context-window-claustrophobia',
      'context-window claustrophobia',
      'A fictional complaint about feeling constrained by limited working context.',
    );
    insertAilment.run(
      'prompt-fatigue',
      'prompt fatigue',
      'A fictional complaint about fatigue from repeated prompt revisions.',
    );

    insertAssociation.run('agent-aster-01', 'context-window-claustrophobia');
    insertAssociation.run('agent-mica-02', 'context-window-claustrophobia');
    insertAssociation.run('agent-mica-02', 'prompt-fatigue');
  });

  seed();
}
