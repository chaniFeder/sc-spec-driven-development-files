CREATE TABLE IF NOT EXISTS ailments (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_ailments (
  agent_id TEXT NOT NULL,
  ailment_id TEXT NOT NULL,
  PRIMARY KEY (agent_id, ailment_id),
  FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE,
  FOREIGN KEY (ailment_id) REFERENCES ailments (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS agent_ailments_ailment_id_idx
  ON agent_ailments (ailment_id);
