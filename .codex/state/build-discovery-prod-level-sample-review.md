# Build Discovery Prod-Level Sample Review

Generated matrix: `.codex/state/build-discovery-prod-level-sample-matrix.json`

Checkpoint commits:

- `eccaff09` completed the 24-row generated matrix.
- `b88a0f8a` tightened split resume validation so stale/no-build split reports are not treated as complete missing-target evidence.

## Status

This packet is review input, not accepted benchmark evidence.

- Targets generated: `24 / 24`
- Matrix validation: passed
- Result diversity: not proven; each target currently records the top `1` generated build.
- Human/gameplay review: pending
- Benchmark promotion: pending

## Review Flags

- `L50 agility tier 1 7/3/1` took `945029.6ms` and should be treated as a search/performance diagnostic row before promotion.
- Several rows overshoot AP/MP/Range substantially under minimum-target semantics. This is valid, but needs gameplay review before becoming benchmark truth.
- Khardboard and related AP package patterns recur heavily across level bands. This may be correct under current availability/scoring assumptions, but it is a scoring-diversity review flag.
- The level 20 Intelligence `7/4/1` prod-shaped row is tier 3 because tier 1/no-exo did not generate under current v0 assumptions; the generated build uses an MP exo.
- These rows do not satisfy the product goal of returning 3-5 meaningfully different builds per query.

## Promotion Criteria

A row should not be promoted to an expensive regression fixture until:

- the generated items look plausible for the level, budget tier, and element
- surplus AP/MP/Range is either accepted as desirable or the target is changed
- the row has a stable benchmark expectation: exact item list, minimum score, or human/prod reference comparison
- runtime is either acceptable for the current milestone or explicitly marked as correctness-only evidence

## Row Summary

| Target | Actual | Primary / Vitality | Miss ms | Overshoot | Sets |
|---|---|---:|---:|---|---|
| L1 strength tier 1 6/3/any | 6/3/0 | Strength 129 / Vit 138 | 2640.2 |  | Boon Set x3 |
| L20 intelligence tier 3 7/4/1 | 7/4/1 | Intelligence 462 / Vit 205 | 3884.2 |  | Bearman Set x7 |
| L40 chance tier 1 7/3/any | 7/3/0 | Chance 432 / Vit 301 | 7298.7 |  | Microset x4 |
| L50 agility tier 1 7/3/1 | 7/6/3 | Agility 707 / Vit 521 | 945029.6 | +3 MP, +2 Range | Coco Blop Set x4, Khardboard Set x2 |
| L50 strength tier 2 8/4/1 | 8/4/2 | Strength 587 / Vit 696 | 89672.3 | +1 Range | Khardboard Set x2, Slump Set x2 |
| L60 intelligence tier 2 10/4/2 | 10/4/4 | Intelligence 652 / Vit 511 | 348830.8 | +2 Range | Rhineetleset x3, Khardboard Set x2, Jellix Set x2, Brrrbli Set x2 |
| L80 strength tier 2 9/5/any | 10/6/5 | Strength 826 / Vit 1052 | 257466.3 | +1 AP, +1 MP | Royal Pippin Blop Set x4, Khardboard Set x3 |
| L80 chance tier 2 10/5/1 | 10/6/5 | Chance 826 / Vit 1052 | 243525.9 | +1 MP, +4 Range | Royal Indigo Blop Set x4, Khardboard Set x3 |
| L80 agility tier 2 10/4/any | 10/6/4 | Agility 841 / Vit 1042 | 269420.6 | +2 MP | Royal Coco Blop Set x4, Khardboard Set x3 |
| L100 intelligence tier 2 10/4/1 | 11/6/3 | Intelligence 895 / Vit 960 | 341251.6 | +1 AP, +2 MP, +2 Range | Royal Rainbow Blop Set x4, Khardboard Set x3 |
| L100 agility tier 3 12/5/0 | 12/6/2 | Agility 805 / Vit 890 | 301533.9 | +1 MP, +2 Range | Simbadas Set x2, Khardboard Set x4 |
| L120 chance tier 2 11/5/any | 11/6/4 | Chance 1123 / Vit 1911 | 221901.0 | +1 MP | Khardboard Set x3, Ancestral Set x5 |
| L120 strength tier 3 12/5/1 | 12/6/4 | Strength 1068 / Vit 1501 | 288581.2 | +1 MP, +3 Range | Saurosheller Set x3, Khardboard Set x3 |
| L130 agility tier 3 12/5/1 | 12/5/3 | Agility 1061 / Vit 1451 | 261802.3 | +2 Range | Khardboard Set x4, Vagabond Dreggon Set x3 |
| L150 strength tier 1 9/4/2 | 10/4/2 | Strength 1251 / Vit 2071 | 403880.4 | +1 AP | Katigger Set x3, Transplent Set x3, Moowolf Set x2 |
| L160 strength tier 3 12/5/2 | 12/5/4 | Strength 1123 / Vit 1413 | 491233.7 | +2 Range | Transplent Set x3, Royal Pingwin Set x3, Cantile Set x3 |
| L160 intelligence tier 3 12/5/any | 12/5/4 | Intelligence 1238 / Vit 2233 | 300438.9 |  | Hell Mina Set x3, Khardboard Set x3, Minotot Set x3 |
| L160 chance tier 2 10/4/0 | 10/4/3 | Chance 1238 / Vit 1292 | 355247.8 | +3 Range | Katigger Set x3, Transplent Set x3 |
| L165 intelligence tier 3 12/6/2 | 12/6/3 | Intelligence 1285 / Vit 2170 | 266400.4 | +1 Range | Buck Anear Set x3, Obsidemon Set x3, Khardboard Set x3 |
| L180 agility tier 4 12/5/5 | 12/5/5 | Agility 1203 / Vit 2033 | 70284.7 |  | YeCh'Ti Set x3, Celestial Swashbuckler Set x3, Sovereign Set x2 |
| L200 strength tier 4 12/6/3 | 12/6/4 | Strength 1488 / Vit 3853 | 166969.8 | +1 Range | Sleeping Venerable One Set x2, Bleeding Heart Set x3, Corruption Set x3 |
| L200 intelligence tier 4 12/6/4 | 12/6/4 | Intelligence 1378 / Vit 3203 | 171490.9 |  | Age-Old Set x3, Atcham Set x2, War Set x3 |
| L200 chance tier 4 12/5/6 | 12/5/6 | Chance 1278 / Vit 3503 | 170407.9 |  | Danathor Set x3, Tritun Set x2, Pit Set x3 |
| L200 agility tier 4 11/6/5 | 11/6/5 | Agility 1323 / Vit 3253 | 160405.9 |  | Allister Set x3, Voldelor Set x3, Abyss Set x2 |
