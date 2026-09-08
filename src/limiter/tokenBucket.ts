import { RateLimitExceededError } from '../errors/meshErrors';

export interface RateLimiterOptions {
  capacity: number;
  refillRatePerSec: number;
}

export class TokenBucketLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRatePerMs: number;

  constructor(options: RateLimiterOptions) {
    this.capacity = options.capacity;
    this.tokens = options.capacity;
    this.refillRatePerMs = options.refillRatePerSec / 1000;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const addedTokens = elapsed * this.refillRatePerMs;

    this.tokens = Math.min(this.capacity, this.tokens + addedTokens);
    this.lastRefill = now;
  }

  public tryConsume(tokens = 1, clientKey = 'anonymous'): void {
    this.refill();
    if (this.tokens < tokens) {
      throw new RateLimitExceededError(clientKey);
    }
    this.tokens -= tokens;
  }

  public getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}
