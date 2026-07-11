# Spell-Derived +Range Usefulness - 2026-07-11

Source: local spell tables, highest spell stat level per spell. Caveat: data may be outdated; treat as archetype evidence.

## Summary

```json
{
  "reportVersion": "build-discovery-spell-range-usefulness-v1",
  "generatedAt": "2026-07-11",
  "source": "local_spell_tables_highest_spell_stats_level_per_spell",
  "caveats": [
    "Local spell data may be outdated; use this as archetype evidence, not final live-game truth.",
    "Weights are heuristic: average base damage per AP, casts per turn, cooldown penalty, and best-element penalty.",
    "This does not yet model exact rotations, variant exclusivity beyond current spell rows, buffs, AoE value, mobility, erosion, or utility."
  ],
  "counts": {
    "vital": 21,
    "marginal": 10,
    "useful": 13,
    "nearly useless": 32
  },
  "profileCount": 76
}
```

## Class / Element Classifications

- **Cra strength**: `vital` - 100% weighted damaging spell value has modifiable range; 100% has modifiable max range >=4; 0% is max range <=2. Top: Arrow of Judgement 1-9 mod, Lashing Arrow 1-6 mod, Covering Fire 3-10 mod, Barricade Shot 1-8 mod
- **Cra intelligence**: `vital` - 100% weighted damaging spell value has modifiable range; 100% has modifiable max range >=4; 0% is max range <=2. Top: Fulminating Arrow 1-8 mod, Exploding Arrow 1-7 mod, Explosive Arrow 1-8 mod, Tyrannical Arrow 2-7 mod
- **Cra chance**: `vital` - 100% weighted damaging spell value has modifiable range; 100% has modifiable max range >=4; 0% is max range <=2. Top: Redemption Arrow 4-8 mod, Frozen Arrow 1-10 mod, Persecuting Arrow 3-10 mod, Atonement Arrow 6-10 mod
- **Cra agility**: `vital` - 100% weighted damaging spell value has modifiable range; 100% has modifiable max range >=4; 0% is max range <=2. Top: Devouring Arrow 1-6 mod, Piercing Shot 1-8 mod, Tormenting Arrow 1-10 mod, Optical Arrow 0-12 mod
- **Ecaflip strength**: `vital` - 60% weighted damaging spell value has modifiable range; 60% has modifiable max range >=4; 20% is max range <=2. Top: Trickery 1-5 mod, Rekop 1-5 mod, Misadventure 0-2, Heads or Tails 1-7 mod
- **Ecaflip intelligence**: `vital` - 86% weighted damaging spell value has modifiable range; 86% has modifiable max range >=4; 0% is max range <=2. Top: Trickery 1-5 mod, Rekop 1-5 mod, Topkaj 1-7 mod, Meowch 1-5
- **Ecaflip chance**: `vital` - 69% weighted damaging spell value has modifiable range; 69% has modifiable max range >=4; 14% is max range <=2. Top: Trickery 1-5 mod, Rekop 1-5 mod, All or Nothing 0-2, Misfortune 1-6 mod
- **Ecaflip agility**: `vital` - 72% weighted damaging spell value has modifiable range; 72% has modifiable max range >=4; 0% is max range <=2. Top: Trickery 1-5 mod, Rekop 1-5 mod, Balling Up 1-4, Nerve 1-8 mod
- **Eliotrope strength**: `vital` - 58% weighted damaging spell value has modifiable range; 58% has modifiable max range >=4; 0% is max range <=2. Top: Persiflage 1-5 mod, Sarcasm 1-4, Snub 1-4 mod, Therapy 1-7 mod
- **Eliotrope intelligence**: `marginal` - 18% weighted damaging spell value has modifiable range; 18% has modifiable max range >=4; 0% is max range <=2. Top: Parasite 1-4, Lazybeam 1-6, Offence 0-7 mod, Wakfu Ray 2-5
- **Eliotrope chance**: `useful` - 36% weighted damaging spell value has modifiable range; 36% has modifiable max range >=4; 0% is max range <=2. Top: Audacious 1-4, Insolence 1-6, Composure 1-8 mod, Lightning Fist 1-4
- **Eliotrope agility**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 0% is max range <=2. Top: Sermon 1-5, Ridicule 1-6, Insult 1-3, Contempt 1-7
- **Eniripsa strength**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 29% is max range <=2. Top: War Cry 0-0, Ancestral Ointment 0-7, Profanity 1-6, Tribal Paintbrush 0-6
- **Eniripsa intelligence**: `vital` - 78% weighted damaging spell value has modifiable range; 78% has modifiable max range >=4; 13% is max range <=2. Top: Deafening Cry 1-6 mod, Raucous Word 0-5 mod, Pilfering 1-8 mod, Scalpel 0-2
- **Eniripsa chance**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 11% is max range <=2. Top: Vampiric Word 1-6, Bloodless Word 0-5, Sobs 1-6, Scalpel 0-2
- **Eniripsa agility**: `vital` - 93% weighted damaging spell value has modifiable range; 93% has modifiable max range >=4; 7% is max range <=2. Top: Secret Word 1-10 mod, Malicious Word 1-8 mod, Mischievous Word 1-7 mod, Flowery Word 0-6 mod
- **Enutrof strength**: `useful` - 43% weighted damaging spell value has modifiable range; 43% has modifiable max range >=4; 0% is max range <=2. Top: Collapse 1-7, Prime of Life 1-5, Shovel Throwing 1-8 mod, Mound 2-8 mod
- **Enutrof intelligence**: `vital` - 82% weighted damaging spell value has modifiable range; 82% has modifiable max range >=4; 0% is max range <=2. Top: Unsummoning 1-5 mod, Mine Fire 1-5 mod, Shovel Kiss 1-8 mod, Ghostly Shovel 1-8 mod
- **Enutrof chance**: `vital` - 78% weighted damaging spell value has modifiable range; 78% has modifiable max range >=4; 0% is max range <=2. Top: Obsolescence 1-7 mod, Placer Mining 1-6, Auriferous Shovel 1-7 mod, Shovel of the Ancients 2-7 mod
- **Enutrof agility**: `vital` - 56% weighted damaging spell value has modifiable range; 56% has modifiable max range >=4; 0% is max range <=2. Top: Hard Cash 1-5, Bankruptcy 1-8 mod, Opportuneness 1-8, Loafylactic 1-7 mod
- **Feca strength**: `useful` - 37% weighted damaging spell value has modifiable range; 37% has modifiable max range >=4; 15% is max range <=2. Top: Distrust 0-9 mod, Barrier 0-6, Backlash 1-4, Tetany 1-1
- **Feca intelligence**: `vital` - 80% weighted damaging spell value has modifiable range; 80% has modifiable max range >=4; 0% is max range <=2. Top: Distrust 0-9 mod, Barrier 0-6, Lethargy 1-5 mod, Languor 1-6 mod
- **Feca chance**: `vital` - 85% weighted damaging spell value has modifiable range; 85% has modifiable max range >=4; 0% is max range <=2. Top: Distrust 0-9 mod, Barrier 0-6, Getaway 1-6 mod, Bubble 1-8 mod
- **Feca agility**: `useful` - 38% weighted damaging spell value has modifiable range; 38% has modifiable max range >=4; 0% is max range <=2. Top: Distrust 0-9 mod, Barrier 0-6, Gust 1-5, Typhoon 1-4
- **Foggernaut strength**: `nearly useless` - 8% weighted damaging spell value has modifiable range; 8% has modifiable max range >=4; 0% is max range <=2. Top: Drill 1-7, Harpooner 1-7, Mooring 1-7 mod, Backwash 0-7 mod
- **Foggernaut intelligence**: `nearly useless` - 1% weighted damaging spell value has modifiable range; 1% has modifiable max range >=4; 0% is max range <=2. Top: Drill 1-7, Harpooner 1-7, Valve 1-8, Hoofbeat 0-6
- **Foggernaut chance**: `nearly useless` - 15% weighted damaging spell value has modifiable range; 15% has modifiable max range >=4; 0% is max range <=2. Top: Drill 1-7, Harpooner 1-7, Torrent 1-4 mod, Periscope 1-5
- **Foggernaut agility**: `nearly useless` - 10% weighted damaging spell value has modifiable range; 10% has modifiable max range >=4; 0% is max range <=2. Top: Drill 1-7, Harpooner 1-7, Pilfer 1-7, Corrosion 1-6 mod
- **Forgelance strength**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 60% is max range <=2. Top: Upheaval 1-1, Slingshot 1-5, Earthen Weakness 1-2, Middle Earth 0-0
- **Forgelance intelligence**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 59% is max range <=2. Top: Burning Estoc 1-2, Fire Lance 2-6, Hot Iron 1-2, Maelstrom 0-1
- **Forgelance chance**: `vital` - 58% weighted damaging spell value has modifiable range; 58% has modifiable max range >=4; 16% is max range <=2. Top: Octave 1-1, Lance of the Lake 1-5 mod, Biting Trident 1-6 mod, Elding 1-6 mod
- **Forgelance agility**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 29% is max range <=2. Top: No Myr Javelin 2-5, Brass Volley 1-6, Cyclone Lancer 2-6, Windmill 0-1
- **Huppermage strength**: `marginal` - 24% weighted damaging spell value has modifiable range; 24% has modifiable max range >=4; 7% is max range <=2. Top: Morph 1-4, Arcane Torrent 1-8, Elemental Drain 1-3, Manifestation 1-8 mod
- **Huppermage intelligence**: `nearly useless` - 12% weighted damaging spell value has modifiable range; 12% has modifiable max range >=4; 7% is max range <=2. Top: Morph 1-4, Arcane Torrent 1-8, Elemental Drain 1-3, Manifestation 1-8 mod
- **Huppermage chance**: `nearly useless` - 9% weighted damaging spell value has modifiable range; 9% has modifiable max range >=4; 15% is max range <=2. Top: Morph 1-4, Arcane Torrent 1-8, Elemental Drain 1-3, Manifestation 1-8 mod
- **Huppermage agility**: `nearly useless` - 15% weighted damaging spell value has modifiable range; 15% has modifiable max range >=4; 7% is max range <=2. Top: Morph 1-4, Arcane Torrent 1-8, Elemental Drain 1-3, Manifestation 1-8 mod
- **Iop strength**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 60% is max range <=2. Top: Concentration 1-1, Accumulation 0-4, Sword of Iop 0-8, Pressure 1-4
- **Iop intelligence**: `marginal` - 19% weighted damaging spell value has modifiable range; 19% has modifiable max range >=4; 5% is max range <=2. Top: Tumult 0-5, Strengthstorm 3-5, Sentence 0-6 mod, Destructive Sword 1-3
- **Iop chance**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 32% is max range <=2. Top: Endurance 0-2, Outpouring 1-6, Threat 1-3, Fervour 1-5
- **Iop agility**: `nearly useless` - 16% weighted damaging spell value has modifiable range; 16% has modifiable max range >=4; 48% is max range <=2. Top: Celestial Sword 0-4, Divine Sword 0-0, Destructive Ring 0-2, Fracture 1-4
- **Masqueraider strength**: `marginal` - 24% weighted damaging spell value has modifiable range; 24% has modifiable max range >=4; 32% is max range <=2. Top: Furia 1-3, Carnavalo 1-3, Catalepsy 0-0, Martelo 1-5 mod
- **Masqueraider intelligence**: `useful` - 32% weighted damaging spell value has modifiable range; 32% has modifiable max range >=4; 30% is max range <=2. Top: Inferno 1-2, Apostasy 2-6 mod, Decoy 1-4, Brincaderia 1-8 mod
- **Masqueraider chance**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 11% is max range <=2. Top: Boliche 1-5, Bocciara 1-5, Ponteira 1-7, Carnavalo 1-3
- **Masqueraider agility**: `nearly useless` - 17% weighted damaging spell value has modifiable range; 17% has modifiable max range >=4; 23% is max range <=2. Top: Cavalcade 1-5, Retention 1-3, Picada 2-6 mod, Capering 1-1
- **Osamodas strength**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 12% is max range <=2. Top: Sedimentation 1-3, Woolly Sledgehammer 1-3, Constriction 1-5, Crackler Punch 1-3
- **Osamodas intelligence**: `useful` - 49% weighted damaging spell value has modifiable range; 49% has modifiable max range >=4; 7% is max range <=2. Top: Sparkmeleon 1-5 mod, Dragon's Breath 1-7 mod, Cross Scale 1-3, Dragonic 1-7
- **Osamodas chance**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 16% is max range <=2. Top: Aquatic Wave 1-7, Geyser 1-5, Batra 0-0, Whirlwind 1-4
- **Osamodas agility**: `useful` - 55% weighted damaging spell value has modifiable range; 55% has modifiable max range >=4; 20% is max range <=2. Top: Canine 1-7 mod, Gambol 1-1, Plucking 1-5 mod, Repulsive Fang 1-5
- **Ouginak strength**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 84% is max range <=2. Top: Mastiff 1-2, Humerus 1-1, Watchdog 1-1, Amarok 0-3
- **Ouginak intelligence**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 62% is max range <=2. Top: Hunt 1-2, Woof 1-2, Tally Ho 1-4, Tracking 1-6
- **Ouginak chance**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 33% is max range <=2. Top: Ulna 1-10, Radius 1-2, Calcaneus 1-7, Marrow Bone 1-6
- **Ouginak agility**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 66% is max range <=2. Top: Stripping 1-2, Muzzle 1-2, Carrion 1-4, Bloodhound 1-3
- **Pandawa strength**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 43% is max range <=2. Top: Pandatak 1-6, Filthipint 0-0, Debauchery 1-6, Hangover 1-2
- **Pandawa intelligence**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 0% is max range <=2. Top: Pandilongation 1-5, Absinthe 1-5, Explosive Flask 1-8, Explosive Palm 1-5
- **Pandawa chance**: `marginal` - 31% weighted damaging spell value has modifiable range; 31% has modifiable max range >=4; 0% is max range <=2. Top: Melancholy 1-10, Brandy 1-4, Tipple 1-6 mod, Alcoshu 1-6 mod
- **Pandawa agility**: `useful` - 41% weighted damaging spell value has modifiable range; 41% has modifiable max range >=4; 0% is max range <=2. Top: Liqueur 1-7 mod, Nausea 1-8, Propulsion 1-4, Alcoholic Breath 1-6
- **Rogue strength**: `nearly useless` - 5% weighted damaging spell value has modifiable range; 5% has modifiable max range >=4; 0% is max range <=2. Top: Obliteration 1-5, Musket 1-5, Arquebus 1-6, Bombard 1-6
- **Rogue intelligence**: `vital` - 61% weighted damaging spell value has modifiable range; 61% has modifiable max range >=4; 0% is max range <=2. Top: Extraction 1-8 mod, Shot Pellets 0-5, Weigh Down 1-5 mod, Pulsar 1-6
- **Rogue chance**: `nearly useless` - 12% weighted damaging spell value has modifiable range; 12% has modifiable max range >=4; 17% is max range <=2. Top: Stolen Goods 1-5, Shrapnel 1-5, Blunderbuss 1-4, Deception 0-1
- **Rogue agility**: `vital` - 67% weighted damaging spell value has modifiable range; 67% has modifiable max range >=4; 0% is max range <=2. Top: Cadence 1-7 mod, Machine Gun 1-6 mod, Boomerang Daggers 1-7, Carbine 1-8
- **Sacrier strength**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 94% is max range <=2. Top: Decimation 1-1, Gash 1-1, Torture 1-1, Ravages 1-6
- **Sacrier intelligence**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 0% is max range <=2. Top: Excruciating Pain 0-5, Hostility 1-4, Absorption 1-6, Immolation 0-4
- **Sacrier chance**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 5% is max range <=2. Top: Nervousness 0-4, Stase 1-5, Clobbering 0-5, Projection 1-2
- **Sacrier agility**: `nearly useless` - 0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 94% is max range <=2. Top: Fury 1-1, Hemorrhage 1-1, Assault 1-2, Carnage 1-1
- **Sadida strength**: `marginal` - 27% weighted damaging spell value has modifiable range; 27% has modifiable max range >=4; 5% is max range <=2. Top: Force of Nature 1-5, Bramble 1-8 mod, Aggressive Bramble 1-6 mod, Poisoned Undergrowth 1-8 mod
- **Sadida intelligence**: `vital` - 57% weighted damaging spell value has modifiable range; 57% has modifiable max range >=4; 0% is max range <=2. Top: Plaguing Bramble 1-63, Bush Fire 1-7 mod, Prickly Embers 1-7 mod, Voodoo Curse 1-5
- **Sadida chance**: `useful` - 45% weighted damaging spell value has modifiable range; 45% has modifiable max range >=4; 24% is max range <=2. Top: Bane 1-2, Mangrove 1-8 mod, Dolly Sacrifice 1-8, Bush Fire 1-7 mod
- **Sadida agility**: `useful` - 51% weighted damaging spell value has modifiable range; 51% has modifiable max range >=4; 21% is max range <=2. Top: Inoculation 1-8, Paralysing Bramble 1-7 mod, Contagion 1-7 mod, Shake 0-0
- **Sram strength**: `vital` - 76% weighted damaging spell value has modifiable range; 76% has modifiable max range >=4; 6% is max range <=2. Top: Malevolent Trap 1-6 mod, Pitfall 1-4, Lethal Attack 1-2, Lethal Trap 1-4 mod
- **Sram intelligence**: `marginal` - 21% weighted damaging spell value has modifiable range; 21% has modifiable max range >=4; 0% is max range <=2. Top: Plotter 1-3, Fragmentation Trap 1-6 mod, Deviousness 1-6, Cut-Throat 1-7
- **Sram chance**: `useful` - 42% weighted damaging spell value has modifiable range; 42% has modifiable max range >=4; 11% is max range <=2. Top: Plotter 1-3, Waylaying 0-6 mod, Miry Trap 1-6 mod, Raiding 1-2
- **Sram agility**: `useful` - 41% weighted damaging spell value has modifiable range; 41% has modifiable max range >=4; 0% is max range <=2. Top: Toxines 1-7 mod, Plotter 1-3, Con 1-6, Epidemic 1-5
- **Xelor strength**: `marginal` - 19% weighted damaging spell value has modifiable range; 19% has modifiable max range >=4; 0% is max range <=2. Top: Knell 0-3, Dark Ray 1-6, Shadowy Beam 1-5 mod, Souvenir 1-6 mod
- **Xelor intelligence**: `useful` - 41% weighted damaging spell value has modifiable range; 41% has modifiable max range >=4; 6% is max range <=2. Top: Knell 0-3, Temporal Dust 0-6 mod, Temporal Suspension 1-6 mod, Xelor's Sandglass 1-8 mod
- **Xelor chance**: `marginal` - 22% weighted damaging spell value has modifiable range; 22% has modifiable max range >=4; 0% is max range <=2. Top: Knell 0-3, Time Theft 1-5, Clock 1-6, Petrification 1-7 mod
- **Xelor agility**: `marginal` - 25% weighted damaging spell value has modifiable range; 25% has modifiable max range >=4; 6% is max range <=2. Top: Knell 0-3, Drying Up 1-6, Shrivelling 1-6 mod, Pendulum 1-4

