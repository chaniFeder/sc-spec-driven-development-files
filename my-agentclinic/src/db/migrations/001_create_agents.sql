CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  model_type TEXT NOT NULL,
  status TEXT NOT NULL,
  presenting_complaints TEXT NOT NULL
);
