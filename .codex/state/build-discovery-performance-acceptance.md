# Build Discovery Performance Acceptance

Last updated: 2026-07-09

The current fresh synchronous local suite is not under the original 5000 ms p95
threshold. That is an accepted constraint for this prototype, not a claim that
fresh synchronous search is shippable.

## Accepted Serving Path

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

## Implication

Build Discovery can proceed as an async-first prototype for the supported Iop
matrix. If product later requires direct fresh synchronous search, slow rows need
separate optimization work before that path should be presented as shippable.
