import { z } from 'zod';
import { RequestContext, HttpMethod } from './types';
import { ValidationError } from '../errors/meshErrors';

export const RequestContextSchema = z.object({
  traceId: z.string().min(1, 'Must provide a non-empty traceId string'),
  timestamp: z.number().int().positive(),
  path: z.string().startsWith('/', 'Path must start with /'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const),
  headers: z.record(z.string(), z.string()),
  body: z.unknown().optional()
});

export function validateRequestContext(ctx: unknown): asserts ctx is RequestContext {
  const result = RequestContextSchema.safeParse(ctx);
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue.path.join('.') || 'context';
    throw new ValidationError(path, issue.message);
  }
}
