import { validateRequestContext } from '../src/core/validation';
import { ValidationError } from '../src/errors/meshErrors';
import { MeshGateway } from '../src/core/gateway';

describe('Validation Layer', () => {
  it('passes on valid request context', () => {
    expect(() => {
      validateRequestContext({
        traceId: 'tr-001',
        timestamp: Date.now(),
        path: '/api/v1/orders',
        method: 'GET',
        headers: {},
        body: null
      });
    }).not.toThrow();
  });

  it('rejects contexts without leading slash on path', () => {
    expect(() => {
      validateRequestContext({
        traceId: 'tr-002',
        timestamp: Date.now(),
        path: 'bad-path',
        method: 'GET',
        headers: {},
        body: null
      });
    }).toThrow(ValidationError);
  });

  it('gateway dispatch returns status 400 with VALIDATION_FAILED on malformed inputs', async () => {
    const gateway = new MeshGateway();
    // @ts-expect-error testing runtime bad input
    const res = await gateway.dispatch({ traceId: '', path: '/bad' });
    expect(res.statusCode).toBe(400);
    expect(res.error?.code).toBe('VALIDATION_FAILED');
  });
});