## Details

### Cra strength - vital

100% weighted damaging spell value has modifiable range; 100% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Arrow of Judgement | 1-9 | True | True | 3 | None | 47.5 | EARTH_DAMAGE, EARTH_STEAL |
| Lashing Arrow | 1-6 | True | True | 3 | None | 27.0 | EARTH_DAMAGE |
| Covering Fire | 3-10 | True | False | 4 | None | 20.0 | EARTH_DAMAGE |
| Barricade Shot | 1-8 | True | True | 3 | None | 18.67 | EARTH_DAMAGE |
| Persecuting Arrow | 3-10 | True | True | 3 | None | 18.67 | EARTH_DAMAGE, WATER_DAMAGE |
| Destructive Bolts | 1-8 | True | True | 4 | None | 18.5 | EARTH_DAMAGE |

### Cra intelligence - vital

100% weighted damaging spell value has modifiable range; 100% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Fulminating Arrow | 1-8 | True | True | 4 | None | 91.5 | FIRE_DAMAGE |
| Exploding Arrow | 1-7 | True | True | 2 | None | 54.75 | FIRE_DAMAGE, FIRE_STEAL |
| Explosive Arrow | 1-8 | True | True | 4 | None | 32.0 | FIRE_DAMAGE |
| Tyrannical Arrow | 2-7 | True | True | 4 | 1 | 22.5 | AIR_DAMAGE, FIRE_DAMAGE |
| Repulsive Shot | 1-5 | True | True | 3 | None | 20.0 | FIRE_DAMAGE |
| Burning Arrows | 1-5 | True | True | 4 | None | 17.25 | FIRE_DAMAGE |

