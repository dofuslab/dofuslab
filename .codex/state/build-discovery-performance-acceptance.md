# Build Discovery Performance Acceptance

Last updated: 2026-07-09

The current fresh synchronous local suite is not under the 5000 ms p95
threshold. Earlier async-first work remains useful fallback infrastructure, but
the current Milestone 2 success goal is stricter: cache-miss / fresh-generation
p95 under 5 seconds for the representative Milestone 1 level 200 Iop query
matrix.

## Current Fallback Path

- App-cache hits may return synchronously.
- Fresh app-cache misses must use `startBuildDiscovery` and complete through
  `buildDiscoveryJob` polling.
- The direct `buildDiscovery` GraphQL field is deprecated as a legacy/dev path.
- Product UI should not depend on direct fresh synchronous `buildDiscovery`
  responses.

## Evidence

- Fresh local suite remeasurement still exceeded 5000 ms for most rows.
- Cache prewarm produced nonempty supported-row results.
- Warmed app-cache suite returned all supported rows as cache hits.
- Async smoke proved cache miss -> queued job -> worker execution -> polling
  result in local Docker after migrations.

## Milestone 2 Implication

Build Discovery can proceed with async miss handling while optimization work
continues, but Milestone 2 is not complete until measured cache-miss /
fresh-generation p95 is under 5 seconds for the representative Milestone 1
matrix. Slow rows need separate optimization work before the performance target
should be presented as achieved.
