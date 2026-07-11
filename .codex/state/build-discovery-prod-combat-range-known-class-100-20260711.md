# Prod Combat Range Known-Class Sample - 2026-07-11

Filters: complete level-200 custom sets, known/default class required, updated since 2025-07-11, recent candidate limit 1200, sample size 100.
Privacy: includes custom set links at user request; omits owner IDs and custom set names. Caveat: generated rows cannot be excluded because prod has no generation_request provenance table yet.

Classifier note: +Range is deliberately weak; it is a tradeoff/stat hint, not treated as primary intent. AP/MP shown below are level-200 totals: item AP/MP plus base 7 AP / 3 MP.

## Summary

```json
{
  "sampleSize": 100,
  "filters": {
    "level": 200,
    "completeSlotsAtLeast": 16,
    "knownClassRequired": true,
    "updatedSince": "2025-07-11",
    "candidateLimit": 1200,
    "sampleLimit": 100
  },
  "classes": {
    "Cra": 21,
    "Iop": 10,
    "Eniripsa": 4,
    "Sacrier": 1,
    "Ecaflip": 5,
    "Masqueraider": 4,
    "Enutrof": 13,
    "Sram": 7,
    "Eliotrope": 5,
    "Feca": 8,
    "Forgelance": 3,
    "Foggernaut": 6,
    "Pandawa": 6,
    "Rogue": 1,
    "Huppermage": 3,
    "Ouginak": 1,
    "Sadida": 2
  },
  "elementClasses": {
    "omni": 24,
    "multi": 38,
    "intelligence": 14,
    "strength": 6,
    "chance": 10,
    "agility": 8
  },
  "combatRangeClasses": {
    "melee": 58,
    "ranged": 42
  },
  "rangeBucketsByCombatRange": {
    "melee": {
      "count": 58,
      "avg": 3.17,
      "min": -1.0,
      "max": 6.0,
      "ge3": 41,
      "ge6": 4
    },
    "ranged": {
      "count": 42,
      "avg": 2.98,
      "min": -1.0,
      "max": 6.0,
      "ge3": 26,
      "ge6": 2
    }
  }
}
```

## Interesting Rows

