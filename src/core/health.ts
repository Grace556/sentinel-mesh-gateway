import { CircuitBreaker, CircuitState } from '../breaker/circuitBreaker';

export interface HealthReport {
  status: 'UP' | 'DEGRADED';
  uptimeSeconds: number;
  timestamp: string;
  breakers: Record<string, CircuitState>;
}

export class HealthReporter {
  private static startTime = Date.now();

  public static generateReport(breakers: Map<string, CircuitBreaker>): HealthReport {
    const breakerStates: Record<string, CircuitState> = {};
    let hasOpen = false;

    for (const [name, breaker] of breakers.entries()) {
      const st = breaker.getState();
      breakerStates[name] = st;
      if (st === CircuitState.OPEN) {
        hasOpen = true;
      }
    }

    return {
      status: hasOpen ? 'DEGRADED' : 'UP',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      breakers: breakerStates
    };
  }
}
