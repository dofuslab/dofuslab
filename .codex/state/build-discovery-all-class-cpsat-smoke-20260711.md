# All-Class CP-SAT Smoke Report

- Generated: `2026-07-11T18:51:42.514563+00:00`
- Report version: `build-discovery-all-class-cpsat-smoke-v1`
- Targets: `6`
- Passed: `6`
- Failed: `0`

## Rows

### trusted_iop_strength_opti_damage

- Query: `Iop strength level 200 tier 4 12/6/Any preset 4 exo opti`
- Purpose: trusted reviewed profile baseline
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 1820.9, 'totalSearchMs': 2724.6}`
- Scoring: `{'damageSurvivabilityPreset': 4, 'genericDamageWeight': 0.6, 'survivabilityWeight': 0.7, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 0.5, 'rotationModel': 'reviewed_iop_strength_rotation', 'profileConfidence': 'high', 'spellCandidateCount': 8}`
- Objective weights: `{'Strength': 0.9295, 'Power': 0.9295, 'Range': 0.5, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 12, 'MP': 6, 'Range': 1, 'Strength': 798, 'Power': 55, 'Vitality': 1102, 'Damage': 35, 'Earth Damage': 37, 'Critical': 21, 'Critical Damage': 50, 'Neutral Damage': 37}`
- Sets: `{'Guten Tak Set': 3}`
- Exos: `{'AP': {'itemId': '11471', 'slot': 'boots'}, 'MP': {'itemId': '30060', 'slot': 'shield'}}`
- Items: Guten Tak's Amulet, Khardboard Moowolf Belt, Hail Boots, Little Red Waddling Cape, Cawwot Dofus, Ochre Dofus, Friction, Major Friction, Minor Friction, Nomad, Thierry Voodoo Mask, Boarhog, Guten Tak's Ring, Honoh Ring, Allister's Aegis, Guten Tak's Bow

### cra_strength_opti_range_soft

- Query: `Cra strength level 200 tier 4 12/6/Any preset 3 exo opti`
- Purpose: non-Iop range-vital soft Range path
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 415.6, 'totalSearchMs': 2535.8}`
- Scoring: `{'damageSurvivabilityPreset': 3, 'genericDamageWeight': 0.45, 'survivabilityWeight': 1.0, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 8.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 8}`
- Objective weights: `{'Strength': 0.7609, 'Power': 0.7609, 'Range': 8.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 12, 'MP': 6, 'Range': 3, 'Strength': 1178, 'Power': 30, 'Vitality': 2953, 'Damage': 20, 'Earth Damage': 70, 'Critical': 53, 'Critical Damage': 0, 'Neutral Damage': 64}`
- Sets: `{'Shushu Ptidoop Set': 2, 'Undergrowth Set': 2, 'Valiant Heart Set': 2, 'Mama Ayuto Set': 2}`
- Exos: `{'AP': {'itemId': '9145', 'slot': 'belt'}, 'MP': {'itemId': '30860', 'slot': 'hat'}}`
- Items: Amulet of the Valiant Heart, Slice of Undergrowth, Boots of the Valiant Heart, Ptidoop Cape, Ochre Dofus, Pryssure-O-Mat, Jackanapes, Major Maniac, Maniac, Voyager, Mama Ayuto's Bandana, Mamukil Kolophant, XLII Ring, Ptidoop Ring, Mama Ayuto's Parasail, Canni Blade

### enutrof_chance_hard_range

