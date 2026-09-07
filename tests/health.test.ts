import { describe, it, expect } from 'vitest';
import { db } from '../server/sqlite_db';

describe('Database Health & Readiness Probe', () => {
  it('should actively execute a query probe and report engine latency', async () => {
    const probe = await db.probeHealth();

    expect(probe).toBeDefined();
    expect(probe.latencyMs).toBeGreaterThanOrEqual(0);
    expect(['healthy', 'degraded', 'unhealthy']).toContain(probe.status);
    expect(['PostgreSQL', 'SQLite WASM']).toContain(probe.engine);
    expect(probe.serverTime).toBeDefined();
  });
});