### Cra chance - vital

100% weighted damaging spell value has modifiable range; 100% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Redemption Arrow | 4-8 | True | True | 3 | None | 49.0 | WATER_DAMAGE |
| Frozen Arrow | 1-10 | True | True | 3 | None | 26.0 | WATER_DAMAGE |
| Persecuting Arrow | 3-10 | True | True | 3 | None | 18.67 | EARTH_DAMAGE, WATER_DAMAGE |
| Atonement Arrow | 6-10 | True | True | 4 | 1 | 18.0 | WATER_DAMAGE |
| Immobilising Arrow | 1-10 | True | True | 2 | None | 18.0 | WATER_STEAL |
| Slow Down Arrow | 1-8 | True | True | 4 | None | 17.5 | WATER_DAMAGE |

### Cra agility - vital

100% weighted damaging spell value has modifiable range; 100% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Devouring Arrow | 1-6 | True | True | 3 | None | 180.67 | AIR_DAMAGE, AIR_STEAL |
| Piercing Shot | 1-8 | True | False | 4 | None | 84.0 | AIR_DAMAGE |
| Tormenting Arrow | 1-10 | True | True | 4 | None | 30.75 | AIR_DAMAGE |
| Optical Arrow | 0-12 | True | True | 3 | None | 25.0 | AIR_DAMAGE |
| Tyrannical Arrow | 2-7 | True | True | 4 | 1 | 22.5 | AIR_DAMAGE, FIRE_DAMAGE |
| Retreating Shot | 1-8 | True | True | 3 | None | 17.67 | AIR_DAMAGE |

### Ecaflip strength - vital

60% weighted damaging spell value has modifiable range; 60% has modifiable max range >=4; 20% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Trickery | 1-5 | True | True | 5 | None | 100.8 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Rekop | 1-5 | True | True | 5 | None | 86.4 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Misadventure | 0-2 | False | True | 4 | None | 52.75 | EARTH_DAMAGE, EARTH_STEAL |
| Heads or Tails | 1-7 | True | True | 3 | None | 46.5 | EARTH_DAMAGE |
| Feline Spirit | 1-1 | False | False | 3 | None | 32.5 | EARTH_DAMAGE |
| Fate of Ecaflip | 1-5 | False | True | 4 | None | 30.0 | EARTH_DAMAGE |

### Ecaflip intelligence - vital

86% weighted damaging spell value has modifiable range; 86% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Trickery | 1-5 | True | True | 5 | None | 100.8 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Rekop | 1-5 | True | True | 5 | None | 86.4 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Topkaj | 1-7 | True | True | 3 | None | 28.5 | FIRE_DAMAGE |
| Meowch | 1-5 | False | True | 4 | None | 27.0 | FIRE_DAMAGE |
| Pawpads | 1-7 | True | True | 3 | None | 26.5 | FIRE_DAMAGE |
| Yowling | 1-5 | False | False | 4 | None | 16.0 | FIRE_DAMAGE |

### Ecaflip chance - vital

69% weighted damaging spell value has modifiable range; 69% has modifiable max range >=4; 14% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Trickery | 1-5 | True | True | 5 | None | 100.8 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Rekop | 1-5 | True | True | 5 | None | 86.4 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| All or Nothing | 0-2 | False | False | 2 | 2 | 28.6 | WATER_DAMAGE |
| Misfortune | 1-6 | True | True | 3 | None | 28.5 | WATER_DAMAGE |
| Bluff | 1-6 | False | True | 3 | None | 27.5 | WATER_DAMAGE |
| Playful Claw | 1-5 | False | False | 4 | None | 18.5 | WATER_DAMAGE |

### Ecaflip agility - vital

72% weighted damaging spell value has modifiable range; 72% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Trickery | 1-5 | True | True | 5 | None | 100.8 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Rekop | 1-5 | True | True | 5 | None | 86.4 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Balling Up | 1-4 | False | True | 3 | None | 30.5 | AIR_DAMAGE |
| Nerve | 1-8 | True | True | 4 | None | 27.75 | AIR_DAMAGE |
| Claw of Ceangal | 1-3 | False | True | 2 | None | 27.0 | AIR_DAMAGE |
| Reflex | 1-5 | False | True | 4 | None | 16.5 | AIR_DAMAGE |

### Eliotrope strength - vital

58% weighted damaging spell value has modifiable range; 58% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Persiflage | 1-5 | True | True | 3 | None | 27.0 | EARTH_DAMAGE |
| Sarcasm | 1-4 | False | True | 4 | None | 25.5 | EARTH_DAMAGE |
| Snub | 1-4 | True | True | 3 | None | 24.5 | EARTH_DAMAGE |
| Therapy | 1-7 | True | True | 3 | None | 22.0 | EARTH_DAMAGE |
| Convulsion | 2-5 | False | True | 3 | None | 14.0 | EARTH_DAMAGE |
| Shock | 2-6 | False | True | 3 | None | 13.33 | EARTH_DAMAGE |

### Eliotrope intelligence - marginal

18% weighted damaging spell value has modifiable range; 18% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Parasite | 1-4 | False | True | 5 | None | 42.0 | FIRE_DAMAGE |
| Lazybeam | 1-6 | False | True | 4 | None | 29.0 | FIRE_DAMAGE, FIRE_STEAL |
| Offence | 0-7 | True | True | 4 | None | 25.12 | FIRE_DAMAGE |
| Wakfu Ray | 2-5 | False | True | 3 | None | 18.0 | FIRE_DAMAGE |
| Affront | 1-7 | False | True | 3 | None | 14.33 | FIRE_DAMAGE |
| Virus | 0-4 | False | False | 4 | None | 9.0 | FIRE_DAMAGE |

### Eliotrope chance - useful

36% weighted damaging spell value has modifiable range; 36% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Audacious | 1-4 | False | False | 3 | None | 55.0 | WATER_DAMAGE |
| Insolence | 1-6 | False | True | 3 | None | 26.5 | WATER_DAMAGE |
| Composure | 1-8 | True | True | 4 | None | 25.5 | WATER_DAMAGE |
| Lightning Fist | 1-4 | False | True | 3 | None | 24.0 | WATER_DAMAGE |
| Affliction | 1-6 | True | True | 4 | None | 19.88 | WATER_DAMAGE |
| Tribulation | 1-7 | True | True | 3 | None | 15.0 | WATER_DAMAGE |

