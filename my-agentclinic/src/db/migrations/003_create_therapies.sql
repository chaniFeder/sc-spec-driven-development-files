CREATE TABLE IF NOT EXISTS therapies (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0)
);

CREATE TABLE IF NOT EXISTS therapy_ailments (
  therapy_id TEXT NOT NULL,
  ailment_id TEXT NOT NULL,
  PRIMARY KEY (therapy_id, ailment_id),
  FOREIGN KEY (therapy_id) REFERENCES therapies (id) ON DELETE CASCADE,
  FOREIGN KEY (ailment_id) REFERENCES ailments (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS therapy_ailments_ailment_id_idx
  ON therapy_ailments (ailment_id);