- [001] https://dofuslab.io/en/view/8883e23f-1597-44be-9edf-72e0e9e78449/ - Cra, omni, melee (2.10/5.00); AP/MP/Range 10/5/6; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 6 Range weak signal; Sword weapon
- [002] https://dofuslab.io/en/view/d43acd37-352b-4f40-baab-2d51af05d54e/ - Iop, omni, ranged (6.40/0.00); AP/MP/Range 9/5/4; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Bow weapon
- [003] https://dofuslab.io/en/view/f149a697-0aa4-4319-b7ea-ace31ceb00c7/ - Cra, multi, ranged (8.75/0.00); AP/MP/Range 10/5/5; weapon Bow; rd=0, md=0, wd=0, sd=8.0; why: 5 Range weak signal; Bow weapon; % spell damage supports ranged weapon
- [004] https://dofuslab.io/en/view/558e4e53-e490-4947-a360-64b7939641ab/ - Cra, multi, ranged (8.40/0.00); AP/MP/Range 10/4/4; weapon Wand; rd=0, md=0, wd=6.0, sd=0; why: 4 Range weak signal; Wand weapon; % weapon damage supports ranged weapon
- [005] https://dofuslab.io/en/view/f132d5e1-3138-49cd-ad5c-1b104b906ba0/ - Eniripsa, intelligence, melee (0.35/5.00); AP/MP/Range 9/5/1; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 1 Range weak signal; Sword weapon
- [007] https://dofuslab.io/en/view/092849d0-f5f7-4cb2-8880-3fa9b579b293/ - Iop, strength, ranged (19.70/0.00); AP/MP/Range 10/5/2; weapon Wand; rd=6.0, md=0, wd=0, sd=10.0; why: 6% ranged damage; 2 Range weak signal; Wand weapon; % spell damage supports ranged weapon
- [008] https://dofuslab.io/en/view/e8dd2a3b-254f-47f2-b9a3-179d3c2cc3ff/ - Iop, strength, ranged (19.70/0.00); AP/MP/Range 10/5/2; weapon Wand; rd=6.0, md=0, wd=0, sd=10.0; why: 6% ranged damage; 2 Range weak signal; Wand weapon; % spell damage supports ranged weapon
- [009] https://dofuslab.io/en/view/6988957e-5ff9-466f-b6d3-b3b340f7d5d2/ - Sacrier, intelligence, ranged (5.00/0.00); AP/MP/Range 10/4/0; weapon Wand; rd=0, md=0, wd=0, sd=0; why: Wand weapon
- [011] https://dofuslab.io/en/view/c2185eab-869b-4f77-a7a9-1f9054cb2bea/ - Iop, omni, melee (1.05/5.00); AP/MP/Range 10/4/3; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Hammer weapon
- [012] https://dofuslab.io/en/view/2e811911-b3e7-4c0b-8d1b-e12e8dd1c679/ - Ecaflip, intelligence, melee (0.35/5.00); AP/MP/Range 10/5/1; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 1 Range weak signal; Hammer weapon
- [013] https://dofuslab.io/en/view/df603fac-c0b3-446b-b590-122be198f3fa/ - Masqueraider, multi, ranged (6.05/0.00); AP/MP/Range 9/5/3; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Bow weapon
- [015] https://dofuslab.io/en/view/646cec81-673b-49c8-a9d3-8fb7c734a74b/ - Cra, multi, melee (1.05/5.00); AP/MP/Range 9/5/3; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Sword weapon
- [017] https://dofuslab.io/en/view/94d94578-f654-4933-a7dd-e52e58aa3a1f/ - Iop, omni, melee (0.00/5.00); AP/MP/Range 9/5/-1; weapon Sword; rd=0, md=0, wd=0, sd=0; why: Sword weapon
- [018] https://dofuslab.io/en/view/7b32dcd0-220a-42b7-a988-8404af448e57/ - Sram, multi, ranged (5.70/0.00); AP/MP/Range 9/5/2; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Bow weapon
- [019] https://dofuslab.io/en/view/720f91b2-589d-4eca-b1f2-ba6064bdb346/ - Cra, multi, melee (0.35/5.00); AP/MP/Range 9/5/1; weapon Dagger; rd=0, md=0, wd=0, sd=0; why: 1 Range weak signal; Dagger weapon
- [020] https://dofuslab.io/en/view/a8868b67-82bb-492c-abfd-c752fe019822/ - Cra, multi, melee (1.75/5.00); AP/MP/Range 9/4/5; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 5 Range weak signal; Hammer weapon
- [021] https://dofuslab.io/en/view/2b25ffaf-1b46-4a70-ba3d-68c8f845922b/ - Masqueraider, multi, ranged (6.05/0.00); AP/MP/Range 8/4/3; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Bow weapon
- [022] https://dofuslab.io/en/view/fed685f8-6c8c-4aa4-889e-65228a590ee5/ - Cra, multi, melee (2.10/5.00); AP/MP/Range 10/4/6; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 6 Range weak signal; Hammer weapon
- [024] https://dofuslab.io/en/view/b30f68f6-4529-419f-98dc-24c12b6033c1/ - Cra, multi, melee (1.05/5.00); AP/MP/Range 9/6/3; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Hammer weapon
- [025] https://dofuslab.io/en/view/2440b2ab-9c7b-43a4-b451-e421413cf427/ - Cra, multi, melee (1.40/5.00); AP/MP/Range 10/4/4; weapon Hammer; rd=0, md=0, wd=0, sd=6.0; why: 4 Range weak signal; Hammer weapon
- [026] https://dofuslab.io/en/view/0fa0a634-b428-4007-b4f1-0eddb1f673fa/ - Cra, multi, ranged (18.40/0.00); AP/MP/Range 9/5/4; weapon Bow; rd=6.0, md=0, wd=0, sd=0; why: 6% ranged damage; 4 Range weak signal; Bow weapon
- [027] https://dofuslab.io/en/view/525c52ba-6aec-41f5-b252-84be646222c3/ - Enutrof, chance, melee (2.10/5.00); AP/MP/Range 10/5/6; weapon Dagger; rd=0, md=0, wd=0, sd=0; why: 6 Range weak signal; Dagger weapon
- [028] https://dofuslab.io/en/view/98228200-4e6b-4650-a53d-9b87eb071da0/ - Sram, intelligence, melee (0.35/5.00); AP/MP/Range 9/4/1; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 1 Range weak signal; Sword weapon
- [030] https://dofuslab.io/en/view/46a9b4bb-0504-4eee-91ae-2c2583f3cf80/ - Feca, omni, melee (1.75/5.00); AP/MP/Range 10/6/5; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 5 Range weak signal; Sword weapon
- [031] https://dofuslab.io/en/view/8b2fa7ba-cfc9-4ea6-8a8d-e2562d37a625/ - Forgelance, multi, ranged (6.40/0.00); AP/MP/Range 9/5/4; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Bow weapon
- [032] https://dofuslab.io/en/view/2d602c5b-4e4a-4dd0-bce0-46110ce8347d/ - Cra, multi, melee (1.75/5.00); AP/MP/Range 9/6/5; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 5 Range weak signal; Hammer weapon
- [033] https://dofuslab.io/en/view/aec33c65-8911-4058-9fa4-c8a197569228/ - Cra, omni, melee (1.05/5.00); AP/MP/Range 9/5/3; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Hammer weapon
- [034] https://dofuslab.io/en/view/59a574b7-12f0-4ebb-a33f-a64c69f37c19/ - Cra, omni, melee (0.70/5.00); AP/MP/Range 9/5/2; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Hammer weapon
- [035] https://dofuslab.io/en/view/a7ce7f9f-8c0a-4255-8f0b-66c557e2ce59/ - Masqueraider, multi, ranged (1.40/0.00); AP/MP/Range 9/6/4; weapon unknown; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal
- [036] https://dofuslab.io/en/view/b04263ba-90ca-491a-9746-82b95e9921d6/ - Enutrof, omni, melee (1.40/5.00); AP/MP/Range 9/5/4; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Sword weapon

