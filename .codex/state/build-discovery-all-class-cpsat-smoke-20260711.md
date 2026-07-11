# All-Class CP-SAT Smoke Report

- Generated: `2026-07-11T18:59:48.372514+00:00`
- Report version: `build-discovery-all-class-cpsat-smoke-v1`
- Targets: `19`
- Passed: `19`
- Failed: `0`
- Classes: `19`
- Elements: `['agility', 'chance', 'intelligence', 'strength']`
- Budget tiers: `[1, 2, 3, 4]`
- Range targets: `[0, 3, 5, 6, 'None']`
- Max total search ms: `3657.6`

## Rows

### trusted_iop_strength_opti_damage

- Query: `Iop strength level 200 tier 4 12/6/Any preset 4 exo opti`
- Purpose: reviewed baseline
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 1835.6, 'totalSearchMs': 2647.5}`
- Scoring: `{'damageSurvivabilityPreset': 4, 'genericDamageWeight': 0.6, 'survivabilityWeight': 0.7, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 0.5, 'rotationModel': 'reviewed_iop_strength_rotation', 'profileConfidence': 'high', 'spellCandidateCount': 8}`
- Objective weights: `{'Strength': 0.9295, 'Power': 0.9295, 'Range': 0.5, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 12, 'MP': 6, 'Range': 1, 'Strength': 798, 'Power': 55, 'Vitality': 1102, 'Damage': 35, 'Earth Damage': 37, 'Critical': 21, 'Critical Damage': 50, 'Neutral Damage': 37}`
- Sets: `{'Guten Tak Set': 3}`
- Exos: `{'AP': {'itemId': '11471', 'slot': 'boots'}, 'MP': {'itemId': '30060', 'slot': 'shield'}}`
- Items: Guten Tak's Amulet, Khardboard Moowolf Belt, Hail Boots, Little Red Waddling Cape, Cawwot Dofus, Ochre Dofus, Friction, Major Friction, Minor Friction, Nomad, Thierry Voodoo Mask, Boarhog, Guten Tak's Ring, Honoh Ring, Allister's Aegis, Guten Tak's Bow

### cra_strength_soft_range

- Query: `Cra strength level 200 tier 4 12/6/Any preset 3 exo opti`
- Purpose: soft Range, no hard target
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 278.8, 'totalSearchMs': 2578.5}`
- Scoring: `{'damageSurvivabilityPreset': 3, 'genericDamageWeight': 0.45, 'survivabilityWeight': 1.0, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 8.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 8}`
- Objective weights: `{'Strength': 0.7609, 'Power': 0.7609, 'Range': 8.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 12, 'MP': 6, 'Range': 3, 'Strength': 1178, 'Power': 30, 'Vitality': 2953, 'Damage': 20, 'Earth Damage': 70, 'Critical': 53, 'Critical Damage': 0, 'Neutral Damage': 64}`
- Sets: `{'Shushu Ptidoop Set': 2, 'Undergrowth Set': 2, 'Valiant Heart Set': 2, 'Mama Ayuto Set': 2}`
- Exos: `{'AP': {'itemId': '9145', 'slot': 'belt'}, 'MP': {'itemId': '30860', 'slot': 'hat'}}`
- Items: Amulet of the Valiant Heart, Slice of Undergrowth, Boots of the Valiant Heart, Ptidoop Cape, Ochre Dofus, Pryssure-O-Mat, Jackanapes, Major Maniac, Maniac, Voyager, Mama Ayuto's Bandana, Mamukil Kolophant, XLII Ring, Ptidoop Ring, Mama Ayuto's Parasail, Canni Blade

### ecaflip_intelligence_range6

