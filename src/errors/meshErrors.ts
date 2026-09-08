export class MeshError extends Error {
  constructor(message: string, public readonly code: string, public readonly statusCode: number) {
    super(message);
    this.name = 'MeshError';
  }
}

export class RateLimitExceededError extends MeshError {
  constructor(key: string) {
    super(`Rate limit exceeded for client: ${key}`, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitExceededError';
  }
}

export class CircuitBreakerOpenError extends MeshError {
  constructor(service: string) {
    super(`Circuit breaker is OPEN for upstream service: ${service}`, 'CIRCUIT_OPEN', 503);
    this.name = 'CircuitBreakerOpenError';
  }
}

export class ValidationError extends MeshError {
  constructor(field: string, reason: string) {
    super(`Validation failed for '${field}': ${reason}`, 'VALIDATION_FAILED', 400);
    this.name = 'ValidationError';
  }
}