### Eliotrope agility - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Sermon | 1-5 | False | True | 4 | None | 26.25 | AIR_DAMAGE |
| Ridicule | 1-6 | False | True | 4 | None | 24.0 | AIR_DAMAGE |
| Insult | 1-3 | False | True | 3 | None | 18.0 | AIR_DAMAGE |
| Contempt | 1-7 | False | True | 3 | None | 17.0 | AIR_DAMAGE |
| Bullying | 0-6 | False | False | 3 | None | 16.0 | AIR_DAMAGE |
| Sinecure | 1-7 | False | False | 2 | None | 13.0 | AIR_DAMAGE |

### Eniripsa strength - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 29% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| War Cry | 0-0 | False | False | 4 | None | 19.5 | EARTH_DAMAGE |
| Ancestral Ointment | 0-7 | False | True | 4 | None | 18.25 | EARTH_DAMAGE |
| Profanity | 1-6 | False | True | 3 | None | 15.67 | EARTH_DAMAGE |
| Tribal Paintbrush | 0-6 | False | True | 3 | None | 13.67 | EARTH_DAMAGE |
| Ritual Word | 0-4 | False | True | 3 | 2 | 13.0 | EARTH_DAMAGE |
| Scalpel | 0-2 | False | True | 4 | 3 | 12.04 | BEST_ELEMENT_DAMAGE |

### Eniripsa intelligence - vital

78% weighted damaging spell value has modifiable range; 78% has modifiable max range >=4; 13% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Deafening Cry | 1-6 | True | True | 3 | None | 17.33 | FIRE_DAMAGE |
| Raucous Word | 0-5 | True | True | 3 | None | 17.0 | FIRE_DAMAGE |
| Pilfering | 1-8 | True | True | 3 | None | 14.0 | FIRE_STEAL |
| Scalpel | 0-2 | False | True | 4 | 3 | 12.04 | BEST_ELEMENT_DAMAGE |
| Turbulent Word | 0-4 | True | True | 4 | None | 9.62 | FIRE_DAMAGE |
| Commotion | 1-3 | False | True | 4 | None | 8.75 | FIRE_DAMAGE |

### Eniripsa chance - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 11% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Vampiric Word | 1-6 | False | True | 3 | None | 28.5 | WATER_STEAL |
| Bloodless Word | 0-5 | False | True | 4 | None | 19.25 | WATER_DAMAGE |
| Sobs | 1-6 | False | False | 3 | None | 16.33 | WATER_DAMAGE |
| Scalpel | 0-2 | False | True | 4 | 3 | 12.04 | BEST_ELEMENT_DAMAGE |
| Cryotherapy | 0-6 | False | True | 3 | None | 10.0 | WATER_DAMAGE |
| Forbidden Word | 0-4 | False | True | 5 | None | 9.6 | WATER_DAMAGE |

### Eniripsa agility - vital

93% weighted damaging spell value has modifiable range; 93% has modifiable max range >=4; 7% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Secret Word | 1-10 | True | True | 4 | None | 59.5 | AIR_DAMAGE |
| Malicious Word | 1-8 | True | True | 4 | None | 24.0 | AIR_DAMAGE |
| Mischievous Word | 1-7 | True | True | 3 | None | 22.5 | AIR_DAMAGE |
| Flowery Word | 0-6 | True | True | 4 | None | 17.5 | AIR_DAMAGE |
| Murmur | 0-6 | True | True | 2 | None | 17.0 | AIR_DAMAGE |
| Prankster's Word | 0-6 | True | True | 3 | None | 15.33 | AIR_DAMAGE |

### Enutrof strength - useful

43% weighted damaging spell value has modifiable range; 43% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Collapse | 1-7 | False | True | 3 | 1 | 30.67 | EARTH_DAMAGE |
| Prime of Life | 1-5 | False | True | 3 | None | 30.0 | EARTH_DAMAGE |
| Shovel Throwing | 1-8 | True | True | 4 | None | 25.12 | EARTH_DAMAGE |
| Mound | 2-8 | True | True | 3 | None | 14.0 | EARTH_DAMAGE |
| Peat Bog | 1-8 | True | True | 4 | None | 5.88 | EARTH_DAMAGE |

### Enutrof intelligence - vital

82% weighted damaging spell value has modifiable range; 82% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Unsummoning | 1-5 | True | True | 4 | None | 60.75 | FIRE_DAMAGE |
| Mine Fire | 1-5 | True | True | 4 | None | 24.0 | FIRE_DAMAGE |
| Shovel Kiss | 1-8 | True | False | 3 | None | 21.0 | FIRE_DAMAGE |
| Ghostly Shovel | 1-8 | True | True | 3 | None | 18.0 | FIRE_DAMAGE |
| Firedamp Explosion | 1-8 | False | True | 3 | None | 16.33 | FIRE_DAMAGE |
| Deposit | 0-8 | False | True | 3 | None | 10.17 | FIRE_DAMAGE |

### Enutrof chance - vital

78% weighted damaging spell value has modifiable range; 78% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Obsolescence | 1-7 | True | True | 3 | None | 28.0 | WATER_DAMAGE |
| Placer Mining | 1-6 | False | True | 3 | 1 | 26.67 | WATER_DAMAGE |
| Auriferous Shovel | 1-7 | True | True | 4 | None | 25.5 | WATER_DAMAGE |
| Shovel of the Ancients | 2-7 | True | True | 4 | None | 20.0 | WATER_DAMAGE |
| Coin Throwing | 0-12 | True | True | 2 | None | 14.0 | WATER_DAMAGE |
| Sieving | 1-5 | True | True | 3 | None | 9.0 | WATER_DAMAGE |

### Enutrof agility - vital

56% weighted damaging spell value has modifiable range; 56% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Hard Cash | 1-5 | False | True | 3 | 1 | 28.67 | AIR_DAMAGE |
| Bankruptcy | 1-8 | True | True | 4 | None | 28.5 | AIR_DAMAGE |
| Opportuneness | 1-8 | False | True | 2 | None | 22.5 | AIR_DAMAGE |
| Loafylactic | 1-7 | True | True | 3 | None | 20.0 | AIR_DAMAGE |
| Spade of the Ancients | 2-8 | True | True | 4 | None | 17.0 | AIR_DAMAGE |

### Feca strength - useful

37% weighted damaging spell value has modifiable range; 37% has modifiable max range >=4; 15% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Distrust | 0-9 | True | True | 2 | 1 | 86.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Barrier | 0-6 | False | True | 3 | 2 | 37.27 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Backlash | 1-4 | False | True | 3 | None | 31.0 | EARTH_DAMAGE |
| Tetany | 1-1 | False | True | 4 | None | 28.5 | EARTH_DAMAGE |
| Torpor | 1-5 | False | True | 3 | None | 28.5 | EARTH_DAMAGE |
| Dirt Floor | 0-5 | False | False | 3 | 3 | 14.08 | EARTH_DAMAGE |

### Feca intelligence - vital

80% weighted damaging spell value has modifiable range; 80% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Distrust | 0-9 | True | True | 2 | 1 | 86.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Barrier | 0-6 | False | True | 3 | 2 | 37.27 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Lethargy | 1-5 | True | True | 3 | None | 29.5 | FIRE_DAMAGE |
| Languor | 1-6 | True | True | 3 | None | 28.0 | FIRE_DAMAGE |
| Shepherd's Crook | 1-7 | True | True | 3 | None | 25.5 | FIRE_DAMAGE |
| Cowbell | 1-7 | True | True | 4 | None | 17.0 | FIRE_DAMAGE |

### Feca chance - vital

85% weighted damaging spell value has modifiable range; 85% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Distrust | 0-9 | True | True | 2 | 1 | 86.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Barrier | 0-6 | False | True | 3 | 2 | 37.27 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Getaway | 1-6 | True | True | 3 | None | 28.0 | WATER_DAMAGE |
| Bubble | 1-8 | True | True | 2 | None | 27.0 | WATER_DAMAGE |
| Sudden Shower | 1-7 | True | True | 4 | None | 19.0 | WATER_DAMAGE |
| Nimbus | 0-7 | True | True | 3 | None | 16.0 | WATER_DAMAGE |

### Feca agility - useful

38% weighted damaging spell value has modifiable range; 38% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Distrust | 0-9 | True | True | 2 | 1 | 86.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Barrier | 0-6 | False | True | 3 | 2 | 37.27 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Gust | 1-5 | False | True | 2 | None | 20.0 | AIR_DAMAGE |
| Typhoon | 1-4 | False | True | 3 | None | 17.33 | AIR_DAMAGE |
| Shiver | 1-4 | False | False | 4 | None | 17.0 | AIR_DAMAGE |
| Silbo | 1-6 | False | False | 3 | None | 16.0 | AIR_DAMAGE |

### Foggernaut strength - nearly useless