- Query: `Ecaflip intelligence level 200 tier 4 12/6/6 preset 3 exo opti`
- Purpose: hard Range 6 stress
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 278.0, 'totalSearchMs': 2823.4}`
- Scoring: `{'damageSurvivabilityPreset': 3, 'genericDamageWeight': 0.45, 'survivabilityWeight': 1.0, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 5.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 5}`
- Objective weights: `{'Intelligence': 1.7625, 'Power': 0.7625, 'Range': 5.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 12, 'MP': 6, 'Range': 6, 'Intelligence': 978, 'Power': 30, 'Vitality': 2253, 'Damage': 0, 'Fire Damage': 47, 'Critical': 19, 'Critical Damage': 108}`
- Sets: `{'Ripper Set': 3, 'Gein Set': 2}`
- Exos: `{'AP': {'itemId': '11606', 'slot': 'cloak'}, 'MP': {'itemId': '15433', 'slot': 'amulet'}, 'Range': {'itemId': '31758', 'slot': 'weapon'}}`
- Items: Gein's Amulet, Gein's Belt, Cantile's Boots, Cape Tivate, Ochre Dofus, Sylvan Dofus, Acrobat, Major Player, Major Tease, Voyager, The Ripper's Mane, Crimson and Orchid Rhineetle, Unstable Ring, Guten Tak's Ring, The Ripper's Trophy, The Ripper's Cleaver

### eliotrope_chance_range5

- Query: `Eliotrope chance level 200 tier 3 11/6/5 preset 2 exo allow`
- Purpose: hard Range 5 stress
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 263.0, 'totalSearchMs': 3563.3}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 2.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 6}`
- Objective weights: `{'Chance': 1.4127, 'Power': 0.4127, 'Range': 2.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 11, 'MP': 6, 'Range': 6, 'Chance': 818, 'Power': 15, 'Vitality': 1002, 'Damage': 21, 'Water Damage': 29, 'Critical': 15, 'Critical Damage': 10}`
- Sets: `{'Zatoishwan Set': 2}`
- Exos: `{'AP': {'itemId': '17100', 'slot': 'weapon'}, 'MP': {'itemId': '18709', 'slot': 'shield'}, 'Range': {'itemId': '27265', 'slot': 'amulet'}}`
- Items: Khardboard Celestial Brooch, Zatoishwan's Belt, Oshimo's Boots, Bzzegg Basket, Sylvan Dofus, Pryssure-O-Mat, Jackanapes, Major Acrobat, Major Tease, Voyager, Thierry Voodoo Mask, Drhellbert, Gelano, Honoh Ring, Proplr Shield, Zatoishwan's Staff

### eniripsa_agility_range6

- Query: `Eniripsa agility level 200 tier 4 12/6/6 preset 2 exo opti`
- Purpose: hard Range 6 stress
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 309.7, 'totalSearchMs': 2814.7}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 8.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 8}`
- Objective weights: `{'Agility': 1.4301, 'Power': 0.4301, 'Range': 8.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 12, 'MP': 6, 'Range': 6, 'Agility': 958, 'Power': 260, 'Vitality': 2103, 'Damage': 56, 'Air Damage': 5, 'Critical': 10, 'Critical Damage': 0}`
- Sets: `{'Dimensional Voyager Set': 5, 'Khardboard Set': 3}`
- Exos: `{}`
- Items: Khardboard Celestial Brooch, Khardboard Moowolf Belt, Voyager Boots, Voyager Portal, Dolmanax, Iridescent Prysipitate, Acrobat, Jackanapes, Major Acrobat, Major Gymnast, Voyager Hood, Drhellbert, Voyager Glove, Khardboard Gelano, Voyager Shield, Sacrificial Knives

### enutrof_chance_hard_range

- Query: `Enutrof chance level 200 tier 3 11/6/6 preset 2 exo allow`
- Purpose: hard Range 6 corner
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 306.9, 'totalSearchMs': 3640.4}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 8.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 6}`
- Objective weights: `{'Chance': 1.4037, 'Power': 0.4037, 'Range': 8.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 11, 'MP': 6, 'Range': 6, 'Chance': 888, 'Power': 115, 'Vitality': 1301, 'Damage': 15, 'Water Damage': 82, 'Critical': 16, 'Critical Damage': 0}`
- Sets: `{'Luminescent Set': 2, 'Pandamonium Set': 2}`
- Exos: `{'AP': {'itemId': '18033', 'slot': 'belt'}, 'MP': {'itemId': '25219', 'slot': 'weapon'}, 'Range': {'itemId': '18699', 'slot': 'shield'}}`
- Items: Luminescent Amulet, Luminescent Belt, The Maidartes, Thermal Cloak, Jackanapes, Major Acrobat, Major Player, Major Tease, Twitcher, Voyager, Thierry Voodoo Mask, Azure and Almond Seemyool, Gelano, Pandamonium Wedding Ring, Shelld, Pandamonium Wand

