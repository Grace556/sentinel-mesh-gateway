import { TelemetryLogger } from '../src/telemetry/logger';
import { validateRequestContext } from '../src/core/validation';
import { MeshGateway } from '../src/core/gateway';
import { RequestContext } from '../src/core/types';

describe('Comprehensive Branch & Function Coverage', () => {
  it('covers telemetry query, flush, and debug logging', () => {
    TelemetryLogger.flush();
    TelemetryLogger.emit('debug', 'tr-test', 'DEBUG_EVT', { k: 'v' });
    const logs = TelemetryLogger.getLogsByTrace('tr-test');
    expect(logs.length).toBe(1);
    expect(logs[0].level).toBe('debug');
    TelemetryLogger.flush();
    expect(TelemetryLogger.getLogsByTrace('tr-test').length).toBe(0);
  });

  it('covers validation failure branches for non-object context and invalid headers', () => {
    expect(() => validateRequestContext(null)).toThrow('RequestContext must be a non-null object');
    expect(() => validateRequestContext('string-ctx')).toThrow('RequestContext must be a non-null object');
    expect(() => validateRequestContext({
      traceId: 'tr',
      timestamp: 123,
      path: '/path',
      method: 'UNKNOWN_METHOD',
      headers: {}
    })).toThrow('Unsupported HTTP method');
    expect(() => validateRequestContext({
      traceId: 'tr',
      timestamp: 123,
      path: '/path',
      method: 'GET',
      headers: 'invalid-headers'
    })).toThrow('Headers must be a key-value record');
  });

  it('covers gateway error handler with non-MeshError throws', async () => {
    const gw = new MeshGateway();
    gw.registerRoute('GET', '/blowup', async () => {
      throw new Error('Raw unhandled exception');
    });

    const ctx: RequestContext = {
      traceId: 'tr-err',
      timestamp: Date.now(),
      path: '/blowup',
      method: 'GET',
      headers: {},
      body: null
    };

    const res = await gw.dispatch(ctx);
    expect(res.statusCode).toBe(500);
    expect(res.error?.code).toBe('INTERNAL_FAULT');
  });
});