- Query: `Enutrof chance level 200 tier 3 11/6/6 preset 2 exo allow`
- Purpose: non-Iop hard Range 6 corner
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 267.0, 'totalSearchMs': 3542.0}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 8.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 6}`
- Objective weights: `{'Chance': 1.4037, 'Power': 0.4037, 'Range': 8.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 11, 'MP': 6, 'Range': 6, 'Chance': 888, 'Power': 115, 'Vitality': 1301, 'Damage': 15, 'Water Damage': 82, 'Critical': 16, 'Critical Damage': 0}`
- Sets: `{'Luminescent Set': 2, 'Pandamonium Set': 2}`
- Exos: `{'AP': {'itemId': '18033', 'slot': 'belt'}, 'MP': {'itemId': '25219', 'slot': 'weapon'}, 'Range': {'itemId': '18699', 'slot': 'shield'}}`
- Items: Luminescent Amulet, Luminescent Belt, The Maidartes, Thermal Cloak, Jackanapes, Major Acrobat, Major Player, Major Tease, Twitcher, Voyager, Thierry Voodoo Mask, Azure and Almond Seemyool, Gelano, Pandamonium Wedding Ring, Shelld, Pandamonium Wand

### sacrier_intelligence_no_range

- Query: `Sacrier intelligence level 200 tier 4 12/6/0 preset 2 exo opti`
- Purpose: short-range class should not need positive Range
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 314.2, 'totalSearchMs': 2620.0}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 0.5, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 7}`
- Objective weights: `{'Intelligence': 1.3822, 'Power': 0.3822, 'Range': 0.5, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 12, 'MP': 6, 'Range': 2, 'Intelligence': 498, 'Power': 15, 'Vitality': 1052, 'Damage': 25, 'Fire Damage': 0, 'Critical': 25, 'Critical Damage': 0}`
- Sets: `{}`
- Exos: `{'MP': {'itemId': '8839', 'slot': 'hat'}}`
- Items: Boy's Own Chain, Khardboard Moowolf Belt, Spore Boots, Cape Tivate, Ochre Dofus, Vulbis Dofus, Pryssure-O-Mat, Acrobat, Major Luckster, Maniac, Thierry Voodoo Mask, Crimson and Indigo Rhineetle, Guten Tak's Ring, Gelano, Anerice Shield, Destroyer Cleaver

### feca_chance_budget1_realistic_floor

- Query: `Feca chance level 200 tier 1 10/5/Any preset 2 exo none`
- Purpose: tier 1 budget with realistic level-200 floor
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 353.1, 'totalSearchMs': 3244.2}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 8.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 9}`
- Objective weights: `{'Chance': 1.4056, 'Power': 0.4056, 'Range': 8.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 10, 'MP': 6, 'Range': 0, 'Chance': 527, 'Power': 110, 'Vitality': 1003, 'Damage': 0, 'Water Damage': 10, 'Critical': 20, 'Critical Damage': -11}`
- Sets: `{}`
- Exos: `{}`
- Items: Boy's Own Chain, Khardboard Moowolf Belt, Kicked Ass Boots, Fuji Snowfoux Cloak, Friction, Jackanapes, Maniac, Minor Friction, Nomad, Voyager, Death Mask, Armoured Dragoturkey, Gelano, Honoh Ring, Bitter-Shield, Aermyne's Rolling Pin

### xelor_agility_low_action_validity

- Query: `Xelor agility level 200 tier 1 7/3/Any preset 2 exo none`
- Purpose: valid low-action edge, not player-realistic quality
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 274.8, 'totalSearchMs': 3271.9}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 0.5, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 5}`
- Objective weights: `{'Agility': 1.4154, 'Power': 0.4154, 'Range': 0.5, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 10, 'MP': 4, 'Range': 5, 'Agility': 558, 'Power': 330, 'Vitality': 2153, 'Damage': 17, 'Air Damage': 45, 'Critical': -7, 'Critical Damage': 10}`
- Sets: `{'Undergrowth Set': 2, 'Guten Tak Set': 3, 'Salvatory Spirit Set': 2}`
- Exos: `{}`
- Items: Guten Tak's Amulet, Belt of the Salvatory Spirit, Ta Boots, Fuji Snowfoux Cloak, Friction, Jackanapes, Major Player, Major Tease, Minor Friction, Tease, Mask of the Salvatory Spirit, Armoured Dragoturkey, Guten Tak's Ring, Guten Tak's Wedding Ring, Brakmarian Shield, Canni Blade
