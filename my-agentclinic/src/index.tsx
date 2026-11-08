import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Home } from './pages/Home';

const app = new Hono();

app.get('/', (context) => context.html(<Home />));

serve({ fetch: app.fetch, port: 3000 });
