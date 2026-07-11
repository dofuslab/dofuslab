# All-Class CP-SAT Smoke Report

- Generated: `2026-07-11T19:02:40.905010+00:00`
- Report version: `build-discovery-all-class-cpsat-smoke-v1`
- Target set: `level-diversity`
- Targets: `12`
- Passed: `12`
- Failed: `0`
- Classes: `11`
- Elements: `['agility', 'chance', 'intelligence', 'strength']`
- Budget tiers: `[1, 2, 3, 4]`
- Range targets: `[0, 1, 2, 3, 6, 'None']`
- Max total search ms: `3290.8`

## Rows

### level1_iop_strength_min

- Query: `Iop strength level 1 tier 1 6/3/Any preset 2 exo none`
- Purpose: level 1 base AP 6 minimum
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 1678.1, 'totalSearchMs': 17.8}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 0.5, 'rotationModel': 'reviewed_iop_strength_rotation', 'profileConfidence': 'high', 'spellCandidateCount': 1}`
- Objective weights: `{'Strength': 0.3487, 'Power': 0.3487, 'Range': 0.5, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 6, 'MP': 3, 'Range': 0, 'Strength': 130, 'Power': 0, 'Vitality': 132, 'Damage': 1, 'Earth Damage': 0, 'Critical': 0, 'Critical Damage': 0, 'Neutral Damage': 0}`
- Sets: `{'Intrepid Set': 2, 'Boon Set': 7}`
- Exos: `{}`
- Items: Intrepid Amulet, Muffin Belt, Crashers, S'loque Cape, Flud, Intrepid Ring, Pluswan, Halt Efkat, Bounihime

### level20_cra_intelligence_range1

- Query: `Cra intelligence level 20 tier 1 6/3/1 preset 2 exo none`
- Purpose: early pre-100 hard Range 1
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 150.6, 'totalSearchMs': 64.6}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 8.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 1}`
- Objective weights: `{'Intelligence': 1.3578, 'Power': 0.3578, 'Range': 8.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 6, 'MP': 3, 'Range': 1, 'Intelligence': 255, 'Power': 20, 'Vitality': 115, 'Damage': 5, 'Fire Damage': 1, 'Critical': 5, 'Critical Damage': 0}`
- Sets: `{'King Pong Set': 2}`
- Exos: `{}`
- Items: Pongulet, Pongbelt, Intelligence Sandals, The Red Cape, Slob Headgear, Agility Ring, Chance Ring, Wild Sunflower Shield, Yew Axe

### level50_ecaflip_chance_budget1

- Query: `Ecaflip chance level 50 tier 1 7/4/0 preset 2 exo none`
- Purpose: budget tier 1 low-level action row
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 167.5, 'totalSearchMs': 583.7}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 0.5, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 2}`
- Objective weights: `{'Chance': 1.3919, 'Power': 0.3919, 'Range': 0.5, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 7, 'MP': 4, 'Range': 0, 'Chance': 272, 'Power': 40, 'Vitality': 336, 'Damage': 16, 'Water Damage': 0, 'Critical': 13, 'Critical Damage': 12}`
- Sets: `{}`
- Exos: `{}`
- Items: Flooey's Clock, Dazzling Belt, Faillette Boots, Carpet Cape, Minor Air Destroyer, Minor Fire Destroyer, Minor Friction, Minor Neutral Destroyer, Minor Oppressor, Minor Repellant, Daudgee, Handbag, Reinforced Handbag, Chafer Foot Soldier's Shield, Eurfolles Daggers

### level80_feca_agility_budget2

- Query: `Feca agility level 80 tier 2 10/5/0 preset 2 exo allow`
- Purpose: mid-level AP/MP row before base AP change
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 202.8, 'totalSearchMs': 1105.1}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 0.5, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 3}`
- Objective weights: `{'Agility': 1.3599, 'Power': 0.3599, 'Range': 0.5, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 10, 'MP': 5, 'Range': 1, 'Agility': 491, 'Power': 40, 'Vitality': 357, 'Damage': 5, 'Air Damage': 2, 'Critical': 9, 'Critical Damage': 5}`
- Sets: `{}`
- Exos: `{'MP': {'itemId': '30688', 'slot': 'shield'}}`
- Items: Piggy Paupe's Amulet, Powerful Dazzling Belt, Royal Coco Bloopts, Sin Cape, Minor Fire Destroyer, Minor Friction, Minor Neutral Destroyer, Minor Oppressor, Minor Repellant, Minor Water Destroyer, Caracap, Sirocco, Tribal Ring, Ringnomen Tengu, Crispy Targe, God Rod