8% weighted damaging spell value has modifiable range; 8% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Drill | 1-7 | False | True | 2 | 3 | 418.6 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Harpooner | 1-7 | False | True | 2 | 3 | 221.33 | AIR_STEAL, BEST_ELEMENT_DAMAGE, EARTH_STEAL, FIRE_STEAL, WATER_STEAL |
| Mooring | 1-7 | True | True | 2 | None | 29.25 | EARTH_DAMAGE |
| Backwash | 0-7 | True | True | 2 | None | 25.5 | EARTH_DAMAGE |
| Capstan | 0-8 | False | True | 3 | None | 20.33 | EARTH_DAMAGE |
| Anchor | 0-8 | False | True | 4 | None | 18.25 | EARTH_DAMAGE |

### Foggernaut intelligence - nearly useless

1% weighted damaging spell value has modifiable range; 1% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Drill | 1-7 | False | True | 2 | 3 | 418.6 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Harpooner | 1-7 | False | True | 2 | 3 | 221.33 | AIR_STEAL, BEST_ELEMENT_DAMAGE, EARTH_STEAL, FIRE_STEAL, WATER_STEAL |
| Valve | 1-8 | False | True | 2 | None | 21.0 | FIRE_DAMAGE |
| Hoofbeat | 0-6 | False | True | 3 | None | 17.0 | FIRE_DAMAGE |
| Vapour | 0-5 | False | True | 3 | None | 10.33 | FIRE_DAMAGE |
| Turbine | 0-7 | False | True | 3 | None | 9.67 | FIRE_DAMAGE |

### Foggernaut chance - nearly useless

15% weighted damaging spell value has modifiable range; 15% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Drill | 1-7 | False | True | 2 | 3 | 418.6 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Harpooner | 1-7 | False | True | 2 | 3 | 221.33 | AIR_STEAL, BEST_ELEMENT_DAMAGE, EARTH_STEAL, FIRE_STEAL, WATER_STEAL |
| Torrent | 1-4 | True | True | 3 | None | 64.0 | WATER_DAMAGE |
| Periscope | 1-5 | False | True | 3 | None | 30.0 | WATER_DAMAGE |
| Spyglass | 0-6 | True | True | 3 | None | 27.0 | WATER_DAMAGE |
| Froth | 1-6 | True | True | 4 | None | 19.0 | WATER_DAMAGE |

### Foggernaut agility - nearly useless

10% weighted damaging spell value has modifiable range; 10% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Drill | 1-7 | False | True | 2 | 3 | 418.6 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Harpooner | 1-7 | False | True | 2 | 3 | 221.33 | AIR_STEAL, BEST_ELEMENT_DAMAGE, EARTH_STEAL, FIRE_STEAL, WATER_STEAL |
| Pilfer | 1-7 | False | True | 4 | None | 42.0 | AIR_DAMAGE |
| Corrosion | 1-6 | True | True | 3 | None | 28.0 | AIR_DAMAGE |
| Torpedo | 1-6 | True | True | 3 | None | 27.0 | AIR_DAMAGE |
| Trident | 1-6 | False | True | 3 | None | 20.0 | AIR_DAMAGE |

### Forgelance strength - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 60% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Upheaval | 1-1 | False | False | 3 | None | 20.67 | EARTH_DAMAGE |
| Slingshot | 1-5 | False | False | 3 | None | 17.67 | EARTH_DAMAGE |
| Earthen Weakness | 1-2 | False | True | 2 | None | 15.0 | EARTH_DAMAGE |
| Middle Earth | 0-0 | False | False | 3 | None | 10.67 | EARTH_DAMAGE |
| Seismic Pike | 1-1 | False | False | 3 | None | 9.17 | EARTH_DAMAGE |
| Vajra | 2-4 | False | False | 4 | 3 | 8.77 | BEST_ELEMENT_STEAL |

### Forgelance intelligence - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 59% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Burning Estoc | 1-2 | False | True | 3 | None | 16.33 | FIRE_DAMAGE |
| Fire Lance | 2-6 | False | False | 3 | None | 15.0 | FIRE_DAMAGE |
| Hot Iron | 1-2 | False | False | 3 | None | 14.33 | FIRE_DAMAGE |
| Maelstrom | 0-1 | False | False | 2 | 2 | 12.35 | FIRE_DAMAGE |
| Spicy Mill | 0-2 | False | True | 3 | None | 10.0 | FIRE_DAMAGE |
| Vajra | 2-4 | False | False | 4 | 3 | 8.77 | BEST_ELEMENT_STEAL |

### Forgelance chance - vital

58% weighted damaging spell value has modifiable range; 58% has modifiable max range >=4; 16% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Octave | 1-1 | False | False | 2 | None | 17.0 | WATER_DAMAGE |
| Lance of the Lake | 1-5 | True | True | 3 | None | 15.67 | WATER_DAMAGE |
| Biting Trident | 1-6 | True | True | 3 | None | 15.0 | WATER_DAMAGE |
| Elding | 1-6 | True | False | 4 | 2 | 11.05 | WATER_DAMAGE |
| Jormun | 0-8 | True | False | 3 | None | 10.67 | WATER_DAMAGE |
| Lightning-Javelin | 2-6 | True | False | 3 | None | 10.0 | WATER_DAMAGE |

### Forgelance agility - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 29% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| No Myr Javelin | 2-5 | False | True | 3 | None | 18.67 | AIR_DAMAGE |
| Brass Volley | 1-6 | False | True | 3 | None | 15.67 | AIR_DAMAGE |
| Cyclone Lancer | 2-6 | False | False | 3 | None | 10.67 | AIR_DAMAGE |
| Windmill | 0-1 | False | False | 3 | None | 10.33 | AIR_DAMAGE |
| Brass Rain | 0-1 | False | False | 2 | None | 10.0 | AIR_DAMAGE |
| Vajra | 2-4 | False | False | 4 | 3 | 8.77 | BEST_ELEMENT_STEAL |

### Huppermage strength - marginal

24% weighted damaging spell value has modifiable range; 24% has modifiable max range >=4; 7% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Morph | 1-4 | False | True | 3 | None | 280.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Arcane Torrent | 1-8 | False | True | 3 | 3 | 119.6 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Elemental Drain | 1-3 | False | True | 2 | None | 100.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Manifestation | 1-8 | True | False | 2 | None | 60.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Runification | 0-0 | False | False | 2 | None | 60.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Journey | 5-5 | False | False | 4 | 3 | 46.15 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |

### Huppermage intelligence - nearly useless

12% weighted damaging spell value has modifiable range; 12% has modifiable max range >=4; 7% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Morph | 1-4 | False | True | 3 | None | 280.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Arcane Torrent | 1-8 | False | True | 3 | 3 | 119.6 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Elemental Drain | 1-3 | False | True | 2 | None | 100.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Manifestation | 1-8 | True | False | 2 | None | 60.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Runification | 0-0 | False | False | 2 | None | 60.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Journey | 5-5 | False | False | 4 | 3 | 46.15 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |

### Huppermage chance - nearly useless

9% weighted damaging spell value has modifiable range; 9% has modifiable max range >=4; 15% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Morph | 1-4 | False | True | 3 | None | 280.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Arcane Torrent | 1-8 | False | True | 3 | 3 | 119.6 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Elemental Drain | 1-3 | False | True | 2 | None | 100.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Manifestation | 1-8 | True | False | 2 | None | 60.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Runification | 0-0 | False | False | 2 | None | 60.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Journey | 5-5 | False | False | 4 | 3 | 46.15 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |

### Huppermage agility - nearly useless

15% weighted damaging spell value has modifiable range; 15% has modifiable max range >=4; 7% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Morph | 1-4 | False | True | 3 | None | 280.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Arcane Torrent | 1-8 | False | True | 3 | 3 | 119.6 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Elemental Drain | 1-3 | False | True | 2 | None | 100.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Manifestation | 1-8 | True | False | 2 | None | 60.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Runification | 0-0 | False | False | 2 | None | 60.0 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Journey | 5-5 | False | False | 4 | 3 | 46.15 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |

### Iop strength - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 60% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Concentration | 1-1 | False | True | 2 | None | 81.0 | EARTH_DAMAGE |
| Accumulation | 0-4 | False | True | 3 | None | 24.0 | EARTH_DAMAGE |
| Sword of Iop | 0-8 | False | True | 4 | None | 19.5 | EARTH_DAMAGE |
| Pressure | 1-4 | False | True | 3 | None | 18.67 | EARTH_DAMAGE |
| Iop's Wrath | 1-1 | False | True | 7 | 3 | 16.81 | EARTH_DAMAGE |
| Pygmachia | 1-6 | False | True | 2 | None | 15.0 | EARTH_DAMAGE |

### Iop intelligence - marginal

19% weighted damaging spell value has modifiable range; 19% has modifiable max range >=4; 5% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Tumult | 0-5 | False | True | 4 | 1 | 200.0 | FIRE_DAMAGE |
| Strengthstorm | 3-5 | False | True | 3 | None | 101.0 | FIRE_DAMAGE |
| Sentence | 0-6 | True | True | 2 | None | 63.75 | FIRE_DAMAGE |
| Destructive Sword | 1-3 | False | True | 4 | None | 17.0 | FIRE_DAMAGE |
| Chopper | 1-6 | True | True | 3 | None | 16.67 | FIRE_DAMAGE |
| Sword of Fate | 1-2 | False | False | 4 | 2 | 13.0 | FIRE_DAMAGE |

