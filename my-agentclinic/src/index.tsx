import { serve } from '@hono/node-server';
import { createApp } from './app';
import { createDatabase } from './db/database';

const database = createDatabase();
const app = createApp(database);

serve({ fetch: app.fetch, port: 3000 });