### level99_enutrof_chance_cap

- Query: `Enutrof chance level 99 tier 4 12/6/6 preset 2 exo allow`
- Purpose: pre-100 hard cap stress
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 186.4, 'totalSearchMs': 1182.8}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 8.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 4}`
- Objective weights: `{'Chance': 1.3727, 'Power': 0.3727, 'Range': 8.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 12, 'MP': 6, 'Range': 6, 'Chance': 723, 'Power': 30, 'Vitality': 711, 'Damage': 3, 'Water Damage': 5, 'Critical': 13, 'Critical Damage': 0}`
- Sets: `{'Khardboard Set': 3}`
- Exos: `{'AP': {'itemId': '27282', 'slot': 'hat'}, 'MP': {'itemId': '27268', 'slot': 'weapon'}, 'Range': {'itemId': '15996', 'slot': 'amulet'}}`
- Items: Curative Pendant, Paper Pants, Caraboots, Khardboard Dazzling Cloak, Cawwot Dofus, Minor Luckster, Minor Player, Minor Tease, Observer, Twitcher, Khardboard Gobball Headgear, Indigo Rhineetle, Spynner Ring, Satisfied Summoner's Ring, Rok Gnorok Bastione, Khardboard Goultard

### level100_xelor_agility_min

- Query: `Xelor agility level 100 tier 2 7/3/Any preset 2 exo allow`
- Purpose: level 100 base AP 7 minimum
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 202.2, 'totalSearchMs': 1631.9}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 8.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 2}`
- Objective weights: `{'Agility': 1.3267, 'Power': 0.3267, 'Range': 8.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 7, 'MP': 3, 'Range': 1, 'Agility': 465, 'Power': 100, 'Vitality': 825, 'Damage': 6, 'Air Damage': 0, 'Critical': 11, 'Critical Damage': 0}`
- Sets: `{}`
- Exos: `{}`
- Items: Flooey's Clock, Yellow Turtle Belt, Tofu Sandals, Cape Hillary, Friction, Minor Friction, Minor Oppressor, Minor Repellant, Oppressor, Repellant, King Jellix's Crown, Armoured Dragoturkey, Ring o'Stradamus, Nonsenz Ring, Dragokart Cup, Golden Rhizome

### level120_eniripsa_intelligence_mid

- Query: `Eniripsa intelligence level 120 tier 2 11/5/1 preset 2 exo allow`
- Purpose: post-100 mid-level budget row
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 231.3, 'totalSearchMs': 1929.6}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 8.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 4}`
- Objective weights: `{'Intelligence': 1.3819, 'Power': 0.3819, 'Range': 8.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 11, 'MP': 5, 'Range': 3, 'Intelligence': 438, 'Power': 15, 'Vitality': 406, 'Damage': 7, 'Fire Damage': 30, 'Critical': 15, 'Critical Damage': 0}`
- Sets: `{}`
- Exos: `{'AP': {'itemId': '18689', 'slot': 'shield'}}`
- Items: Palid Emblem, Klume's Belt, Klime's Boots, Rags, Friction, Minor Friction, Minor Oppressor, Minor Repellant, Oppressor, Shaker, Caracap, Coral and Almond Seemyool, Black Quakhoop, Ignoah Ring, Phtalmo, Limbo Wand

### level150_sacrier_strength_floor

- Query: `Sacrier strength level 150 tier 2 10/5/0 preset 2 exo allow`
- Purpose: level 150 realistic floor row
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 274.1, 'totalSearchMs': 618.9}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 0.5, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 5}`
- Objective weights: `{'Strength': 0.3703, 'Power': 0.3703, 'Range': 0.5, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 10, 'MP': 5, 'Range': 1, 'Strength': 516, 'Power': 90, 'Vitality': 1461, 'Damage': 7, 'Earth Damage': 12, 'Critical': 22, 'Critical Damage': 0, 'Neutral Damage': 6}`
- Sets: `{}`
- Exos: `{'AP': {'itemId': '23315', 'slot': 'weapon'}, 'MP': {'itemId': '14810', 'slot': 'amulet'}}`
- Items: Baahboh Insignia, Abdominable Belt, Royal Mastogob Boots, Powa Drhell Cloak, Friction, Major Friction, Major Oppressor, Minor Friction, Minor Oppressor, Oppressor, Zoth Sergeant Mask, Orchid and Ebony Rhineetle, Notwithstand Ring, Bontarian Rat Ring, Bontarian Gobbowler Shield, Rock Katana

### level179_pandawa_agility_mid