### Iop chance - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 32% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Endurance | 0-2 | False | True | 3 | None | 32.0 | WATER_DAMAGE |
| Outpouring | 1-6 | False | True | 4 | None | 30.0 | WATER_DAMAGE |
| Threat | 1-3 | False | True | 3 | None | 27.0 | WATER_DAMAGE |
| Fervour | 1-5 | False | True | 3 | None | 25.5 | WATER_DAMAGE |
| Sword of Judgement | 0-4 | False | False | 4 | None | 20.75 | WATER_DAMAGE |
| Cleaver | 0-4 | False | True | 5 | None | 20.0 | WATER_DAMAGE |

### Iop agility - nearly useless

16% weighted damaging spell value has modifiable range; 16% has modifiable max range >=4; 48% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Celestial Sword | 0-4 | False | True | 4 | None | 19.0 | AIR_DAMAGE |
| Divine Sword | 0-0 | False | False | 3 | None | 18.67 | AIR_DAMAGE |
| Destructive Ring | 0-2 | False | True | 3 | None | 17.33 | AIR_DAMAGE |
| Fracture | 1-4 | False | False | 4 | None | 17.0 | AIR_DAMAGE |
| Pounding | 1-7 | True | True | 4 | None | 16.0 | AIR_DAMAGE |
| Intimidation | 1-2 | False | True | 2 | None | 8.78 | BEST_ELEMENT_DAMAGE |

### Masqueraider strength - marginal

24% weighted damaging spell value has modifiable range; 24% has modifiable max range >=4; 32% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Furia | 1-3 | False | True | 3 | None | 37.0 | EARTH_DAMAGE |
| Carnavalo | 1-3 | False | True | 3 | 5 | 18.14 | BEST_ELEMENT_DAMAGE |
| Catalepsy | 0-0 | False | False | 3 | None | 16.0 | EARTH_STEAL |
| Martelo | 1-5 | True | False | 3 | None | 15.67 | EARTH_DAMAGE |
| Apathy | 2-8 | True | True | 4 | None | 15.0 | EARTH_DAMAGE |
| Shove Off | 1-1 | False | True | 3 | 2 | 14.73 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |

### Masqueraider intelligence - useful

32% weighted damaging spell value has modifiable range; 32% has modifiable max range >=4; 30% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Inferno | 1-2 | False | True | 4 | None | 30.0 | FIRE_DAMAGE |
| Apostasy | 2-6 | True | True | 3 | None | 26.5 | FIRE_DAMAGE |
| Decoy | 1-4 | False | True | 3 | None | 26.0 | FIRE_STEAL |
| Brincaderia | 1-8 | True | True | 2 | None | 21.0 | FIRE_DAMAGE |
| Carnavalo | 1-3 | False | True | 3 | 5 | 18.14 | BEST_ELEMENT_DAMAGE |
| Shove Off | 1-1 | False | True | 3 | 2 | 14.73 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |

### Masqueraider chance - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 11% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Boliche | 1-5 | False | True | 3 | None | 27.0 | WATER_DAMAGE |
| Bocciara | 1-5 | False | True | 2 | None | 26.25 | WATER_DAMAGE |
| Ponteira | 1-7 | False | False | 3 | None | 21.5 | WATER_DAMAGE |
| Carnavalo | 1-3 | False | True | 3 | 5 | 18.14 | BEST_ELEMENT_DAMAGE |
| Distance | 2-10 | False | True | 3 | None | 16.67 | WATER_DAMAGE |
| Parafuso | 0-5 | False | True | 3 | None | 15.0 | WATER_STEAL |

### Masqueraider agility - nearly useless

17% weighted damaging spell value has modifiable range; 17% has modifiable max range >=4; 23% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Cavalcade | 1-5 | False | True | 4 | None | 30.0 | AIR_DAMAGE |
| Retention | 1-3 | False | True | 3 | None | 29.0 | AIR_STEAL |
| Picada | 2-6 | True | False | 3 | None | 26.5 | AIR_DAMAGE |
| Capering | 1-1 | False | True | 3 | None | 20.0 | AIR_DAMAGE |
| Carnavalo | 1-3 | False | True | 3 | 5 | 18.14 | BEST_ELEMENT_DAMAGE |
| Agular | 1-7 | False | True | 4 | None | 16.0 | AIR_DAMAGE |

### Osamodas strength - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 12% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Sedimentation | 1-3 | False | True | 4 | None | 30.0 | EARTH_DAMAGE |
| Woolly Sledgehammer | 1-3 | False | True | 2 | None | 28.5 | EARTH_DAMAGE |
| Constriction | 1-5 | False | True | 3 | None | 26.5 | EARTH_STEAL |
| Crackler Punch | 1-3 | False | True | 4 | None | 19.25 | EARTH_DAMAGE |
| Gobball Fleece | 0-2 | False | False | 4 | None | 17.0 | EARTH_DAMAGE |
| Fossil | 0-4 | False | True | 3 | None | 16.0 | EARTH_DAMAGE |

### Osamodas intelligence - useful

49% weighted damaging spell value has modifiable range; 49% has modifiable max range >=4; 7% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Sparkmeleon | 1-5 | True | True | 3 | None | 27.5 | FIRE_DAMAGE |
| Dragon's Breath | 1-7 | True | True | 4 | None | 24.75 | FIRE_DAMAGE |
| Cross Scale | 1-3 | False | True | 4 | None | 17.5 | FIRE_DAMAGE |
| Dragonic | 1-7 | False | True | 3 | None | 14.67 | FIRE_DAMAGE |
| Flaming Crow | 1-5 | False | False | 2 | None | 13.5 | FIRE_DAMAGE |
| Dragon Heart | 0-0 | False | False | 3 | None | 7.67 | FIRE_DAMAGE |

### Osamodas chance - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 16% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Aquatic Wave | 1-7 | False | True | 3 | None | 27.0 | WATER_DAMAGE |
| Geyser | 1-5 | False | True | 3 | None | 26.5 | WATER_DAMAGE |
| Batra | 0-0 | False | False | 4 | None | 19.0 | WATER_DAMAGE |
| Whirlwind | 1-4 | False | True | 4 | None | 16.25 | WATER_DAMAGE |
| Scalding Poison | 1-6 | False | True | 2 | None | 16.0 | WATER_DAMAGE |
| Aquaculture | 1-4 | False | True | 4 | None | 14.75 | WATER_DAMAGE |

### Osamodas agility - useful

55% weighted damaging spell value has modifiable range; 55% has modifiable max range >=4; 20% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Canine | 1-7 | True | True | 3 | None | 22.5 | AIR_DAMAGE |
| Gambol | 1-1 | False | True | 2 | None | 20.0 | AIR_DAMAGE |
| Plucking | 1-5 | True | True | 3 | None | 16.33 | AIR_DAMAGE |
| Repulsive Fang | 1-5 | False | True | 2 | None | 16.0 | AIR_DAMAGE |
| Duster | 1-6 | True | True | 4 | None | 15.5 | AIR_DAMAGE |
| Takeoff | 1-3 | False | False | 4 | None | 8.75 | AIR_DAMAGE |

### Ouginak strength - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 84% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Mastiff | 1-2 | False | True | 2 | None | 54.0 | EARTH_DAMAGE, EARTH_STEAL |
| Humerus | 1-1 | False | False | 4 | None | 21.75 | EARTH_DAMAGE |
| Watchdog | 1-1 | False | False | 3 | None | 21.67 | EARTH_DAMAGE |
| Amarok | 0-3 | False | True | 3 | None | 19.67 | EARTH_DAMAGE |
| Cerberus | 1-2 | False | True | 4 | None | 4.12 | EARTH_DAMAGE |

### Ouginak intelligence - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 62% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Hunt | 1-2 | False | True | 4 | None | 62.25 | FIRE_DAMAGE |
| Woof | 1-2 | False | True | 2 | None | 31.5 | FIRE_DAMAGE |
| Tally Ho | 1-4 | False | True | 3 | None | 30.0 | FIRE_DAMAGE |
| Tracking | 1-6 | False | True | 3 | None | 22.0 | FIRE_DAMAGE |
| Tetanisation | 1-2 | False | True | 4 | None | 21.75 | FIRE_DAMAGE |
| Jaw | 0-5 | False | True | 3 | None | 19.67 | FIRE_DAMAGE |

### Ouginak chance - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 33% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Ulna | 1-10 | False | True | 2 | None | 25.5 | WATER_DAMAGE |
| Radius | 1-2 | False | True | 3 | None | 22.67 | WATER_DAMAGE |
| Calcaneus | 1-7 | False | True | 2 | None | 22.5 | WATER_DAMAGE |
| Marrow Bone | 1-6 | False | True | 3 | None | 22.5 | WATER_DAMAGE |
| Tibia | 0-0 | False | False | 4 | None | 21.25 | WATER_DAMAGE |
| Vertebra | 1-3 | False | True | 4 | None | 17.0 | WATER_DAMAGE |

