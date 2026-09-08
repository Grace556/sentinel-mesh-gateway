import { TokenBucketLimiter } from '../src/limiter/tokenBucket';
import { RateLimitExceededError } from '../src/errors/meshErrors';

describe('TokenBucketLimiter', () => {
  it('allows requests within capacity and tracks token depletion', () => {
    const limiter = new TokenBucketLimiter({ capacity: 5, refillRatePerSec: 10 });
    expect(limiter.getAvailableTokens()).toBe(5);

    limiter.tryConsume(2, 'client-a');
    expect(limiter.getAvailableTokens()).toBe(3);
  });

  it('rejects executions exceeding quota with RateLimitExceededError', () => {
    const limiter = new TokenBucketLimiter({ capacity: 1, refillRatePerSec: 1 });
    limiter.tryConsume(1, 'client-b');

    expect(() => limiter.tryConsume(1, 'client-b')).toThrow(RateLimitExceededError);
  });
});
