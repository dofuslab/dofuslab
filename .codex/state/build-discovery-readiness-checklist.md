# Build Discovery Readiness Checklist

Last updated: 2026-07-09

This is the current working checklist for deciding whether Build Discovery is shippable enough to hand to product/UI tinkering.

## Query Contract

- [x] Product-shaped query contract exists for class, level, element, AP/MP/Range, budget, exo policy, weapon policy, locked items, avoided items, and search limits.
- [x] Unsupported class/level/mode/multi-element inputs are rejected instead of silently producing low-confidence builds.
- [x] AP/MP/Range are minimum targets with hard caps and light surplus scoring.
- [x] Cache keys include query identity, dataset version, and solver version.
- [x] Client and backend defaults have drift checks.

## Performance Path

- [x] Generated JSON index is the fast-read path.
- [x] App-level dogpile/Redis cache exists for GraphQL query responses.
- [x] Direct `buildDiscovery` app-cache hits return cached responses.
- [x] `startBuildDiscovery` returns app-cache hits synchronously as succeeded jobs.
- [x] `startBuildDiscovery` queues app-cache misses as persisted async jobs.
- [x] Local Compose has an RQ worker service for the default queue.
- [x] Docker smoke proves cache miss -> queued job -> enqueue intent -> direct worker-task success -> polling result after migrations are applied.
- [ ] Decide whether direct `buildDiscovery` should remain public/used, or become dev/legacy once async path is stable.

## Result Quality

- [x] Local Iop element/profile validation covers Strength, Intelligence, Chance, and Agility for 11/6/0 and 12/6/0.
- [x] First-build contract fixture checks importable item IDs, internal UUIDs, exos, base allocation, and AP/MP/Range targets.
- [x] Fresh local suite p95 remeasured against the latest Docker DB generated index.
- [ ] Fresh synchronous p95 is still above 5s for most local suite rows; keep app-cache misses on async path or optimize slow rows before serving fresh sync.
- [ ] Accepted benchmark artifacts still need to be produced and promoted to regression fixtures.
- [ ] Non-Iop generated queries remain unsupported until class modeling expands.

## Generated Build Data Cleanliness

- [x] Generated imports create `GenerationRequest` provenance.
- [x] Generated builds are visibly labeled in build cards.
- [x] Generated build list filtering exists.
- [x] Oneoff generated imports also create provenance.
- [x] Read-only generated data audit tooling exists.
- [ ] Decide retention/cleanup policy for generated custom sets if they become disposable job artifacts.

## Assumptions And Review

- [x] Reviewable assumptions ledger exists.
- [x] Budget tiers are documented as coarse availability assumptions, not market prices.
- [x] Special-effect assumptions are documented as approximate.
- [x] Async job assumptions are documented.
- [ ] User/gameplay review is still needed for budget tiers, Dofus availability, class defaults, special effects, and benchmark selections.

## Prod Benchmarks

- [x] Bounded read-only prod benchmark discovery helper exists.
- [ ] Environment access to `DOFUSLAB_READONLY_DATABASE_URL` is still missing in the host shell and running server container used here; use `--check-env` before prod discovery.
- [ ] Use prod aggregates to pick representative benchmark classes/levels/build profiles.
- [ ] Score discovered builds and compare generated outputs once supported classes are available.