### Ouginak agility - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 66% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Stripping | 1-2 | False | True | 5 | 1 | 154.0 | AIR_DAMAGE |
| Muzzle | 1-2 | False | True | 5 | None | 83.0 | AIR_DAMAGE |
| Carrion | 1-4 | False | True | 3 | None | 30.5 | AIR_DAMAGE |
| Bloodhound | 1-3 | False | True | 3 | None | 29.5 | AIR_DAMAGE |
| Beaten | 1-6 | False | True | 3 | None | 28.5 | AIR_DAMAGE |
| Carving Up | 1-4 | False | True | 4 | None | 21.25 | AIR_DAMAGE |

### Pandawa strength - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 43% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Pandatak | 1-6 | False | True | 4 | None | 44.0 | EARTH_DAMAGE |
| Filthipint | 0-0 | False | False | 4 | None | 36.0 | EARTH_DAMAGE, EARTH_STEAL |
| Debauchery | 1-6 | False | True | 3 | None | 29.0 | EARTH_DAMAGE |
| Hangover | 1-2 | False | True | 3 | None | 25.5 | EARTH_DAMAGE |
| Stretcher | 1-5 | False | False | 2 | None | 16.5 | EARTH_DAMAGE |
| Eviction | 1-1 | False | False | 2 | None | 16.0 | EARTH_DAMAGE |

### Pandawa intelligence - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Pandilongation | 1-5 | False | True | 2 | None | 29.5 | FIRE_DAMAGE |
| Absinthe | 1-5 | False | False | 2 | None | 27.0 | FIRE_DAMAGE, FIRE_STEAL |
| Explosive Flask | 1-8 | False | True | 2 | None | 21.25 | FIRE_DAMAGE |
| Explosive Palm | 1-5 | False | True | 3 | None | 21.0 | FIRE_DAMAGE |
| Pandjiu | 1-5 | False | True | 3 | None | 20.0 | FIRE_DAMAGE |
| Pandawa's Hand | 1-5 | False | True | 5 | 5 | 13.5 | AIR_DAMAGE, BEST_ELEMENT_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, NEUTRAL_DAMAGE, WATER_DAMAGE |

### Pandawa chance - marginal

31% weighted damaging spell value has modifiable range; 31% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Melancholy | 1-10 | False | True | 4 | None | 42.0 | WATER_DAMAGE |
| Brandy | 1-4 | False | False | 2 | None | 27.5 | WATER_DAMAGE |
| Tipple | 1-6 | True | True | 3 | None | 26.5 | WATER_DAMAGE |
| Alcoshu | 1-6 | True | True | 2 | None | 24.0 | WATER_DAMAGE, WATER_STEAL |
| Distillation | 1-8 | False | True | 4 | None | 19.62 | WATER_DAMAGE |
| Pandawa's Hand | 1-5 | False | True | 5 | 5 | 13.5 | AIR_DAMAGE, BEST_ELEMENT_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, NEUTRAL_DAMAGE, WATER_DAMAGE |

### Pandawa agility - useful

41% weighted damaging spell value has modifiable range; 41% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Liqueur | 1-7 | True | True | 3 | None | 47.0 | AIR_DAMAGE, AIR_STEAL |
| Nausea | 1-8 | False | True | 2 | None | 36.0 | AIR_DAMAGE |
| Propulsion | 1-4 | False | True | 2 | None | 35.0 | AIR_DAMAGE |
| Alcoholic Breath | 1-6 | False | True | 3 | None | 20.0 | AIR_DAMAGE |
| Schnaps | 1-8 | True | True | 3 | None | 15.0 | AIR_DAMAGE |
| Pandawa's Hand | 1-5 | False | True | 5 | 5 | 13.5 | AIR_DAMAGE, BEST_ELEMENT_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, NEUTRAL_DAMAGE, WATER_DAMAGE |

### Rogue strength - nearly useless

5% weighted damaging spell value has modifiable range; 5% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Obliteration | 1-5 | False | True | 4 | None | 195.0 | EARTH_DAMAGE |
| Musket | 1-5 | False | True | 2 | None | 30.0 | EARTH_DAMAGE |
| Arquebus | 1-6 | False | True | 4 | None | 18.5 | EARTH_DAMAGE |
| Bombard | 1-6 | False | True | 3 | None | 16.0 | EARTH_DAMAGE |
| Sticky Bomb | 1-6 | True | True | 2 | None | 12.35 | BEST_ELEMENT_DAMAGE |

### Rogue intelligence - vital

61% weighted damaging spell value has modifiable range; 61% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Extraction | 1-8 | True | True | 3 | None | 27.0 | FIRE_STEAL |
| Shot Pellets | 0-5 | False | False | 4 | None | 23.0 | FIRE_STEAL |
| Weigh Down | 1-5 | True | True | 3 | None | 21.33 | FIRE_DAMAGE |
| Pulsar | 1-6 | False | True | 3 | None | 16.0 | FIRE_DAMAGE |
| Sticky Bomb | 1-6 | True | True | 2 | None | 12.35 | BEST_ELEMENT_DAMAGE |

### Rogue chance - nearly useless

12% weighted damaging spell value has modifiable range; 12% has modifiable max range >=4; 17% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Stolen Goods | 1-5 | False | True | 3 | None | 29.0 | WATER_DAMAGE |
| Shrapnel | 1-5 | False | True | 2 | None | 27.0 | WATER_DAMAGE |
| Blunderbuss | 1-4 | False | True | 4 | None | 18.5 | WATER_DAMAGE |
| Deception | 0-1 | False | False | 4 | None | 17.5 | WATER_DAMAGE |
| Sticky Bomb | 1-6 | True | True | 2 | None | 12.35 | BEST_ELEMENT_DAMAGE |

### Rogue agility - vital

67% weighted damaging spell value has modifiable range; 67% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Cadence | 1-7 | True | True | 3 | None | 27.0 | AIR_DAMAGE |
| Machine Gun | 1-6 | True | True | 4 | None | 27.0 | AIR_DAMAGE |
| Boomerang Daggers | 1-7 | False | True | 4 | None | 17.0 | AIR_DAMAGE |
| Carbine | 1-8 | False | True | 3 | None | 16.0 | AIR_DAMAGE |
| Sticky Bomb | 1-6 | True | True | 2 | None | 12.35 | BEST_ELEMENT_DAMAGE |

### Sacrier strength - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 94% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Decimation | 1-1 | False | False | 3 | None | 334.0 | EARTH_DAMAGE |
| Gash | 1-1 | False | True | 4 | None | 24.5 | EARTH_DAMAGE |
| Torture | 1-1 | False | True | 3 | None | 24.0 | EARTH_STEAL |
| Ravages | 1-6 | False | True | 3 | None | 20.0 | EARTH_DAMAGE |
| Blood Bath | 0-0 | False | False | 4 | None | 14.5 | EARTH_STEAL |
| Influx | 0-0 | False | False | 2 | None | 13.5 | EARTH_DAMAGE |

### Sacrier intelligence - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Excruciating Pain | 0-5 | False | True | 3 | None | 210.33 | FIRE_DAMAGE |
| Hostility | 1-4 | False | True | 2 | None | 24.75 | FIRE_DAMAGE |
| Absorption | 1-6 | False | True | 3 | None | 22.0 | FIRE_STEAL |
| Immolation | 0-4 | False | True | 4 | None | 21.0 | FIRE_DAMAGE |
| Slaughter | 0-4 | False | True | 4 | None | 14.0 | FIRE_STEAL |
| Bloodthirsty Madness | 1-3 | False | True | 3 | 2 | 7.32 | BEST_ELEMENT_STEAL |

### Sacrier chance - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 5% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Nervousness | 0-4 | False | True | 3 | None | 216.67 | WATER_DAMAGE |
| Stase | 1-5 | False | False | 3 | None | 22.0 | WATER_STEAL |
| Clobbering | 0-5 | False | True | 4 | None | 20.5 | WATER_DAMAGE |
| Projection | 1-2 | False | True | 2 | None | 15.5 | WATER_DAMAGE |
| Condensation | 0-5 | False | True | 3 | None | 15.33 | WATER_DAMAGE |
| Dissolution | 0-5 | False | True | 4 | None | 13.5 | WATER_STEAL |

### Sacrier agility - nearly useless

0% weighted damaging spell value has modifiable range; 0% has modifiable max range >=4; 94% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Fury | 1-1 | False | False | 3 | None | 360.5 | AIR_DAMAGE |
| Hemorrhage | 1-1 | False | True | 3 | None | 24.0 | AIR_STEAL |
| Assault | 1-2 | False | True | 2 | None | 23.25 | AIR_DAMAGE |
| Carnage | 1-1 | False | True | 4 | None | 23.0 | AIR_DAMAGE |
| Desolation | 1-3 | False | True | 4 | None | 14.0 | AIR_STEAL |
| Light Speed | 1-5 | False | False | 3 | None | 8.0 | AIR_DAMAGE |