### feca_chance_budget1_floor

- Query: `Feca chance level 200 tier 1 10/5/Any preset 2 exo none`
- Purpose: cheap accessibility floor
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 382.8, 'totalSearchMs': 3327.9}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 8.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 9}`
- Objective weights: `{'Chance': 1.4056, 'Power': 0.4056, 'Range': 8.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 10, 'MP': 6, 'Range': 0, 'Chance': 527, 'Power': 110, 'Vitality': 1003, 'Damage': 0, 'Water Damage': 10, 'Critical': 20, 'Critical Damage': -11}`
- Sets: `{}`
- Exos: `{}`
- Items: Boy's Own Chain, Khardboard Moowolf Belt, Kicked Ass Boots, Fuji Snowfoux Cloak, Friction, Jackanapes, Maniac, Minor Friction, Nomad, Voyager, Death Mask, Armoured Dragoturkey, Gelano, Honoh Ring, Bitter-Shield, Aermyne's Rolling Pin

### foggernaut_strength_no_range

- Query: `Foggernaut strength level 200 tier 3 12/6/0 preset 2 exo allow`
- Purpose: nearly-useless Range guard
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 316.9, 'totalSearchMs': 2801.7}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 2.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 7}`
- Objective weights: `{'Strength': 0.3863, 'Power': 0.3863, 'Range': 2.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 12, 'MP': 6, 'Range': 6, 'Strength': 608, 'Power': 230, 'Vitality': 3263, 'Damage': 41, 'Earth Damage': 15, 'Critical': 10, 'Critical Damage': 0, 'Neutral Damage': 15}`
- Sets: `{'Krobe Set': 2, 'Deep Set': 2, 'Sucker Set': 3}`
- Exos: `{'AP': {'itemId': '15697', 'slot': 'cloak'}, 'MP': {'itemId': '18695', 'slot': 'shield'}}`
- Items: Kralomansion, Protozash, Unnamable Boots, Kapmeba, Aiwuztheya Dofus, Iridescent Prysipitate, Arcanist, Jackanapes, Twitcher, Voyager, Crocodyl Dandy's Hat, Sirocco, Head Band, Kringlove, Cawwot Wound, Shorpoon

### forgelance_chance_range6

