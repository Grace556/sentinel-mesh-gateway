import { HealthReporter } from '../src/core/health';
import { CircuitBreaker } from '../src/breaker/circuitBreaker';

describe('Health and System Observability', () => {
  it('generates healthy report when all registered breakers are closed', () => {
    const map = new Map<string, CircuitBreaker>();
    map.set('user-svc', new CircuitBreaker('user-svc', {
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      halfOpenSuccessThreshold: 1
    }));

    const report = HealthReporter.generateReport(map);
    expect(report.status).toBe('UP');
    expect(report.breakers['user-svc']).toBe('CLOSED');
  });

  it('marks system as DEGRADED when an upstream breaker is tripped OPEN', async () => {
    const map = new Map<string, CircuitBreaker>();
    const breaker = new CircuitBreaker('billing-svc', {
      failureThreshold: 1,
      resetTimeoutMs: 10000,
      halfOpenSuccessThreshold: 1
    });

    try {
      await breaker.execute(async () => { throw new Error('Downstream socket dead'); });
    } catch {
      // Expected
    }

    map.set('billing-svc', breaker);
    const report = HealthReporter.generateReport(map);
    expect(report.status).toBe('DEGRADED');
    expect(report.breakers['billing-svc']).toBe('OPEN');
  });
});
