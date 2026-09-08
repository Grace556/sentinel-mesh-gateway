import { RequestContext, HttpMethod } from './types';
import { ValidationError } from '../errors/meshErrors';

const VALID_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

export function validateRequestContext(ctx: unknown): asserts ctx is RequestContext {
  if (!ctx || typeof ctx !== 'object') {
    throw new ValidationError('context', 'RequestContext must be a non-null object');
  }

  const candidate = ctx as Record<string, unknown>;

  if (typeof candidate.traceId !== 'string' || candidate.traceId.trim().length === 0) {
    throw new ValidationError('traceId', 'Must provide a non-empty traceId string');
  }

  if (typeof candidate.path !== 'string' || !candidate.path.startsWith('/')) {
    throw new ValidationError('path', 'Path must be a string starting with /');
  }

  if (!VALID_METHODS.includes(candidate.method as HttpMethod)) {
    throw new ValidationError('method', `Unsupported HTTP method: ${String(candidate.method)}`);
  }

  if (typeof candidate.headers !== 'object' || candidate.headers === null || Array.isArray(candidate.headers)) {
    throw new ValidationError('headers', 'Headers must be a key-value record');
  }
}
