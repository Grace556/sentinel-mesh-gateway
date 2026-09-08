import { RequestContext, ResponseEnvelope, RouteHandler } from './types';
import { TokenBucketLimiter } from '../limiter/tokenBucket';
import { CircuitBreaker } from '../breaker/circuitBreaker';
import { TelemetryLogger } from '../telemetry/logger';
import { MeshError } from '../errors/meshErrors';

export class MeshGateway {
  private routes: Map<string, RouteHandler<unknown, unknown>> = new Map();
  private limiter?: TokenBucketLimiter;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  public setRateLimiter(limiter: TokenBucketLimiter): this {
    this.limiter = limiter;
    return this;
  }

  public registerBreaker(serviceName: string, breaker: CircuitBreaker): this {
    this.circuitBreakers.set(serviceName, breaker);
    return this;
  }

  public registerRoute<TIn, TOut>(
    method: string,
    path: string,
    handler: RouteHandler<TIn, TOut>
  ): this {
    const key = `${method.toUpperCase()}:${path}`;
    this.routes.set(key, handler as RouteHandler<unknown, unknown>);
    return this;
  }

  public async dispatch<TIn, TOut>(ctx: RequestContext<TIn>): Promise<ResponseEnvelope<TOut>> {
    const routeKey = `${ctx.method.toUpperCase()}:${ctx.path}`;
    TelemetryLogger.emit('info', ctx.traceId, 'REQUEST_DISPATCH', { route: routeKey });

    try {
      if (this.limiter) {
        this.limiter.tryConsume(1, ctx.headers['x-client-id'] ?? 'anonymous');
      }

      const handler = this.routes.get(routeKey);
      if (!handler) {
        return {
          statusCode: 404,
          traceId: ctx.traceId,
          error: { code: 'NOT_FOUND', message: `Route not registered: ${routeKey}` }
        };
      }

      const response = await handler(ctx);
      TelemetryLogger.emit('info', ctx.traceId, 'REQUEST_SUCCESS', { statusCode: response.statusCode });
      return response as ResponseEnvelope<TOut>;
    } catch (err) {
      const meshErr = err instanceof MeshError ? err : new MeshError((err as Error).message, 'INTERNAL_FAULT', 500);
      TelemetryLogger.emit('error', ctx.traceId, 'REQUEST_ERROR', { code: meshErr.code, status: meshErr.statusCode });

      return {
        statusCode: meshErr.statusCode,
        traceId: ctx.traceId,
        error: { code: meshErr.code, message: meshErr.message }
      };
    }
  }
}
