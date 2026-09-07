import { describe, it, expect } from 'vitest';
import { db } from '../server/sqlite_db';
import { createApp } from '../server/app';

describe('Database Health & Readiness Probe', () => {
  it('should actively execute a query probe and report engine latency', async () => {
    const probe = await db.probeHealth();

    expect(probe).toBeDefined();
    expect(probe.latencyMs).toBeGreaterThanOrEqual(0);
    expect(['healthy', 'degraded', 'unhealthy']).toContain(probe.status);
    expect(['PostgreSQL', 'SQLite WASM']).toContain(probe.engine);
    expect(probe.serverTime).toBeDefined();
  });

  it('should handle request lifecycle without ERR_HTTP_HEADERS_SENT errors', async () => {
    const app = await createApp();
    
    // Simulate HTTP request pipeline
    const req: any = {
      headers: {},
      path: '/api/health',
      method: 'GET',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' }
    };
    
    let headerSent = false;
    const headersMap: Record<string, any> = {};
    const listeners: Record<string, Function[]> = {};

    const res: any = {
      statusCode: 200,
      setHeader: (name: string, value: any) => {
        if (headerSent) {
          throw new Error('ERR_HTTP_HEADERS_SENT: Cannot set headers after they are sent to the client');
        }
        headersMap[name.toLowerCase()] = value;
      },
      status: function(code: number) {
        this.statusCode = code;
        return this;
      },
      json: function(payload: any) {
        headerSent = true;
        // Trigger finish event
        (listeners['finish'] || []).forEach(fn => fn());
        return this;
      },
      on: function(event: string, callback: Function) {
        listeners[event] = listeners[event] || [];
        listeners[event].push(callback);
      }
    };

    // Execute route through app._router handle
    expect(() => {
      (app as any).handle(req, res, () => {});
    }).not.toThrow();
  });
});