- Query: `Forgelance chance level 200 tier 4 12/6/6 preset 2 exo opti`
- Purpose: hard Range 6 stress
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 277.1, 'totalSearchMs': 2787.1}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 5.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 9}`
- Objective weights: `{'Chance': 1.4131, 'Power': 0.4131, 'Range': 5.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 12, 'MP': 6, 'Range': 6, 'Chance': 798, 'Power': 60, 'Vitality': 1973, 'Damage': 0, 'Water Damage': 22, 'Critical': 28, 'Critical Damage': 0}`
- Sets: `{'Obsidemon Set': 5, 'Khardboard Set': 2, 'Bitter-Hammer Set': 2}`
- Exos: `{'Range': {'itemId': '11583', 'slot': 'boots'}}`
- Items: Obsidemon Amulet, Khardboard Moowolf Belt, Obsidemon Boots, Obsidemon Cloak, Dolmanax, Sylvan Dofus, Sprynt, Arcanist, Jackanapes, Twitcher, Obsidemon Helmet, Crimson and Orchid Rhineetle, Obsidemon Ring, Khardboard Gelano, Bitter-Shield, Bitter Billhook

### huppermage_strength_range3

- Query: `Huppermage strength level 200 tier 3 11/6/3 preset 2 exo allow`
- Purpose: hard Range 3 stress
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 402.8, 'totalSearchMs': 3522.9}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 8.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 7}`
- Objective weights: `{'Strength': 0.4003, 'Power': 0.4003, 'Range': 8.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 11, 'MP': 6, 'Range': 5, 'Strength': 853, 'Power': 75, 'Vitality': 1502, 'Damage': 25, 'Earth Damage': 23, 'Critical': 30, 'Critical Damage': 33, 'Neutral Damage': 23}`
- Sets: `{'Setstik': 2, 'Pit Set': 2}`
- Exos: `{'AP': {'itemId': '8839', 'slot': 'hat'}, 'MP': {'itemId': '18004', 'slot': 'amulet'}}`
- Items: Spookkoth Amulet, Khardboard Moowolf Belt, Vicious Boots, Little Red Waddling Cape, Emerald Dofus, Prynyang, Major Goliath, Major Tease, Nomad, Scholar, Thierry Voodoo Mask, Emerald and Crimson Rhineetle, Mumysring, Gelano, Shieldtastik, Daguanos

### masqueraider_intelligence_range5

- Query: `Masqueraider intelligence level 200 tier 3 11/6/5 preset 2 exo allow`
- Purpose: hard Range 5 stress
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 270.5, 'totalSearchMs': 3657.6}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 2.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 6}`
- Objective weights: `{'Intelligence': 1.3904, 'Power': 0.3904, 'Range': 2.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 11, 'MP': 6, 'Range': 6, 'Intelligence': 698, 'Power': 65, 'Vitality': 1592, 'Damage': 15, 'Fire Damage': 27, 'Critical': 9, 'Critical Damage': 15}`
- Sets: `{'Krobe Set': 2, 'Snowbound Set': 2}`
- Exos: `{'AP': {'itemId': '15700', 'slot': 'belt'}, 'MP': {'itemId': '19607', 'slot': 'cloak'}, 'Range': {'itemId': '19605', 'slot': 'weapon'}}`
- Items: Khardboard Celestial Brooch, Protozash, Pathogastrics, Absoluti Cape, Sylvan Dofus, Major Goliath, Major Player, Maniac, Scholar, Twitcher, Thierry Voodoo Mask, Bow Wow, YeCh'Ti Mitten, Gelano, Cawwot Wound, Mishmash Wand

### osamodas_agility_range5

- Query: `Osamodas agility level 200 tier 3 11/6/5 preset 2 exo allow`
- Purpose: hard Range 5 stress
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 269.7, 'totalSearchMs': 3554.4}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 2.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 6}`
- Objective weights: `{'Agility': 1.402, 'Power': 0.402, 'Range': 2.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 11, 'MP': 6, 'Range': 6, 'Agility': 498, 'Power': 160, 'Vitality': 3573, 'Damage': 5, 'Air Damage': 30, 'Critical': 49, 'Critical Damage': 25}`
- Sets: `{'Mekstagob Set': 2, 'Harpiset': 2, 'Anerice Set': 2}`
- Exos: `{'AP': {'itemId': '15748', 'slot': 'boots'}, 'MP': {'itemId': '15746', 'slot': 'amulet'}, 'Range': {'itemId': '19076', 'slot': 'cloak'}}`
- Items: Neckross, Stringsecticide, Kroks, Anerice Cloak, Aiwuztheya Dofus, Emerald Dofus, Prynyang, Arcanist, Jackanapes, Twitcher, Anerice Mask, Aquamarine and Almond Seemyool, Ring of the Prophets, Mekstagob Bolt, Ice Knight's Frigid Pavise, Mekstagob Spade

### ouginak_chance_no_range

