import { CircuitBreaker, CircuitState } from '../src/breaker/circuitBreaker';
import { CircuitBreakerOpenError } from '../src/errors/meshErrors';

describe('CircuitBreaker', () => {
  it('executes successful actions while staying CLOSED', async () => {
    const breaker = new CircuitBreaker('auth-service', {
      failureThreshold: 2,
      resetTimeoutMs: 100,
      halfOpenSuccessThreshold: 1
    });

    const result = await breaker.execute(async () => 'OK');
    expect(result).toBe('OK');
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
  });

  it('trips to OPEN state when failures reach threshold', async () => {
    const breaker = new CircuitBreaker('payment-service', {
      failureThreshold: 2,
      resetTimeoutMs: 50,
      halfOpenSuccessThreshold: 1
    });

    const failingTask = async () => {
      throw new Error('Timeout');
    };

    await expect(breaker.execute(failingTask)).rejects.toThrow('Timeout');
    await expect(breaker.execute(failingTask)).rejects.toThrow('Timeout');

    expect(breaker.getState()).toBe(CircuitState.OPEN);
    await expect(breaker.execute(async () => 'Blocked')).rejects.toThrow(CircuitBreakerOpenError);
  });
});