- Query: `Pandawa agility level 179 tier 3 12/5/2 preset 2 exo allow`
- Purpose: pre-180 high-level transition row
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 245.9, 'totalSearchMs': 1308.1}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 2.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 4}`
- Objective weights: `{'Agility': 1.423, 'Power': 0.423, 'Range': 2.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 12, 'MP': 5, 'Range': 3, 'Agility': 542, 'Power': 205, 'Vitality': 1682, 'Damage': 30, 'Air Damage': 0, 'Critical': 24, 'Critical Damage': 10}`
- Sets: `{}`
- Exos: `{'AP': {'itemId': '7680', 'slot': 'hat'}}`
- Items: Renewed Amulet, Grendibelt, Bootarkies, Augilol's Tippet, Friction, Major Friction, Minor Friction, Minor Oppressor, Oppressor, Shaker, Ougaat, Orchid and Ebony Rhineetle, Notwithstand Ring, Gelano, Inn Shield, Shovel Tonjon

### level180_rogue_intelligence_range6

- Query: `Rogue intelligence level 180 tier 3 12/6/6 preset 2 exo allow`
- Purpose: level 180 hard Range 6 stress
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 230.6, 'totalSearchMs': 383.5}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 5.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 2}`
- Objective weights: `{'Intelligence': 1.4133, 'Power': 0.4133, 'Range': 5.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 12, 'MP': 6, 'Range': 6, 'Intelligence': 513, 'Power': 185, 'Vitality': 1272, 'Damage': 25, 'Fire Damage': 6, 'Critical': 16, 'Critical Damage': 0}`
- Sets: `{}`
- Exos: `{'AP': {'itemId': '32210', 'slot': 'cloak'}, 'Range': {'itemId': '2469', 'slot': 'ring_1'}}`
- Items: Zothulet, Potsan Pants, Cantile's Boots, Pirate Bhey Sail, Friction, Major Friction, Minor Friction, Minor Oppressor, Shaker, Voyager, Thierry Voodoo Mask, Ebony Rhineetle, Gelano, Honoh Ring, Water Dial, Michael Dougle Axe

### level199_osamodas_agility_budget2

- Query: `Osamodas agility level 199 tier 2 10/6/3 preset 2 exo allow`
- Purpose: near-200 lower-budget row
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 243.9, 'totalSearchMs': 1202.6}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 2.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 6}`
- Objective weights: `{'Agility': 1.402, 'Power': 0.402, 'Range': 2.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 10, 'MP': 6, 'Range': 5, 'Agility': 537, 'Power': 205, 'Vitality': 1501, 'Damage': 24, 'Air Damage': 20, 'Critical': 12, 'Critical Damage': 0}`
- Sets: `{}`
- Exos: `{}`
- Items: Ougaamulet, Unstable Belt, Voyager Boots, Thermal Cloak, Friction, Major Friction, Minor Friction, Minor Oppressor, Oppressor, Shaker, Air Pikoko Helmet, Bworky, Professor Xa's Ring, Gelano, Seven Years Bad Luck, Michael Dougle Axe

### level200_feca_chance_budget1_floor

- Query: `Feca chance level 200 tier 1 10/5/Any preset 2 exo none`
- Purpose: level 200 tier 1 realistic floor
- Status: `passed` / solver `FEASIBLE` / response `complete`
- Timings: `{'loadMs': 346.8, 'totalSearchMs': 3290.8}`
- Scoring: `{'damageSurvivabilityPreset': 2, 'genericDamageWeight': 0.25, 'survivabilityWeight': 1.8, 'negativeResistancePenaltyWeight': 0.0, 'rangeSoftWeight': 8.0, 'rotationModel': 'spell_profile_v0_weighted_candidates', 'profileConfidence': 'medium', 'spellCandidateCount': 9}`
- Objective weights: `{'Chance': 1.4056, 'Power': 0.4056, 'Range': 8.0, 'AP': 12.0, 'MP': 10.0}`
- Totals: `{'AP': 10, 'MP': 6, 'Range': 0, 'Chance': 527, 'Power': 110, 'Vitality': 1003, 'Damage': 0, 'Water Damage': 10, 'Critical': 20, 'Critical Damage': -11}`
- Sets: `{}`
- Exos: `{}`
- Items: Boy's Own Chain, Khardboard Moowolf Belt, Kicked Ass Boots, Fuji Snowfoux Cloak, Friction, Jackanapes, Maniac, Minor Friction, Nomad, Voyager, Death Mask, Armoured Dragoturkey, Gelano, Honoh Ring, Bitter-Shield, Aermyne's Rolling Pin