- Query: `Ouginak chance level 200 tier 2 11/5/0 preset 2 exo allow`
- Purpose: short-range/no-Range class guard
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 338.8, 'totalSearchMs': 3493.6}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 0.5, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 6}`
- Objective weights: `{'Chance': 1.4123, 'Power': 0.4123, 'Range': 0.5, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 11, 'MP': 5, 'Range': 2, 'Chance': 548, 'Power': 210, 'Vitality': 752, 'Damage': 25, 'Water Damage': 23, 'Critical': 16, 'Critical Damage': 0}`
- Sets: `{}`
- Exos: `{'AP': {'itemId': '8714', 'slot': 'ring_2'}}`
- Items: Boy's Own Chain, Khardboard Moowolf Belt, Treadfast Boots, Little Red Waddling Cape, Friction, Jackanapes, Major Friction, Minor Friction, Minor Oppressor, Voyager, Thierry Voodoo Mask, Bow Meow, Gelano, Honoh Ring, Cubist Shield, Sword Hikk

### pandawa_agility_range5

- Query: `Pandawa agility level 200 tier 3 11/6/5 preset 2 exo allow`
- Purpose: hard Range 5 stress
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 264.7, 'totalSearchMs': 3543.2}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 2.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 4}`
- Objective weights: `{'Agility': 1.4266, 'Power': 0.4266, 'Range': 2.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 11, 'MP': 6, 'Range': 6, 'Agility': 608, 'Power': 85, 'Vitality': 1102, 'Damage': 15, 'Air Damage': 33, 'Critical': 18, 'Critical Damage': 10}`
- Sets: `{}`
- Exos: `{'AP': {'itemId': '8840', 'slot': 'hat'}}`
- Items: Boy's Own Chain, Khardboard Moowolf Belt, Deep Sea Sandals, Fuji Snowfoux Cloak, Cawwot Dofus, Sylvan Dofus, Prycapture, Friction, Jackanapes, Minor Friction, Jav Voodoo Mask, Drhellbert, Gelano, Pirate Bhey Bracelet, Brakmarian Shield, Lavaxe

### rogue_intelligence_range6

- Query: `Rogue intelligence level 200 tier 4 12/6/6 preset 2 exo opti`
- Purpose: hard Range 6 stress
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 264.3, 'totalSearchMs': 2643.3}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 5.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 2}`
- Objective weights: `{'Intelligence': 1.4133, 'Power': 0.4133, 'Range': 5.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 12, 'MP': 6, 'Range': 6, 'Intelligence': 898, 'Power': 260, 'Vitality': 2973, 'Damage': 0, 'Fire Damage': 0, 'Critical': 42, 'Critical Damage': 0}`
- Sets: `{'Bubotron Set': 2, 'Harpiset': 3, 'Khardboard Set': 2}`
- Exos: `{'Range': {'itemId': '15748', 'slot': 'boots'}}`
- Items: Neckross, Khardboard Moowolf Belt, Kroks, Krosscape, Aiwuztheya Dofus, Dolmanax, Sylvan Dofus, Caraprys, Jackanapes, Twitcher, Bubotron Mask, Drhellbert, Khardboard Gelano, Sleeping Venerable One's Curse, War's Fortress, Bubotron Sword

### sacrier_intelligence_no_range

- Query: `Sacrier intelligence level 200 tier 4 12/6/0 preset 2 exo opti`
- Purpose: short-range hard zero
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 396.2, 'totalSearchMs': 2654.8}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 0.5, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 7}`
- Objective weights: `{'Intelligence': 1.3822, 'Power': 0.3822, 'Range': 0.5, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 12, 'MP': 6, 'Range': 2, 'Intelligence': 498, 'Power': 15, 'Vitality': 1052, 'Damage': 25, 'Fire Damage': 0, 'Critical': 25, 'Critical Damage': 0}`
- Sets: `{}`
- Exos: `{'MP': {'itemId': '8839', 'slot': 'hat'}}`
- Items: Boy's Own Chain, Khardboard Moowolf Belt, Spore Boots, Cape Tivate, Ochre Dofus, Vulbis Dofus, Pryssure-O-Mat, Acrobat, Major Luckster, Maniac, Thierry Voodoo Mask, Crimson and Indigo Rhineetle, Guten Tak's Ring, Gelano, Anerice Shield, Destroyer Cleaver

