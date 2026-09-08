import { MeshGateway } from '../src/core/gateway';
import { RequestContext } from '../src/core/types';
import { TokenBucketLimiter } from '../src/limiter/tokenBucket';
import { TelemetryLogger } from '../src/telemetry/logger';

describe('MeshGateway', () => {
  beforeEach(() => {
    TelemetryLogger.flush();
  });

  it('routes valid requests with telemetry context', async () => {
    const gateway = new MeshGateway();
    gateway.registerRoute('GET', '/health', async (ctx) => ({
      statusCode: 200,
      traceId: ctx.traceId,
      data: { status: 'healthy' }
    }));

    const req: RequestContext = {
      traceId: 'trace-101',
      timestamp: Date.now(),
      method: 'GET',
      path: '/health',
      headers: {},
      body: {}
    };

    const res = await gateway.dispatch(req);
    expect(res.statusCode).toBe(200);
    expect(res.data).toEqual({ status: 'healthy' });
    expect(TelemetryLogger.getLogsByTrace('trace-101').length).toBe(2);
  });

  it('handles unmatched routes cleanly with 404', async () => {
    const gateway = new MeshGateway();
    const req: RequestContext = {
      traceId: 'trace-404',
      timestamp: Date.now(),
      method: 'POST',
      path: '/missing',
      headers: {},
      body: {}
    };

    const res = await gateway.dispatch(req);
    expect(res.statusCode).toBe(404);
    expect(res.error?.code).toBe('NOT_FOUND');
  });

  it('enforces rate limits via middleware', async () => {
    const gateway = new MeshGateway();
    gateway.setRateLimiter(new TokenBucketLimiter({ capacity: 1, refillRatePerSec: 1 }));
    gateway.registerRoute('GET', '/data', async (ctx) => ({
      statusCode: 200,
      traceId: ctx.traceId,
      data: 'payload'
    }));

    const req: RequestContext = {
      traceId: 'trace-lim',
      timestamp: Date.now(),
      method: 'GET',
      path: '/data',
      headers: { 'x-client-id': 'app-1' },
      body: {}
    };

    const res1 = await gateway.dispatch(req);
    expect(res1.statusCode).toBe(200);

    const res2 = await gateway.dispatch(req);
    expect(res2.statusCode).toBe(429);
    expect(res2.error?.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});