### Sadida strength - marginal

27% weighted damaging spell value has modifiable range; 27% has modifiable max range >=4; 5% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Force of Nature | 1-5 | False | True | 5 | None | 156.0 | EARTH_DAMAGE |
| Bramble | 1-8 | True | True | 3 | None | 25.5 | EARTH_DAMAGE |
| Aggressive Bramble | 1-6 | True | True | 4 | None | 23.75 | EARTH_DAMAGE |
| Poisoned Undergrowth | 1-8 | True | True | 3 | None | 17.33 | EARTH_DAMAGE |
| Earthquake | 0-0 | False | False | 3 | None | 12.0 | EARTH_DAMAGE |
| Manifold Bramble | 0-7 | False | True | 3 | None | 9.5 | EARTH_DAMAGE |

### Sadida intelligence - vital

57% weighted damaging spell value has modifiable range; 57% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Plaguing Bramble | 1-63 | False | False | 2 | None | 36.75 | FIRE_DAMAGE |
| Bush Fire | 1-7 | True | True | 3 | None | 28.0 | FIRE_DAMAGE, WATER_DAMAGE |
| Prickly Embers | 1-7 | True | True | 3 | None | 25.5 | FIRE_DAMAGE |
| Voodoo Curse | 1-5 | False | True | 3 | 3 | 20.8 | FIRE_DAMAGE, WATER_DAMAGE |
| Wild Grass | 0-8 | True | True | 3 | None | 9.17 | FIRE_DAMAGE |
| Paralysing Poison | 1-8 | True | True | 3 | None | 7.33 | FIRE_DAMAGE |

### Sadida chance - useful

45% weighted damaging spell value has modifiable range; 45% has modifiable max range >=4; 24% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Bane | 1-2 | False | True | 3 | None | 57.0 | WATER_DAMAGE, WATER_STEAL |
| Mangrove | 1-8 | True | True | 3 | None | 54.0 | WATER_DAMAGE |
| Dolly Sacrifice | 1-8 | False | True | 4 | None | 42.25 | WATER_DAMAGE, WATER_STEAL |
| Bush Fire | 1-7 | True | True | 3 | None | 28.0 | FIRE_DAMAGE, WATER_DAMAGE |
| Tear | 1-8 | True | False | 3 | None | 23.5 | WATER_DAMAGE |
| Voodoo Curse | 1-5 | False | True | 3 | 3 | 20.8 | FIRE_DAMAGE, WATER_DAMAGE |

### Sadida agility - useful

51% weighted damaging spell value has modifiable range; 51% has modifiable max range >=4; 21% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Inoculation | 1-8 | False | True | 3 | None | 23.67 | AIR_DAMAGE |
| Paralysing Bramble | 1-7 | True | True | 3 | None | 21.5 | AIR_DAMAGE |
| Contagion | 1-7 | True | True | 4 | None | 20.5 | AIR_DAMAGE |
| Shake | 0-0 | False | False | 3 | None | 11.17 | AIR_DAMAGE |
| Contamination | 0-0 | False | False | 2 | None | 6.0 | AIR_DAMAGE |

### Sram strength - vital

76% weighted damaging spell value has modifiable range; 76% has modifiable max range >=4; 6% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Malevolent Trap | 1-6 | True | False | 3 | None | 1300.0 | EARTH_DAMAGE |
| Pitfall | 1-4 | False | True | 4 | None | 234.0 | EARTH_DAMAGE |
| Lethal Attack | 1-2 | False | True | 4 | None | 76.88 | EARTH_DAMAGE |
| Lethal Trap | 1-4 | True | False | 3 | None | 61.67 | EARTH_DAMAGE |
| Plotter | 1-3 | False | True | 3 | 5 | 58.5 | BEST_ELEMENT_DAMAGE |
| Shakedown | 1-3 | False | True | 3 | None | 32.5 | EARTH_DAMAGE |

### Sram intelligence - marginal

21% weighted damaging spell value has modifiable range; 21% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Plotter | 1-3 | False | True | 3 | 5 | 58.5 | BEST_ELEMENT_DAMAGE |
| Fragmentation Trap | 1-6 | True | False | 4 | None | 33.0 | FIRE_DAMAGE |
| Deviousness | 1-6 | False | True | 3 | None | 27.5 | FIRE_DAMAGE |
| Cut-Throat | 1-7 | False | True | 4 | None | 27.0 | FIRE_DAMAGE |
| Perquisition | 1-6 | False | True | 3 | None | 25.5 | FIRE_DAMAGE |
| Break-In | 1-6 | False | True | 2 | None | 24.0 | FIRE_DAMAGE |

### Sram chance - useful

42% weighted damaging spell value has modifiable range; 42% has modifiable max range >=4; 11% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Plotter | 1-3 | False | True | 3 | 5 | 58.5 | BEST_ELEMENT_DAMAGE |
| Waylaying | 0-6 | True | True | 3 | None | 23.5 | WATER_STEAL |
| Miry Trap | 1-6 | True | False | 3 | None | 23.33 | WATER_DAMAGE |
| Raiding | 1-2 | False | True | 3 | None | 21.0 | WATER_STEAL |
| Larceny | 0-4 | False | True | 4 | None | 20.0 | WATER_DAMAGE |
| Cruelty | 1-6 | True | True | 3 | None | 15.67 | WATER_DAMAGE |

### Sram agility - useful

41% weighted damaging spell value has modifiable range; 41% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Toxines | 1-7 | True | True | 3 | 2 | 65.0 | AIR_DAMAGE |
| Plotter | 1-3 | False | True | 3 | 5 | 58.5 | BEST_ELEMENT_DAMAGE |
| Con | 1-6 | False | True | 3 | None | 30.5 | AIR_DAMAGE |
| Epidemic | 1-5 | False | True | 4 | None | 19.0 | AIR_DAMAGE |
| Arsenic | 1-6 | True | False | 3 | None | 17.0 | AIR_DAMAGE |
| Mistake | 0-5 | False | True | 4 | None | 17.0 | AIR_DAMAGE |

### Xelor strength - marginal

19% weighted damaging spell value has modifiable range; 19% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Knell | 0-3 | False | True | 3 | 2 | 138.67 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Dark Ray | 1-6 | False | True | 5 | None | 63.0 | EARTH_DAMAGE |
| Shadowy Beam | 1-5 | True | True | 2 | None | 31.5 | EARTH_DAMAGE |
| Souvenir | 1-6 | True | True | 3 | None | 30.0 | EARTH_DAMAGE |
| Xelor's Punch | 1-3 | False | True | 3 | None | 25.0 | EARTH_DAMAGE |
| Loss of Motivation | 1-5 | False | True | 3 | None | 24.5 | EARTH_DAMAGE |

### Xelor intelligence - useful

41% weighted damaging spell value has modifiable range; 41% has modifiable max range >=4; 6% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Knell | 0-3 | False | True | 3 | 2 | 138.67 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Temporal Dust | 0-6 | True | True | 4 | None | 33.5 | FIRE_DAMAGE |
| Temporal Suspension | 1-6 | True | True | 3 | None | 27.0 | FIRE_DAMAGE |
| Xelor's Sandglass | 1-8 | True | False | 3 | None | 24.5 | FIRE_DAMAGE |
| Hand | 1-7 | True | True | 3 | None | 21.0 | FIRE_DAMAGE |
| Disruption | 1-2 | False | True | 2 | None | 15.0 | FIRE_DAMAGE |

### Xelor chance - marginal

22% weighted damaging spell value has modifiable range; 22% has modifiable max range >=4; 0% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Knell | 0-3 | False | True | 3 | 2 | 138.67 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Time Theft | 1-5 | False | True | 4 | None | 24.0 | WATER_DAMAGE |
| Clock | 1-6 | False | True | 5 | None | 22.5 | WATER_STEAL |
| Petrification | 1-7 | True | True | 5 | None | 21.6 | WATER_DAMAGE |
| Cog | 1-7 | True | True | 3 | None | 18.5 | WATER_DAMAGE |
| Slow Down | 1-6 | True | True | 2 | None | 18.0 | WATER_DAMAGE |

### Xelor agility - marginal

25% weighted damaging spell value has modifiable range; 25% has modifiable max range >=4; 6% is max range <=2.

| Spell | Range | Modifiable | LoS | AP | Cooldown | Weight | Effects |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| Knell | 0-3 | False | True | 3 | 2 | 138.67 | AIR_DAMAGE, EARTH_DAMAGE, FIRE_DAMAGE, WATER_DAMAGE |
| Drying Up | 1-6 | False | True | 4 | None | 60.0 | AIR_DAMAGE |
| Shrivelling | 1-6 | True | True | 3 | None | 60.0 | AIR_DAMAGE |
| Pendulum | 1-4 | False | False | 4 | None | 20.0 | AIR_DAMAGE |
| Frostbite | 1-5 | True | True | 2 | None | 18.0 | AIR_DAMAGE |
| Temporal Distortion | 0-0 | False | False | 4 | None | 18.0 | AIR_DAMAGE |