### sadida_intelligence_range6

- Query: `Sadida intelligence level 200 tier 4 12/6/6 preset 2 exo opti`
- Purpose: hard Range 6 stress
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 267.3, 'totalSearchMs': 2776.6}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 5.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 6}`
- Objective weights: `{'Intelligence': 1.387, 'Power': 0.387, 'Range': 5.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 12, 'MP': 6, 'Range': 6, 'Intelligence': 1038, 'Power': 70, 'Vitality': 2153, 'Damage': 0, 'Fire Damage': 20, 'Critical': 31, 'Critical Damage': 25}`
- Sets: `{'Fuji Snowfoux Set': 4, 'Khardboard Set': 3}`
- Exos: `{'Range': {'itemId': '32242', 'slot': 'weapon'}}`
- Items: Khardboard Celestial Brooch, Khardboard Moowolf Belt, Fuji Snowfoux Boots, Fuji Snowfoux Cloak, Dolmanax, Ochre Dofus, Sylvan Dofus, Caraprys, Major Scholar, Twitcher, Fuji Snowfoux Headgear, Orchid and Indigo Rhineetle, Fuji Snowfoux Ring, Khardboard Gelano, War's Fortress, Mekstagob Spade

### sram_strength_range6

- Query: `Sram strength level 200 tier 4 12/6/6 preset 2 exo opti`
- Purpose: hard Range 6 stress
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 300.3, 'totalSearchMs': 2789.9}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 5.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 9}`
- Objective weights: `{'Strength': 0.4234, 'Power': 0.4234, 'Range': 5.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 12, 'MP': 6, 'Range': 6, 'Strength': 848, 'Power': 105, 'Vitality': 1152, 'Damage': 15, 'Earth Damage': 61, 'Critical': 25, 'Critical Damage': 15, 'Neutral Damage': 61}`
- Sets: `{'Fuji Snowfoux Set': 2, 'Lost Set': 2}`
- Exos: `{'AP': {'itemId': '27528', 'slot': 'weapon'}, 'MP': {'itemId': '27266', 'slot': 'belt'}, 'Range': {'itemId': '12120', 'slot': 'ring_2'}}`
- Items: Jahn Locket, Khardboard Moowolf Belt, Benj Boots, Fuji Snowfoux Cloak, Ochre Dofus, Jackanapes, Major Brainbox, Major Player, Major Tease, Twitcher, Thierry Voodoo Mask, Drhellbert, Gelano, Fuji Snowfoux Ring, Shieldtastik, Copperbeard Mace

### xelor_agility_low_action_validity

- Query: `Xelor agility level 200 tier 2 7/3/Any preset 2 exo allow`
- Purpose: low-action validity edge
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 284.2, 'totalSearchMs': 3310.5}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 0.5, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 5}`
- Objective weights: `{'Agility': 1.4154, 'Power': 0.4154, 'Range': 0.5, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 8, 'MP': 6, 'Range': 2, 'Agility': 608, 'Power': 155, 'Vitality': 1152, 'Damage': 25, 'Air Damage': 25, 'Critical': 20, 'Critical Damage': 0}`
- Sets: `{}`
- Exos: `{'MP': {'itemId': '18017', 'slot': 'weapon'}}`
- Items: Boy's Own Chain, Khardboard Moowolf Belt, Voyager Boots, Fuji Snowfoux Cloak, Emerald Dofus, Friction, Major Friction, Major Player, Maniac, Minor Friction, Thierry Voodoo Mask, Bow Meow, Gloves of the Great, Honoh Ring, Ice Knight's Frigid Pavise, Daguanos
