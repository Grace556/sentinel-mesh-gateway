import { MeshGateway } from '../src/core/gateway';
import { CircuitBreaker } from '../src/breaker/circuitBreaker';
import { RequestContext } from '../src/core/types';

describe('Gateway & Breaker Integration', () => {
  it('dispatches upstream action through breaker and handles circuit trip with 503', async () => {
    const gateway = new MeshGateway();
    const billingBreaker = new CircuitBreaker('billing', {
      failureThreshold: 1,
      resetTimeoutMs: 5000,
      halfOpenSuccessThreshold: 1
    });

    gateway.registerBreaker('billing', billingBreaker);

    gateway.registerRoute('POST', '/pay', async (_ctx) => {
      const breaker = gateway.getBreaker('billing')!;
      return breaker.execute(async () => {
        throw new Error('Billing network timeout');
      });
    });

    const req: RequestContext = {
      traceId: 'tr-bill-01',
      timestamp: Date.now(),
      method: 'POST',
      path: '/pay',
      headers: {},
      body: {}
    };

    const res1 = await gateway.dispatch(req);
    expect(res1.statusCode).toBe(500);

    const res2 = await gateway.dispatch(req);
    expect(res2.statusCode).toBe(503);
    expect(res2.error?.code).toBe('CIRCUIT_OPEN');
  });
});
