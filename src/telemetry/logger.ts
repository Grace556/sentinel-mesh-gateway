export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface StructuredLog {
  timestamp: string;
  traceId: string;
  level: LogLevel;
  event: string;
  attributes: Record<string, unknown>;
}

export class TelemetryLogger {
  private static store: StructuredLog[] = [];

  public static emit(
    level: LogLevel,
    traceId: string,
    event: string,
    attributes: Record<string, unknown> = {}
  ): StructuredLog {
    const entry: StructuredLog = {
      timestamp: new Date().toISOString(),
      traceId,
      level,
      event,
      attributes
    };
    this.store.push(entry);
    return entry;
  }

  public static getLogsByTrace(traceId: string): StructuredLog[] {
    return this.store.filter((log) => log.traceId === traceId);
  }

  public static flush(): void {
    this.store = [];
  }
}