## All Rows

- [001] https://dofuslab.io/en/view/8883e23f-1597-44be-9edf-72e0e9e78449/ - Cra, omni, melee (2.10/5.00); AP/MP/Range 10/5/6; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 6 Range weak signal; Sword weapon
- [002] https://dofuslab.io/en/view/d43acd37-352b-4f40-baab-2d51af05d54e/ - Iop, omni, ranged (6.40/0.00); AP/MP/Range 9/5/4; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Bow weapon
- [003] https://dofuslab.io/en/view/f149a697-0aa4-4319-b7ea-ace31ceb00c7/ - Cra, multi, ranged (8.75/0.00); AP/MP/Range 10/5/5; weapon Bow; rd=0, md=0, wd=0, sd=8.0; why: 5 Range weak signal; Bow weapon; % spell damage supports ranged weapon
- [004] https://dofuslab.io/en/view/558e4e53-e490-4947-a360-64b7939641ab/ - Cra, multi, ranged (8.40/0.00); AP/MP/Range 10/4/4; weapon Wand; rd=0, md=0, wd=6.0, sd=0; why: 4 Range weak signal; Wand weapon; % weapon damage supports ranged weapon
- [005] https://dofuslab.io/en/view/f132d5e1-3138-49cd-ad5c-1b104b906ba0/ - Eniripsa, intelligence, melee (0.35/5.00); AP/MP/Range 9/5/1; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 1 Range weak signal; Sword weapon
- [006] https://dofuslab.io/en/view/08289bbb-d5b0-428b-874c-5858d51a9b8c/ - Eniripsa, intelligence, ranged (6.05/0.00); AP/MP/Range 10/5/3; weapon Wand; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Wand weapon
- [007] https://dofuslab.io/en/view/092849d0-f5f7-4cb2-8880-3fa9b579b293/ - Iop, strength, ranged (19.70/0.00); AP/MP/Range 10/5/2; weapon Wand; rd=6.0, md=0, wd=0, sd=10.0; why: 6% ranged damage; 2 Range weak signal; Wand weapon; % spell damage supports ranged weapon
- [008] https://dofuslab.io/en/view/e8dd2a3b-254f-47f2-b9a3-179d3c2cc3ff/ - Iop, strength, ranged (19.70/0.00); AP/MP/Range 10/5/2; weapon Wand; rd=6.0, md=0, wd=0, sd=10.0; why: 6% ranged damage; 2 Range weak signal; Wand weapon; % spell damage supports ranged weapon
- [009] https://dofuslab.io/en/view/6988957e-5ff9-466f-b6d3-b3b340f7d5d2/ - Sacrier, intelligence, ranged (5.00/0.00); AP/MP/Range 10/4/0; weapon Wand; rd=0, md=0, wd=0, sd=0; why: Wand weapon
- [010] https://dofuslab.io/en/view/25d33a90-81a5-4df5-aad8-21d9bcc91025/ - Cra, strength, melee (1.05/5.00); AP/MP/Range 9/5/3; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Hammer weapon
- [011] https://dofuslab.io/en/view/c2185eab-869b-4f77-a7a9-1f9054cb2bea/ - Iop, omni, melee (1.05/5.00); AP/MP/Range 10/4/3; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Hammer weapon
- [012] https://dofuslab.io/en/view/2e811911-b3e7-4c0b-8d1b-e12e8dd1c679/ - Ecaflip, intelligence, melee (0.35/5.00); AP/MP/Range 10/5/1; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 1 Range weak signal; Hammer weapon
- [013] https://dofuslab.io/en/view/df603fac-c0b3-446b-b590-122be198f3fa/ - Masqueraider, multi, ranged (6.05/0.00); AP/MP/Range 9/5/3; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Bow weapon
- [014] https://dofuslab.io/en/view/4fad0035-3404-4779-9ff5-24c22188a0ca/ - Enutrof, chance, melee (1.40/5.00); AP/MP/Range 8/5/4; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Sword weapon
- [015] https://dofuslab.io/en/view/646cec81-673b-49c8-a9d3-8fb7c734a74b/ - Cra, multi, melee (1.05/5.00); AP/MP/Range 9/5/3; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Sword weapon
- [016] https://dofuslab.io/en/view/4de972a4-b340-49a9-a2c1-3575c74f7c9c/ - Ecaflip, intelligence, melee (1.05/5.00); AP/MP/Range 9/5/3; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Sword weapon
- [017] https://dofuslab.io/en/view/94d94578-f654-4933-a7dd-e52e58aa3a1f/ - Iop, omni, melee (0.00/5.00); AP/MP/Range 9/5/-1; weapon Sword; rd=0, md=0, wd=0, sd=0; why: Sword weapon
- [018] https://dofuslab.io/en/view/7b32dcd0-220a-42b7-a988-8404af448e57/ - Sram, multi, ranged (5.70/0.00); AP/MP/Range 9/5/2; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Bow weapon
- [019] https://dofuslab.io/en/view/720f91b2-589d-4eca-b1f2-ba6064bdb346/ - Cra, multi, melee (0.35/5.00); AP/MP/Range 9/5/1; weapon Dagger; rd=0, md=0, wd=0, sd=0; why: 1 Range weak signal; Dagger weapon
- [020] https://dofuslab.io/en/view/a8868b67-82bb-492c-abfd-c752fe019822/ - Cra, multi, melee (1.75/5.00); AP/MP/Range 9/4/5; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 5 Range weak signal; Hammer weapon
- [021] https://dofuslab.io/en/view/2b25ffaf-1b46-4a70-ba3d-68c8f845922b/ - Masqueraider, multi, ranged (6.05/0.00); AP/MP/Range 8/4/3; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Bow weapon
- [022] https://dofuslab.io/en/view/fed685f8-6c8c-4aa4-889e-65228a590ee5/ - Cra, multi, melee (2.10/5.00); AP/MP/Range 10/4/6; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 6 Range weak signal; Hammer weapon
- [023] https://dofuslab.io/en/view/3892a4cc-4a80-4b3d-a430-62dcca8274fe/ - Eliotrope, chance, ranged (8.40/0.00); AP/MP/Range 10/5/4; weapon Bow; rd=0, md=0, wd=0, sd=4.0; why: 4 Range weak signal; Bow weapon; % spell damage supports ranged weapon
- [024] https://dofuslab.io/en/view/b30f68f6-4529-419f-98dc-24c12b6033c1/ - Cra, multi, melee (1.05/5.00); AP/MP/Range 9/6/3; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Hammer weapon
- [025] https://dofuslab.io/en/view/2440b2ab-9c7b-43a4-b451-e421413cf427/ - Cra, multi, melee (1.40/5.00); AP/MP/Range 10/4/4; weapon Hammer; rd=0, md=0, wd=0, sd=6.0; why: 4 Range weak signal; Hammer weapon
- [026] https://dofuslab.io/en/view/0fa0a634-b428-4007-b4f1-0eddb1f673fa/ - Cra, multi, ranged (18.40/0.00); AP/MP/Range 9/5/4; weapon Bow; rd=6.0, md=0, wd=0, sd=0; why: 6% ranged damage; 4 Range weak signal; Bow weapon
- [027] https://dofuslab.io/en/view/525c52ba-6aec-41f5-b252-84be646222c3/ - Enutrof, chance, melee (2.10/5.00); AP/MP/Range 10/5/6; weapon Dagger; rd=0, md=0, wd=0, sd=0; why: 6 Range weak signal; Dagger weapon
- [028] https://dofuslab.io/en/view/98228200-4e6b-4650-a53d-9b87eb071da0/ - Sram, intelligence, melee (0.35/5.00); AP/MP/Range 9/4/1; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 1 Range weak signal; Sword weapon
- [029] https://dofuslab.io/en/view/fde610f6-7a3a-47a4-b497-5c9d0795cc97/ - Sram, intelligence, melee (0.70/5.00); AP/MP/Range 10/4/2; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Sword weapon
- [030] https://dofuslab.io/en/view/46a9b4bb-0504-4eee-91ae-2c2583f3cf80/ - Feca, omni, melee (1.75/5.00); AP/MP/Range 10/6/5; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 5 Range weak signal; Sword weapon
- [031] https://dofuslab.io/en/view/8b2fa7ba-cfc9-4ea6-8a8d-e2562d37a625/ - Forgelance, multi, ranged (6.40/0.00); AP/MP/Range 9/5/4; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Bow weapon
- [032] https://dofuslab.io/en/view/2d602c5b-4e4a-4dd0-bce0-46110ce8347d/ - Cra, multi, melee (1.75/5.00); AP/MP/Range 9/6/5; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 5 Range weak signal; Hammer weapon
- [033] https://dofuslab.io/en/view/aec33c65-8911-4058-9fa4-c8a197569228/ - Cra, omni, melee (1.05/5.00); AP/MP/Range 9/5/3; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Hammer weapon
- [034] https://dofuslab.io/en/view/59a574b7-12f0-4ebb-a33f-a64c69f37c19/ - Cra, omni, melee (0.70/5.00); AP/MP/Range 9/5/2; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Hammer weapon
- [035] https://dofuslab.io/en/view/a7ce7f9f-8c0a-4255-8f0b-66c557e2ce59/ - Masqueraider, multi, ranged (1.40/0.00); AP/MP/Range 9/6/4; weapon unknown; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal
- [036] https://dofuslab.io/en/view/b04263ba-90ca-491a-9746-82b95e9921d6/ - Enutrof, omni, melee (1.40/5.00); AP/MP/Range 9/5/4; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Sword weapon
- [037] https://dofuslab.io/en/view/d717f28f-fa71-4584-b446-a69a237735dc/ - Enutrof, chance, melee (1.40/5.00); AP/MP/Range 8/5/4; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Sword weapon
- [038] https://dofuslab.io/en/view/6ca3a4cd-f4d1-47bf-9aeb-7c52445619b7/ - Enutrof, chance, melee (1.40/5.00); AP/MP/Range 8/5/4; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Sword weapon
- [039] https://dofuslab.io/en/view/05a7950a-cca6-4296-be3f-4e0557979f29/ - Enutrof, chance, ranged (6.40/0.00); AP/MP/Range 9/5/4; weapon Wand; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Wand weapon
- [040] https://dofuslab.io/en/view/51d344ca-7b58-46b9-89bc-ae4874a107f9/ - Enutrof, chance, melee (1.40/5.00); AP/MP/Range 9/5/4; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Sword weapon
- [041] https://dofuslab.io/en/view/60a8efa0-f189-4ce9-9f30-db7d8aa448f3/ - Feca, omni, melee (0.00/5.00); AP/MP/Range 9/4/0; weapon Sword; rd=0, md=0, wd=0, sd=0; why: Sword weapon
- [042] https://dofuslab.io/en/view/ba5cedb3-53ea-4c2c-92fe-78255fc045a5/ - Enutrof, multi, melee (1.40/5.00); AP/MP/Range 8/5/4; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Sword weapon
- [043] https://dofuslab.io/en/view/8dfbd1a7-4d4a-4de9-ab2a-7ccad0e2416b/ - Foggernaut, agility, melee (1.75/5.00); AP/MP/Range 9/6/5; weapon Axe; rd=0, md=0, wd=0, sd=0; why: 5 Range weak signal; Axe weapon
- [044] https://dofuslab.io/en/view/d5fb650f-b450-4f60-83f5-03b470491302/ - Iop, multi, ranged (5.00/0.00); AP/MP/Range 9/5/0; weapon Bow; rd=0, md=0, wd=0, sd=0; why: Bow weapon
- [045] https://dofuslab.io/en/view/0220b193-255e-40d3-b56a-dcfd70789325/ - Feca, omni, melee (0.35/5.00); AP/MP/Range 9/4/1; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 1 Range weak signal; Sword weapon
- [046] https://dofuslab.io/en/view/8f02767d-fa49-40f8-b390-04642f966216/ - Foggernaut, agility, melee (1.40/5.00); AP/MP/Range 9/5/4; weapon Axe; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Axe weapon
- [047] https://dofuslab.io/en/view/807e9c14-cad6-4e6f-9ea8-74b11672ad08/ - Feca, multi, melee (1.40/5.00); AP/MP/Range 10/5/4; weapon Axe; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Axe weapon
- [048] https://dofuslab.io/en/view/07a879f7-c689-4e93-95e5-aece93b0cd4d/ - Pandawa, agility, melee (1.05/5.00); AP/MP/Range 10/5/3; weapon Staff; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Staff weapon
- [049] https://dofuslab.io/en/view/7df102eb-d6f6-41aa-abe7-a3f2eb2b5163/ - Feca, multi, melee (0.70/5.00); AP/MP/Range 9/6/2; weapon Shovel; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Shovel weapon
- [050] https://dofuslab.io/en/view/4224d477-4ce5-4216-9126-07460370f2b0/ - Enutrof, chance, ranged (6.40/0.00); AP/MP/Range 10/5/4; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Bow weapon
- [051] https://dofuslab.io/en/view/0257a447-73c1-48fb-a8c6-e4fba7b89316/ - Sram, strength, melee (1.05/7.00); AP/MP/Range 9/5/3; weapon Dagger; rd=0, md=0, wd=10.0, sd=-5.0; why: 3 Range weak signal; Dagger weapon; % weapon damage supports melee weapon
- [052] https://dofuslab.io/en/view/1cde801a-35cb-42e5-95a4-425081a81e2f/ - Ecaflip, multi, ranged (5.00/0.00); AP/MP/Range 10/6/-1; weapon Bow; rd=0, md=0, wd=0, sd=0; why: Bow weapon
- [053] https://dofuslab.io/en/view/24c8a089-73e6-4d3b-bece-7c0cf73d6033/ - Sram, multi, melee (1.40/5.00); AP/MP/Range 8/5/4; weapon Scythe; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Scythe weapon
- [054] https://dofuslab.io/en/view/788cb0b2-af6d-41fc-a602-ce3bf5dc9bc4/ - Cra, multi, ranged (6.40/0.00); AP/MP/Range 8/5/4; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Bow weapon
- [055] https://dofuslab.io/en/view/d17e5eeb-1f21-4b16-ad39-8c93f4d5b02b/ - Sram, multi, ranged (6.40/0.00); AP/MP/Range 9/5/4; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Bow weapon
- [056] https://dofuslab.io/en/view/f720cf90-92e6-4cac-9d0e-2f6cff7e284b/ - Rogue, intelligence, melee (1.05/5.00); AP/MP/Range 10/4/3; weapon Staff; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Staff weapon
- [057] https://dofuslab.io/en/view/11a74e19-7855-4211-a093-2a389238038f/ - Huppermage, multi, ranged (6.40/0.00); AP/MP/Range 9/5/4; weapon Wand; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Wand weapon
- [058] https://dofuslab.io/en/view/63be40c8-0b06-4497-a29b-20c94ae28b06/ - Huppermage, omni, ranged (6.05/0.00); AP/MP/Range 9/5/3; weapon Wand; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Wand weapon
- [059] https://dofuslab.io/en/view/8d8975c9-dd8c-4e2b-baa8-dd8fa27f5ec0/ - Huppermage, omni, melee (2.10/5.00); AP/MP/Range 9/6/6; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 6 Range weak signal; Hammer weapon
- [060] https://dofuslab.io/en/view/fc3b0912-c02c-43da-bb70-017a780625ab/ - Pandawa, agility, melee (0.70/5.00); AP/MP/Range 9/4/2; weapon Scythe; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Scythe weapon
- [061] https://dofuslab.io/en/view/67bfb6c6-da2c-4e4d-bedc-a37cecdf84f3/ - Pandawa, agility, melee (1.05/5.00); AP/MP/Range 9/5/3; weapon Axe; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Axe weapon
- [062] https://dofuslab.io/en/view/1713aba2-0394-42c3-b2e8-19575fa32dd6/ - Pandawa, agility, melee (1.05/5.00); AP/MP/Range 9/5/3; weapon Axe; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Axe weapon
- [063] https://dofuslab.io/en/view/27dd21b0-d7a3-4c51-b5fa-6474901907fa/ - Ouginak, chance, melee (1.75/5.00); AP/MP/Range 9/5/5; weapon Dagger; rd=0, md=0, wd=0, sd=0; why: 5 Range weak signal; Dagger weapon
- [064] https://dofuslab.io/en/view/52e92889-3b03-484a-8df9-bdd8444e99c4/ - Foggernaut, omni, melee (0.70/5.00); AP/MP/Range 10/5/2; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Hammer weapon
- [065] https://dofuslab.io/en/view/2965769b-da20-411d-8238-28b000e21cb2/ - Foggernaut, omni, ranged (6.40/0.00); AP/MP/Range 9/5/4; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Bow weapon
- [066] https://dofuslab.io/en/view/1c5dcfe2-59b8-443c-bc20-cb0f06f817ce/ - Cra, multi, ranged (6.05/0.00); AP/MP/Range 10/5/3; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Bow weapon
- [067] https://dofuslab.io/en/view/153209cc-6458-4964-99d2-95df977ea78d/ - Cra, omni, ranged (5.70/0.00); AP/MP/Range 9/5/2; weapon Wand; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Wand weapon
- [068] https://dofuslab.io/en/view/9e3ac54b-3c5a-412c-bada-609db1822515/ - Foggernaut, omni, melee (0.00/5.00); AP/MP/Range 10/4/0; weapon Axe; rd=0, md=0, wd=0, sd=0; why: Axe weapon
- [069] https://dofuslab.io/en/view/7badccc2-0be8-4802-9165-03a11f00d030/ - Foggernaut, omni, ranged (5.35/0.00); AP/MP/Range 9/5/1; weapon Wand; rd=0, md=0, wd=0, sd=0; why: 1 Range weak signal; Wand weapon
- [070] https://dofuslab.io/en/view/d7c7034c-5ed7-4028-88eb-80cb7263731e/ - Enutrof, multi, melee (1.75/5.00); AP/MP/Range 8/5/5; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 5 Range weak signal; Sword weapon
- [071] https://dofuslab.io/en/view/a13ed424-61b8-4bb1-a88b-6b8d10caf619/ - Enutrof, multi, ranged (5.70/0.00); AP/MP/Range 9/5/2; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Bow weapon
- [072] https://dofuslab.io/en/view/4626a2f3-c81b-473b-a042-930db6f23cba/ - Eniripsa, intelligence, melee (1.05/5.00); AP/MP/Range 10/5/3; weapon Shovel; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Shovel weapon
- [073] https://dofuslab.io/en/view/ee609aac-f71f-4d39-96bd-2362a71e144a/ - Eniripsa, intelligence, ranged (5.70/0.00); AP/MP/Range 9/5/2; weapon Wand; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Wand weapon
- [074] https://dofuslab.io/en/view/946bd757-030a-4f46-88f9-f4667dc105b9/ - Pandawa, agility, melee (1.05/5.00); AP/MP/Range 9/5/3; weapon Axe; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Axe weapon
- [075] https://dofuslab.io/en/view/0b5709f8-c0d4-486d-bd39-bfa039d9c7cb/ - Masqueraider, omni, ranged (6.05/0.00); AP/MP/Range 9/6/3; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Bow weapon
- [076] https://dofuslab.io/en/view/aa9e91e1-75eb-4110-b624-dc1d60827f6f/ - Eliotrope, omni, melee (0.00/5.00); AP/MP/Range 11/5/0; weapon Sword; rd=0, md=0, wd=0, sd=10.0; why: Sword weapon
- [077] https://dofuslab.io/en/view/373217c5-91e4-491c-a5a8-941b0198506e/ - Sadida, strength, ranged (7.10/0.00); AP/MP/Range 9/6/6; weapon Wand; rd=0, md=0, wd=0, sd=0; why: 6 Range weak signal; Wand weapon
- [078] https://dofuslab.io/en/view/c46625aa-e25e-4a39-8ad2-f9c23b0de85d/ - Sadida, strength, ranged (7.10/0.00); AP/MP/Range 9/7/6; weapon Wand; rd=0, md=0, wd=0, sd=0; why: 6 Range weak signal; Wand weapon
- [079] https://dofuslab.io/en/view/85dad7ae-66fa-412e-99a8-45a5e2de5db5/ - Ecaflip, intelligence, melee (0.70/5.00); AP/MP/Range 9/4/2; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Hammer weapon
- [080] https://dofuslab.io/en/view/21e33fbd-8e8e-4f6d-855c-cda53176f832/ - Forgelance, multi, ranged (5.35/0.00); AP/MP/Range 9/5/1; weapon Wand; rd=0, md=0, wd=0, sd=0; why: 1 Range weak signal; Wand weapon
- [081] https://dofuslab.io/en/view/a02993ed-8d02-48e6-bb54-c13be9eca0cc/ - Sram, multi, ranged (6.40/0.00); AP/MP/Range 10/5/4; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Bow weapon
- [082] https://dofuslab.io/en/view/e4344f91-0a55-4298-9498-3a346d986c04/ - Eliotrope, chance, ranged (5.70/0.00); AP/MP/Range 9/5/2; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Bow weapon
- [083] https://dofuslab.io/en/view/0738d56d-f98d-4216-8626-7dd56405ce88/ - Enutrof, omni, melee (1.05/5.00); AP/MP/Range 10/5/3; weapon Sword; rd=0, md=0, wd=0, sd=4.0; why: 3 Range weak signal; Sword weapon
- [084] https://dofuslab.io/en/view/2b3b00df-fa85-4afa-a109-52a9693707cb/ - Eliotrope, multi, ranged (5.70/0.00); AP/MP/Range 9/5/2; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Bow weapon
- [085] https://dofuslab.io/en/view/c17164fc-76fd-47ce-87d9-a2f37d3677c4/ - Pandawa, agility, melee (0.70/5.00); AP/MP/Range 9/5/2; weapon Axe; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Axe weapon
- [086] https://dofuslab.io/en/view/1a95c4b6-a140-4385-9e5b-1866dc99fa77/ - Forgelance, multi, ranged (6.05/0.00); AP/MP/Range 9/5/3; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Bow weapon
- [087] https://dofuslab.io/en/view/513d2033-e42e-4b91-98ed-6a65b4184495/ - Cra, multi, melee (1.40/5.00); AP/MP/Range 9/5/4; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Hammer weapon
- [088] https://dofuslab.io/en/view/b5e7fda2-210f-443e-880b-63fe8959dd84/ - Feca, multi, melee (1.40/5.00); AP/MP/Range 9/5/4; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Sword weapon
- [089] https://dofuslab.io/en/view/ce8855b1-5273-4dfd-b9fd-62cad95abc12/ - Enutrof, multi, ranged (6.75/0.00); AP/MP/Range 9/5/5; weapon Wand; rd=0, md=0, wd=0, sd=0; why: 5 Range weak signal; Wand weapon
- [090] https://dofuslab.io/en/view/eddbcc26-1fa0-44a5-a92b-a65c0b5613b0/ - Iop, intelligence, melee (1.40/5.00); AP/MP/Range 10/6/4; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Sword weapon
- [091] https://dofuslab.io/en/view/9abe0c8d-018f-492d-945b-44d5d65bc47f/ - Iop, intelligence, melee (1.40/5.00); AP/MP/Range 10/6/4; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Sword weapon
- [092] https://dofuslab.io/en/view/3780345b-7d67-47c4-aa3d-4232b4617be7/ - Iop, omni, ranged (6.40/0.00); AP/MP/Range 9/5/4; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Bow weapon
- [093] https://dofuslab.io/en/view/15cac1bc-363e-4f5c-ad9f-5bd97515678a/ - Feca, multi, melee (1.05/5.00); AP/MP/Range 10/4/3; weapon Sword; rd=0, md=0, wd=0, sd=0; why: 3 Range weak signal; Sword weapon
- [094] https://dofuslab.io/en/view/4a025d45-2bac-4dd7-9fbc-75a0f7321ffe/ - Iop, omni, ranged (5.70/0.00); AP/MP/Range 8/6/2; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Bow weapon
- [095] https://dofuslab.io/en/view/f861bae7-0ab6-43cc-bc7f-045d78fe7297/ - Cra, multi, melee (1.75/5.00); AP/MP/Range 10/4/5; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 5 Range weak signal; Hammer weapon
- [096] https://dofuslab.io/en/view/40af45b6-98da-41be-b34e-9663995f884e/ - Ecaflip, multi, ranged (8.05/0.00); AP/MP/Range 9/5/3; weapon Bow; rd=0, md=0, wd=0, sd=4.0; why: 3 Range weak signal; Bow weapon; % spell damage supports ranged weapon
- [097] https://dofuslab.io/en/view/15ceec44-fa68-46f3-8fb3-a5412c44ea8f/ - Feca, omni, melee (1.40/5.00); AP/MP/Range 10/4/4; weapon Hammer; rd=0, md=0, wd=0, sd=0; why: 4 Range weak signal; Hammer weapon
- [098] https://dofuslab.io/en/view/8db8f9a6-19c8-46fb-9aea-d8f4f296fc1c/ - Cra, omni, ranged (7.70/0.00); AP/MP/Range 9/5/2; weapon Bow; rd=0, md=0, wd=0, sd=6.0; why: 2 Range weak signal; Bow weapon; % spell damage supports ranged weapon
- [099] https://dofuslab.io/en/view/a28d4062-ee16-4d40-b297-07a6a3e1cd11/ - Eliotrope, intelligence, melee (0.70/5.00); AP/MP/Range 9/7/2; weapon Scythe; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Scythe weapon
- [100] https://dofuslab.io/en/view/3a3f533e-c559-4632-bd64-9087bda48669/ - Cra, multi, ranged (5.70/0.00); AP/MP/Range 8/5/2; weapon Bow; rd=0, md=0, wd=0, sd=0; why: 2 Range weak signal; Bow weapon
