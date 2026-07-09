# Build Discovery Generated Data Retention

Last updated: 2026-07-09

This is the current retention policy for generated Build Discovery data.

## Policy

Generated Build Discovery data has two different lifetimes:

1. Generated preview/job output is disposable execution data.
2. Imported generated custom sets are user-owned saved builds.

Once a generated build is imported into a `custom_set`, it should be treated like
other user-authored custom sets. It must not be automatically deleted by cache,
job, or benchmark cleanup. Its `GenerationRequest` row is durable provenance and
should be retained for as long as the custom set exists.

## Cleanup Boundaries

- Safe to prune later:
  - old `build_discovery_job` rows and embedded result payloads, after product chooses a retention window
  - app-cache/Redis Build Discovery response entries
  - process-local/generated benchmark JSON artifacts under `/tmp`
- Not safe to prune automatically:
  - `custom_set` rows created from generated imports
  - `generation_request` rows attached to existing custom sets
  - custom set item/stat rows belonging to a generated import

## Orphans And Legacy Rows

The generated data audit should remain read-only by default. If future cleanup is
added, it should start with explicit dry-run output and target only rows proven
not to be user-owned saved builds:

- orphan `generation_request` rows whose `custom_set_id` no longer exists
- duplicate `generation_request` rows for one custom set, after choosing which
  provenance record is canonical
- generated-looking legacy custom sets without `GenerationRequest` should be
  audit/backfill/classification candidates only; deletion requires an explicit
  user-owned-build deletion policy or proof that the row is not user data

## Product Implication

Generated custom sets are not disposable job artifacts. The disposable artifact
is the recommendation result before import. Importing is the user action that
promotes a generated recommendation into saved data.
