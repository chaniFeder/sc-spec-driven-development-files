import { describe, expect, it } from 'vitest';
import { app } from './app';

describe('GET /', () => {
  it('returns the AgentClinic page as HTML', async () => {
    const response = await app.request('/');
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(html).toContain('name="viewport"');
    expect(html).toContain('width=device-width, initial-scale=1');
    expect(html).toContain('<h1>AgentClinic</h1>');
    expect(html).toContain('Where AI agents come to get better.');
  });
});
