# Build Discovery v1 Scope Boundary

Last updated: 2026-07-09

Build Discovery v1 is intentionally scoped to level 200 PvM Iop builds for the
supported single-element profiles.

## Supported

- Class: `Iop`
- Level: `200`
- Mode: `pvm`
- Elements: one of `strength`, `intelligence`, `chance`, or `agility`
- Target profiles: current supported AP/MP/Range query contract

## Unsupported

Non-Iop generated queries are out of scope until class modeling expands. They
should be rejected clearly rather than returning low-confidence generated builds.

Existing coverage:

- `BuildDiscoveryQuery(class_name="Cra").validate()` raises `ValueError`.
- GraphQL `buildDiscovery(className: "Cra", ...)` returns an error containing
  `supports Iop only`.
- Client `BuildDiscoveryQueryInput.className` is narrowed to `Iop`.

## Expansion Requirement

Adding another class should be treated as a new modeling milestone. It needs
class-specific spell/damage assumptions, benchmark references, validation
profiles, and product review before generated builds for that class are exposed.
