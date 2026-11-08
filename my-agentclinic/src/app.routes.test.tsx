import { describe, expect, it } from 'vitest';
import { createApp } from './app';
import { createDatabase } from './db/database';

describe('MVP route scope', () => {
  it('registers the agent, therapy, booking, and staff routes', () => {
    const database = createDatabase(':memory:');
    try {
      const routes = createApp(database).routes.map(({ method, path }) => ({
        method,
        path,
      }));

      expect(routes).toEqual(
        expect.arrayContaining([
          { method: 'GET', path: '/' },
          { method: 'GET', path: '/agents' },
          { method: 'GET', path: '/agents/:id' },
          { method: 'GET', path: '/ailments' },
          { method: 'GET', path: '/therapies' },
          { method: 'GET', path: '/therapies/:id' },
          { method: 'GET', path: '/agents/:id/appointments' },
          { method: 'POST', path: '/agents/:id/appointments' },
          { method: 'POST', path: '/agents/:id/appointments/:appointmentId/cancel' },
          { method: 'GET', path: '/dashboard' },
          { method: 'GET', path: '/dashboard/appointments/:id' },
          { method: 'POST', path: '/dashboard/appointments/:id/status' },
          { method: 'POST', path: '/dashboard/appointments/:id/cancel' },
          { method: 'GET', path: '/styles.css' },
          { method: 'GET', path: '/styles/pico.min.css' },
        ]),
      );
      expect(routes.some(({ method }) => method === 'POST')).toBe(true);
    } finally {
      database.close();
    }
  });
});
