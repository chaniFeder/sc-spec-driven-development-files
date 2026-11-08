import { describe, expect, it } from 'vitest';
import { app } from './app';

describe('Phase 1 route scope', () => {
  it('registers only GET /', () => {
    const routes = app.routes.map(({ method, path }) => ({ method, path }));

    expect(routes).toEqual([{ method: 'GET', path: '/' }]);
  });
});
