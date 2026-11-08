import { Hono } from 'hono';
import { Home } from './pages/Home';

export const app = new Hono();

app.get('/', (context) => context.html(<Home />));
