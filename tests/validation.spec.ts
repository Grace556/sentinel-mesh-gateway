import { validateRequestContext, RequestContextSchema } from '../src/core/validation';
import { ValidationError } from '../src/errors/meshErrors';
import { MeshGateway } from '../src/core/gateway';

describe('Schema Validation Layer', () => {
  it('validates a schema-conforming RequestContext', () => {
    const validCtx = {
      traceId: 'tr-valid-1',
      timestamp: Date.now(),
      path: '/api/v1/resource',
      method: 'POST' as const,
      headers: { authorization: 'Bearer token' },
      body: { key: 'value' }
    };
    expect(RequestContextSchema.safeParse(validCtx).success).toBe(true);
    expect(() => validateRequestContext(validCtx)).not.toThrow();
  });

  it('throws ValidationError when path lacks leading slash', () => {
    const invalidCtx = {
      traceId: 'tr-invalid-2',
      timestamp: Date.now(),
      path: 'no-leading-slash',
      method: 'GET' as const,
      headers: {}
    };
    expect(() => validateRequestContext(invalidCtx)).toThrow(ValidationError);
  });

  it('gateway dispatch intercepts schema failures with 400', async () => {
    const gateway = new MeshGateway();
    // @ts-expect-error testing invalid method
    const res = await gateway.dispatch({ traceId: 'tr-3', path: '/foo', method: 'INVALID' });
    expect(res.statusCode).toBe(400);
    expect(res.error?.code).toBe('VALIDATION_FAILED');
  });
});
