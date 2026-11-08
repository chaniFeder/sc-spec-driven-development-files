import { describe, expect, it } from 'vitest';
import { createApp } from './app';
import { createDatabase } from './db/database';

describe('Phase 2 route scope', () => {
  it('registers the expected GET routes and no write routes', () => {
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
          { method: 'GET', path: '/styles.css' },
          { method: 'GET', path: '/styles/pico.min.css' },
        ]),
      );
      expect(routes.every(({ method }) => method === 'GET')).toBe(true);
    } finally {
      database.close();
    }
  });
});
