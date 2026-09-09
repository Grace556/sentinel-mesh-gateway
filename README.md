# Sentinel Mesh Gateway

Sentinel Mesh Gateway is an enterprise-grade API gateway and resilience mesh written in TypeScript. It safeguards downstream microservices against cascading failures, burst traffic spikes, and unvalidated payloads through composable layers.

## Core Architectural Layers

- **Routing & Dispatch (`src/core/gateway.ts`)**: Fast path-based route matching with uniform response envelope wrapping and telemetry injection.
- **Schema Validation (`src/core/validation.ts`)**: Strict runtime type enforcement of request boundaries using Zod schemas.
- **Resilience Mesh (`src/breaker/circuitBreaker.ts`)**: Closed, Open, and Half-Open circuit breaker state machine with automatic cooldown recovery.
- **Traffic Shaping (`src/limiter/tokenBucket.ts`)**: In-memory token bucket rate limiting with per-client identity tracking and continuous token refill.
- **Observability & Diagnostics (`src/telemetry/logger.ts`, `src/core/health.ts`)**: Structured JSON event telemetry and aggregated mesh health status reporting.

## Installation

```bash
npm install @sentinel/mesh-gateway zod
```

## Quick Start & Usage

```typescript
import { MeshGateway, TokenBucketLimiter, CircuitBreaker } from "@sentinel/mesh-gateway";

const gateway = new MeshGateway();
gateway.setRateLimiter(new TokenBucketLimiter({ capacity: 20, refillRatePerSec: 5 }));

const paymentBreaker = new CircuitBreaker("payments", {
  failureThreshold: 3,
  resetTimeoutMs: 10000,
  halfOpenSuccessThreshold: 2
});
gateway.registerBreaker("payments", paymentBreaker);
```

## Configuration Reference

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `capacity` | `number` | Required | Maximum burst token allowance in the bucket |
| `refillRatePerSec` | `number` | Required | Rate at which consumed tokens replenish per second |
| `failureThreshold` | `number` | Required | Consecutive failure count before circuit trips to `OPEN` |
| `resetTimeoutMs` | `number` | Required | Delay in milliseconds before probing downstream recovery (`HALF_OPEN`) |
| `halfOpenSuccessThreshold` | `number` | Required | Consecutive successes required in `HALF_OPEN` to reset to `CLOSED` |

## Container Verification

```bash
docker build -t sentinel-mesh-gateway .
docker run --rm sentinel-mesh-gateway
```

## Local Development

```bash
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
```
