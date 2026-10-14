# GraphQL mutation regression inventory

The integration tests in this directory send HTTP requests to `/api/graphql`
through Flask's application test client. They use the migrated, committed-data
seed in disposable PostgreSQL 14.1 and Redis 6.2 services. ORM calls are used
only to arrange deterministic fixtures or verify persisted state; resolver
behavior is exercised through the real GraphQL schema.

Outbound email is replaced at the RQ enqueue boundary, throttling is disabled,
and all generated accounts/builds are synthetic and removed after each test.

| Mutation | Happy path | Anonymous/auth | Ownership/error/integrity |
| --- | --- | --- | --- |
| `registerUser` | creates user/settings and logs in | anonymous required | invalid input and queue failure rollback |
| `loginUser` | session login and anonymous-build claim | anonymous required | bad password |
| `logoutUser` | clears login | idempotent path exercised | re-login round trip |
| `createCustomSet` | defaults and stats returned | anonymous + verified user | unverified guard is a remaining case |
| `editCustomSetStats` | all stat fields persist | anonymous owner | range rejection, rollback, cross-user denial |
| `editCustomSetMetadata` | name/level persist | anonymous owner | invalid level rollback, missing build, cross-user denial |
| `editCustomSetDefaultClass` | class/gender persist | anonymous owner | cross-user denial |
| `updateCustomSetItem` | item/slot persist | anonymous owner | customization reset, cross-user denial |
| `equipSet` | **known defect / xfail** | ownership gate covered | resolver passes model rows where mappings are required |
| `addTagToCustomSet` | association persists | anonymous owner | cross-user denial |
| `removeTagFromCustomSet` | association removed | anonymous owner | cross-user denial |
| `equipMultipleItems` | seeded item persists | anonymous owner | cross-user denial |
| `mageEquippedItem` | stats and damage/healing conversions persist | anonymous owner | copy/replace integrity, cross-user denial |
| `setEquippedItemExo` | AP shortcut persists | anonymous owner | invalid stat rollback, missing item, cross-user denial |
| `deleteCustomSetItem` | equipment removed | anonymous owner | cross-user denial |
| `copyCustomSet` | metadata/equipment/mages/exos copied | public source into anonymous session | parent link and session edit capability |
| `restartCustomSet` | equipment/stats reset | anonymous owner | cross-user denial |
| `deleteCustomSet` | row removed | anonymous owner | cross-user denial |
| `importCustomSet` | stats/item/exo persist | verified required | anonymous rejection |
| `resendVerificationEmail` | inert enqueue asserted | unverified login required | anonymous and verified rejection paths |
| `changeLocale` | preference/read query round trip | anonymous + login paths | unsupported locale is a remaining case |
| `changeClassic` | preference/read query round trip | anonymous + login paths | persisted user setting covered |
| `changePassword` | password/login round trip | authenticated required | wrong password |
| `requestPasswordReset` | inert enqueue asserted | anonymous required | unknown/unverified email are remaining cases |
| `resetPassword` | signed token/password/login round trip | anonymous required | invalid token |
| `toggleFavoriteItem` | add and persisted row | authenticated required | anonymous rejection; limit is a remaining case |
| `editBuildSettings` | class/gender persist | authenticated required | anonymous rejection is a remaining case |
| `changeProfilePicture` | allow-listed path persists | authenticated required | invalid path and anonymous boundary |

## Session and read-query coverage

- An anonymous build is stored in PostgreSQL with `owner_id = NULL`.
- Redis-backed Flask-Session stores `owned_custom_sets`, the UUID capability used
  by `get_or_create_custom_set` and `check_owner` to authorize anonymous edits.
- A second/fresh session can read the build by UUID but cannot edit it.
- A known public build can be copied into the fresh anonymous session, and
  login claims the current session's anonymous builds for durable ownership.
- Representative `customSetById`, `locale`, `classic`, `itemSlots`, `classes`,
  user settings, favorites, equipment, stats, tags, and exos read fields are
  exercised after mutations.

## Known defect and remaining gaps

`equipSet` currently calls `ModelCustomSet.equip_items(set_obj.items, ...)`, but
`equip_items` expects mapping objects and calls `.get("item")`. A seeded real
set therefore raises `AttributeError: 'ModelItem' object has no attribute
'get'`. The desired happy-path test is strict-xfailed; production code is not
changed in this testing PR.

The highest-value next cases are unverified-user guards across build mutations,
favorite-limit behavior, duplicate tags, incompatible item/slot validation,
missing catalog IDs for set/tag/item mutations, rate-limit behavior, and more
query pagination/filter contracts. These are intentionally listed rather than
encoded as desirable behavior where current error handling leaks internal
exceptions.
