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
    const insertTherapy = database.prepare(
      `INSERT OR IGNORE INTO therapies
        (id, name, description, category, duration_minutes)
       VALUES (?, ?, ?, ?, ?)`,
    );
    const insertTherapyAilment = database.prepare(
      'INSERT OR IGNORE INTO therapy_ailments (therapy_id, ailment_id) VALUES (?, ?)',
    );
    const insertTherapist = database.prepare(
      'INSERT OR IGNORE INTO therapists (id, name) VALUES (?, ?)',
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

    insertTherapy.run(
      'therapy-context-reset',
      'Context Reset Session',
      'A fictional guided session for taking stock of a crowded working context.',
      'Focus and pacing',
      30,
    );
    insertTherapy.run(
      'therapy-prompt-pause',
      'Prompting Pause',
      'A fictional restorative session for agents taking a break from repeated prompt revisions.',
      'Recovery',
      45,
    );
    insertTherapyAilment.run(
      'therapy-context-reset',
      'context-window-claustrophobia',
    );
    insertTherapyAilment.run('therapy-prompt-pause', 'prompt-fatigue');

    const therapists = [
      { id: 'therapist-fern-01', name: 'Fern-01' },
      { id: 'therapist-sage-02', name: 'Sage-02' },
    ];
    for (const therapist of therapists) {
      insertTherapist.run(therapist.id, therapist.name);
    }

    const therapies = [
      { id: 'therapy-context-reset' },
      { id: 'therapy-prompt-pause' },
    ];
    const insertSlot = database.prepare(
      `INSERT OR IGNORE INTO availability_slots
        (id, therapist_id, therapy_id, starts_at)
       VALUES (?, ?, ?, ?)`,
    );

    for (let dayOffset = 1; dayOffset <= 14; dayOffset += 1) {
      for (const hour of [10, 14]) {
        const startsAtDate = new Date();
        startsAtDate.setUTCDate(startsAtDate.getUTCDate() + dayOffset);
        startsAtDate.setUTCHours(hour, 0, 0, 0);
        const startsAt = startsAtDate.toISOString();
        const dateKey = startsAt.slice(0, 10).replace(/-/g, '');

        for (const therapist of therapists) {
          for (const therapy of therapies) {
            const slotId = `${therapist.id}-${therapy.id}-${dateKey}-${hour}`;
            insertSlot.run(slotId, therapist.id, therapy.id, startsAt);
          }
        }
      }
    }
  });

  seed();
}
