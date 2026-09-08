# Sentinel Mesh Gateway

High-performance TypeScript API gateway and microservice resilience mesh featuring token-bucket rate limiting, circuit breakers, and distributed telemetry.

## Installation
npm install @sentinel/mesh-gateway

## Architecture Overview
- src/core: Dispatcher, request envelope contracts, and router registry.
- src/breaker: Tri-state circuit breaker with configurable decay and half-open probes.
- src/limiter: Token-bucket rate limiter supporting burst quotas and continuous refill.
- src/telemetry: Structured telemetry and distributed tracing event stream.
- src/errors: Strongly-typed domain error hierarchy.

## Verification
npm test
npm run lint
npm run build
