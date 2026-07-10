# Prod Level 200 Iop Benchmark Sample

Source: `.codex/state/build-discovery-prod-level200-iop-benchmark-sample150.json`

Bounded read-only aggregate query against recent prod level-200 Iop `custom_set` rows.

Rows: `150`
Sample limit: `150`
Statement timeout: `5000 ms`

## Caveats

- custom_set has no explicit popularity metric in the local model, so sampleCount means frequency within the bounded recent level-200 sample.
- dominant element is inferred from base/scrolled points plus equipped item primary stats.
- AP/MP buckets add base character AP/MP to equipped item max stats, recorded exos, and exact active set bonuses.
- Range buckets use equipped item max stats, recorded exos, and exact active set bonuses.
- Report output is aggregate-only and intentionally omits custom set IDs, names, and owner identifiers.
- generatedQueryCandidate marks whether the aggregate profile can be compared with the current v1 generator.
- Recent rows are not necessarily good builds or complete builds.
- Profiles with AP/MP/Range at base values likely represent incomplete/default custom sets and should not become quality benchmarks.

## Profiles

| Class | Element | AP/MP/Range | Samples | Generated query? | Common items |
|---|---|---:|---:|---|---|
| Iop | strength | 7/3/0 | 35 | yes | Corruption Pestilence (1), Scissors of Destiny (1) |
| Iop | strength | 12/6/4 | 8 | yes | Turquoise Dofus (8), Ochre Dofus (7), Ice Dofus (6), Crimson Dofus (6), King Playa Crown (5), King Playa Signet Ring (5) |
| Iop | strength | 12/6/5 | 6 | yes | Crimson Dofus (6), Ochre Dofus (5), Ice Dofus (5), Vulbis Dofus (4), Turquoise Dofus (4), Count Harebourg's Hat (3) |
| Iop | strength | 12/6/3 | 6 | yes | Ochre Dofus (6), Crimson Dofus (5), Turquoise Dofus (5), Ice Dofus (4), Corruption's Ring (3), Corruption's Brambelt (3) |
| Iop | agility | 12/5/6 | 5 | yes | Jammy Jack Collar (5), Jammy Jack Glove (5), Psychopump Glove (5), Psychopump Needle (5), Psychopump Button (5), Ivory Dofus (5) |
| Iop | strength | 12/6/2 | 4 | yes | Crimson Dofus (4), Mama Ayuto's Bandana (3), Mama Ayuto's Parasail (3), Turquoise Dofus (3), Corruption's Engagement Ring (2), Corruption's Ring (2) |
| Iop | intelligence | 11/6/5 | 3 | yes | Crimson Dofus (3), Age-Old Helmet (2), Atcham Cape (2), Age-Old Amulet (2), Bearbaric Band (2), Professor Xa's Ring (2) |
| Iop | strength | 12/5/3 | 3 | yes | Ochre Dofus (3), Turquoise Dofus (3), Ice Dofus (2), Dolmanax (2), Abyssal Dofus (2), Corruption's Engagement Ring (2) |
| Iop | strength | 12/5/4 | 3 | yes | Ochre Dofus (3), Ice Dofus (3), Crimson Dofus (3), Treadfast Belt (2), Abyssal Dofus (2), Cycloid Ring (2) |

## Initial Interpretation

- The strongest benchmark candidates in this bounded sample are non-base profiles with repeated common items.
- Strength Iop profiles around 12/6/4 and 12/6/3 appear repeatedly and include familiar opti items such as Crimson, Turquoise, Ochre, Ice, Vulbis, Broucey, and Corruption pieces.
- This sample should guide benchmark selection, but exact benchmark fixtures still need human review because recent saved sets can include incomplete or experimental builds.
