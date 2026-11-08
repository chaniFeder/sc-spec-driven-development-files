CREATE TABLE IF NOT EXISTS therapists (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS availability_slots (
  id TEXT PRIMARY KEY NOT NULL,
  therapist_id TEXT NOT NULL,
  therapy_id TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  UNIQUE (therapist_id, therapy_id, starts_at),
  FOREIGN KEY (therapist_id) REFERENCES therapists (id) ON DELETE RESTRICT,
  FOREIGN KEY (therapy_id) REFERENCES therapies (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS availability_slots_starts_at_idx
  ON availability_slots (starts_at);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY NOT NULL,
  agent_id TEXT NOT NULL,
  slot_id TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Scheduled'
    CHECK (status IN ('Scheduled', 'Cancelled', 'Completed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE RESTRICT,
  FOREIGN KEY (slot_id) REFERENCES availability_slots (id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS appointments_agent_id_idx
  ON appointments (agent_id);

CREATE INDEX IF NOT EXISTS appointments_slot_id_idx
  ON appointments (slot_id);
