# Spell Damage Profiles v0 - 2026-07-11

Derived from local spell tables. This is a rotation-lite scoring prior, not a full class rotation.

## Summary

```json
{
  "reportVersion": "build-discovery-spell-damage-profiles-v0",
  "generatedAt": "2026-07-11",
  "source": "local_spell_tables_highest_spell_stats_level_per_spell",
  "profileCount": 76,
  "confidenceCounts": {
    "medium": 75,
    "high": 1
  },
  "rotationModel": "spell_profile_v0_weighted_candidates",
  "caveats": [
    "This is not a full rotation for every class.",
    "Use as a scoring prior and review artifact before all-class generation.",
    "Local spell data may be outdated.",
    "Class mechanics such as summons, bombs, portals, states, buffs, AoE, positioning, and utility are not modeled."
  ]
}
```

## Profiles

- **Cra strength** (`medium`): +100 Strength = 6.283%, +10 flat = 1.832%, high-base share 0.47, mod-range share 1.0. Top: Arrow of Judgement 47.5/3AP, Lashing Arrow 27.0/3AP, Covering Fire 40.0/4AP, Barricade Shot 28.0/3AP
- **Cra intelligence** (`medium`): +100 Intelligence = 7.321%, +10 flat = 0.482%, high-base share 0.748, mod-range share 1.0. Top: Fulminating Arrow 366.0/4AP, Exploding Arrow 36.5/2AP, Explosive Arrow 64.0/4AP, Tyrannical Arrow 45.0/4AP
- **Cra chance** (`medium`): +100 Chance = 6.277%, +10 flat = 1.84%, high-base share 0.56, mod-range share 1.0. Top: Redemption Arrow 49.0/3AP, Frozen Arrow 26.0/3AP, Persecuting Arrow 28.0/3AP, Atonement Arrow 36.0/4AP
- **Cra agility** (`medium`): +100 Agility = 7.367%, +10 flat = 0.423%, high-base share 0.825, mod-range share 1.0. Top: Devouring Arrow 271.0/3AP, Piercing Shot 168.0/4AP, Tormenting Arrow 41.0/4AP, Optical Arrow 25.0/3AP
- **Ecaflip strength** (`medium`): +100 Strength = 7.199%, +10 flat = 0.641%, high-base share 0.798, mod-range share 0.604. Top: Trickery 168.0/5AP, Rekop 216.0/5AP, Misadventure 105.5/4AP, Heads or Tails 46.5/3AP
- **Ecaflip intelligence** (`medium`): +100 Intelligence = 7.262%, +10 flat = 0.559%, high-base share 0.712, mod-range share 0.857. Top: Trickery 168.0/5AP, Rekop 216.0/5AP, Topkaj 28.5/3AP, Meowch 36.0/4AP
- **Ecaflip chance** (`medium`): +100 Chance = 7.235%, +10 flat = 0.594%, high-base share 0.782, mod-range share 0.694. Top: Trickery 168.0/5AP, Rekop 216.0/5AP, All or Nothing 44.0/2AP, Misfortune 28.5/3AP
- **Ecaflip agility** (`medium`): +100 Agility = 7.264%, +10 flat = 0.557%, high-base share 0.752, mod-range share 0.72. Top: Trickery 168.0/5AP, Rekop 216.0/5AP, Balling Up 30.5/3AP, Nerve 37.0/4AP
- **Eliotrope strength** (`medium`): +100 Strength = 5.918%, +10 flat = 2.307%, high-base share 0.0, mod-range share 0.582. Top: Persiflage 27.0/3AP, Sarcasm 34.0/4AP, Snub 24.5/3AP, Therapy 22.0/3AP
- **Eliotrope intelligence** (`medium`): +100 Intelligence = 6.628%, +10 flat = 1.384%, high-base share 0.582, mod-range share 0.183. Top: Parasite 70.0/5AP, Lazybeam 58.0/4AP, Offence 33.5/4AP, Wakfu Ray 27.0/3AP
- **Eliotrope chance** (`medium`): +100 Chance = 6.35%, +10 flat = 1.745%, high-base share 0.332, mod-range share 0.364. Top: Audacious 55.0/3AP, Insolence 26.5/3AP, Composure 34.0/4AP, Lightning Fist 24.0/3AP
- **Eliotrope agility** (`medium`): +100 Agility = 6.018%, +10 flat = 2.176%, high-base share 0.23, mod-range share 0.0. Top: Sermon 35.0/4AP, Ridicule 32.0/4AP, Insult 27.0/3AP, Contempt 25.5/3AP
- **Eniripsa strength** (`medium`): +100 Strength = 6.422%, +10 flat = 1.652%, high-base share 0.45, mod-range share 0.0. Top: War Cry 78.0/4AP, Ancestral Ointment 36.5/4AP, Profanity 23.5/3AP, Tribal Paintbrush 20.5/3AP
- **Eniripsa intelligence** (`medium`): +100 Intelligence = 6.242%, +10 flat = 1.885%, high-base share 0.408, mod-range share 0.781. Top: Deafening Cry 26.0/3AP, Raucous Word 25.5/3AP, Pilfering 21.0/3AP, Scalpel 57.0/4AP
- **Eniripsa chance** (`medium`): +100 Chance = 6.253%, +10 flat = 1.871%, high-base share 0.369, mod-range share 0.0. Top: Vampiric Word 28.5/3AP, Bloodless Word 38.5/4AP, Sobs 24.5/3AP, Scalpel 57.0/4AP
- **Eniripsa agility** (`medium`): +100 Agility = 7.142%, +10 flat = 0.715%, high-base share 0.557, mod-range share 0.932. Top: Secret Word 238.0/4AP, Malicious Word 32.0/4AP, Mischievous Word 22.5/3AP, Flowery Word 35.0/4AP
- **Enutrof strength** (`medium`): +100 Strength = 6.27%, +10 flat = 1.848%, high-base share 0.29, mod-range share 0.426. Top: Collapse 46.0/3AP, Prime of Life 30.0/3AP, Shovel Throwing 33.5/4AP, Mound 21.0/3AP
- **Enutrof intelligence** (`medium`): +100 Intelligence = 6.908%, +10 flat = 1.019%, high-base share 0.513, mod-range share 0.824. Top: Unsummoning 121.5/4AP, Mine Fire 32.0/4AP, Shovel Kiss 21.0/3AP, Ghostly Shovel 27.0/3AP
- **Enutrof chance** (`medium`): +100 Chance = 6.206%, +10 flat = 1.932%, high-base share 0.379, mod-range share 0.783. Top: Obsolescence 28.0/3AP, Placer Mining 40.0/3AP, Auriferous Shovel 34.0/4AP, Shovel of the Ancients 40.0/4AP
- **Enutrof agility** (`medium`): +100 Agility = 6.168%, +10 flat = 1.982%, high-base share 0.49, mod-range share 0.561. Top: Hard Cash 43.0/3AP, Bankruptcy 38.0/4AP, Opportuneness 15.0/2AP, Loafylactic 20.0/3AP
- **Feca strength** (`medium`): +100 Strength = 6.798%, +10 flat = 1.162%, high-base share 0.636, mod-range share 0.368. Top: Distrust 86.0/2AP, Barrier 86.0/3AP, Backlash 31.0/3AP, Tetany 38.0/4AP
- **Feca intelligence** (`medium`): +100 Intelligence = 6.776%, +10 flat = 1.191%, high-base share 0.571, mod-range share 0.797. Top: Distrust 86.0/2AP, Barrier 86.0/3AP, Lethargy 29.5/3AP, Languor 28.0/3AP
- **Feca chance** (`medium`): +100 Chance = 6.778%, +10 flat = 1.188%, high-base share 0.578, mod-range share 0.849. Top: Distrust 86.0/2AP, Barrier 86.0/3AP, Getaway 28.0/3AP, Bubble 18.0/2AP
- **Feca agility** (`medium`): +100 Agility = 6.813%, +10 flat = 1.143%, high-base share 0.582, mod-range share 0.376. Top: Distrust 86.0/2AP, Barrier 86.0/3AP, Gust 20.0/2AP, Typhoon 26.0/3AP
- **Foggernaut strength** (`medium`): +100 Strength = 7.565%, +10 flat = 0.165%, high-base share 0.868, mod-range share 0.082. Top: Drill 644.0/2AP, Harpooner 340.5/2AP, Mooring 19.5/2AP, Backwash 17.0/2AP
- **Foggernaut intelligence** (`medium`): +100 Intelligence = 7.571%, +10 flat = 0.158%, high-base share 0.898, mod-range share 0.011. Top: Drill 644.0/2AP, Harpooner 340.5/2AP, Valve 14.0/2AP, Hoofbeat 25.5/3AP
- **Foggernaut chance** (`medium`): +100 Chance = 7.559%, +10 flat = 0.173%, high-base share 0.91, mod-range share 0.146. Top: Drill 644.0/2AP, Harpooner 340.5/2AP, Torrent 64.0/3AP, Periscope 30.0/3AP
- **Foggernaut agility** (`medium`): +100 Agility = 7.562%, +10 flat = 0.17%, high-base share 0.864, mod-range share 0.1. Top: Drill 644.0/2AP, Harpooner 340.5/2AP, Pilfer 84.0/4AP, Corrosion 28.0/3AP
- **Forgelance strength** (`medium`): +100 Strength = 6.018%, +10 flat = 2.176%, high-base share 0.084, mod-range share 0.0. Top: Upheaval 31.0/3AP, Slingshot 26.5/3AP, Earthen Weakness 15.0/2AP, Middle Earth 32.0/3AP
- **Forgelance intelligence** (`medium`): +100 Intelligence = 5.923%, +10 flat = 2.3%, high-base share 0.087, mod-range share 0.0. Top: Burning Estoc 24.5/3AP, Fire Lance 22.5/3AP, Hot Iron 21.5/3AP, Maelstrom 19.0/2AP
- **Forgelance chance** (`medium`): +100 Chance = 6.012%, +10 flat = 2.185%, high-base share 0.082, mod-range share 0.585. Top: Octave 17.0/2AP, Lance of the Lake 23.5/3AP, Biting Trident 22.5/3AP, Elding 34.0/4AP
- **Forgelance agility** (`medium`): +100 Agility = 6.059%, +10 flat = 2.123%, high-base share 0.091, mod-range share 0.0. Top: No Myr Javelin 28.0/3AP, Brass Volley 23.5/3AP, Cyclone Lancer 32.0/3AP, Windmill 31.0/3AP
- **Huppermage strength** (`medium`): +100 Strength = 7.36%, +10 flat = 0.433%, high-base share 0.909, mod-range share 0.235. Top: Morph 280.0/3AP, Arcane Torrent 276.0/3AP, Elemental Drain 100.0/2AP, Manifestation 60.0/2AP
- **Huppermage intelligence** (`medium`): +100 Intelligence = 7.357%, +10 flat = 0.435%, high-base share 0.932, mod-range share 0.121. Top: Morph 280.0/3AP, Arcane Torrent 276.0/3AP, Elemental Drain 100.0/2AP, Manifestation 60.0/2AP
- **Huppermage chance** (`medium`): +100 Chance = 7.354%, +10 flat = 0.439%, high-base share 0.887, mod-range share 0.091. Top: Morph 280.0/3AP, Arcane Torrent 276.0/3AP, Elemental Drain 100.0/2AP, Manifestation 60.0/2AP
- **Huppermage agility** (`medium`): +100 Agility = 7.361%, +10 flat = 0.43%, high-base share 0.893, mod-range share 0.146. Top: Morph 280.0/3AP, Arcane Torrent 276.0/3AP, Elemental Drain 100.0/2AP, Manifestation 60.0/2AP
- **Iop strength** (`high`): +100 Strength = 6.519%, +10 flat = 1.525%, high-base share 0.605, mod-range share 0.0. Top: Concentration 54.0/2AP, Accumulation 24.0/3AP, Sword of Iop 39.0/4AP, Pressure 28.0/3AP
- **Iop intelligence** (`medium`): +100 Intelligence = 7.438%, +10 flat = 0.331%, high-base share 0.899, mod-range share 0.191. Top: Tumult 400.0/4AP, Strengthstorm 101.0/3AP, Sentence 42.5/2AP, Destructive Sword 34.0/4AP
- **Iop chance** (`medium`): +100 Chance = 6.418%, +10 flat = 1.657%, high-base share 0.488, mod-range share 0.0. Top: Endurance 32.0/3AP, Outpouring 40.0/4AP, Threat 27.0/3AP, Fervour 25.5/3AP
- **Iop agility** (`medium`): +100 Agility = 6.194%, +10 flat = 1.948%, high-base share 0.229, mod-range share 0.159. Top: Celestial Sword 38.0/4AP, Divine Sword 28.0/3AP, Destructive Ring 26.0/3AP, Fracture 34.0/4AP
- **Masqueraider strength** (`medium`): +100 Strength = 6.471%, +10 flat = 1.587%, high-base share 0.515, mod-range share 0.242. Top: Furia 37.0/3AP, Carnavalo 93.0/3AP, Catalepsy 24.0/3AP, Martelo 23.5/3AP
- **Masqueraider intelligence** (`medium`): +100 Intelligence = 6.364%, +10 flat = 1.726%, high-base share 0.326, mod-range share 0.322. Top: Inferno 40.0/4AP, Apostasy 26.5/3AP, Decoy 26.0/3AP, Brincaderia 14.0/2AP
- **Masqueraider chance** (`medium`): +100 Chance = 6.237%, +10 flat = 1.892%, high-base share 0.13, mod-range share 0.0. Top: Boliche 27.0/3AP, Bocciara 17.5/2AP, Ponteira 21.5/3AP, Carnavalo 93.0/3AP
- **Masqueraider agility** (`medium`): +100 Agility = 6.429%, +10 flat = 1.642%, high-base share 0.312, mod-range share 0.172. Top: Cavalcade 40.0/4AP, Retention 29.0/3AP, Picada 26.5/3AP, Capering 30.0/3AP
- **Osamodas strength** (`medium`): +100 Strength = 6.131%, +10 flat = 2.029%, high-base share 0.359, mod-range share 0.0. Top: Sedimentation 40.0/4AP, Woolly Sledgehammer 19.0/2AP, Constriction 26.5/3AP, Crackler Punch 38.5/4AP
- **Osamodas intelligence** (`medium`): +100 Intelligence = 5.966%, +10 flat = 2.245%, high-base share 0.166, mod-range share 0.495. Top: Sparkmeleon 27.5/3AP, Dragon's Breath 33.0/4AP, Cross Scale 35.0/4AP, Dragonic 22.0/3AP
- **Osamodas chance** (`medium`): +100 Chance = 6.045%, +10 flat = 2.142%, high-base share 0.159, mod-range share 0.0. Top: Aquatic Wave 27.0/3AP, Geyser 26.5/3AP, Batra 38.0/4AP, Whirlwind 32.5/4AP
- **Osamodas agility** (`medium`): +100 Agility = 5.808%, +10 flat = 2.45%, high-base share 0.088, mod-range share 0.548. Top: Canine 22.5/3AP, Gambol 20.0/2AP, Plucking 24.5/3AP, Repulsive Fang 16.0/2AP
- **Ouginak strength** (`medium`): +100 Strength = 6.306%, +10 flat = 1.802%, high-base share 0.625, mod-range share 0.0. Top: Mastiff 36.0/2AP, Humerus 43.5/4AP, Watchdog 32.5/3AP, Amarok 29.5/3AP
- **Ouginak intelligence** (`medium`): +100 Intelligence = 6.629%, +10 flat = 1.382%, high-base share 0.449, mod-range share 0.0. Top: Hunt 83.0/4AP, Woof 21.0/2AP, Tally Ho 30.0/3AP, Tracking 33.0/3AP
- **Ouginak chance** (`medium`): +100 Chance = 5.979%, +10 flat = 2.227%, high-base share 0.162, mod-range share 0.0. Top: Ulna 17.0/2AP, Radius 34.0/3AP, Calcaneus 15.0/2AP, Marrow Bone 22.5/3AP
- **Ouginak agility** (`medium`): +100 Agility = 7.479%, +10 flat = 0.278%, high-base share 0.714, mod-range share 0.0. Top: Stripping 385.0/5AP, Muzzle 415.0/5AP, Carrion 30.5/3AP, Bloodhound 29.5/3AP
- **Pandawa strength** (`medium`): +100 Strength = 6.735%, +10 flat = 1.245%, high-base share 0.518, mod-range share 0.0. Top: Pandatak 88.0/4AP, Filthipint 72.0/4AP, Debauchery 29.0/3AP, Hangover 25.5/3AP
- **Pandawa intelligence** (`medium`): +100 Intelligence = 6.301%, +10 flat = 1.809%, high-base share 0.315, mod-range share 0.0. Top: Pandilongation 29.5/2AP, Absinthe 27.0/2AP, Explosive Flask 42.5/2AP, Explosive Palm 21.0/3AP
- **Pandawa chance** (`medium`): +100 Chance = 6.694%, +10 flat = 1.298%, high-base share 0.464, mod-range share 0.312. Top: Melancholy 84.0/4AP, Brandy 27.5/2AP, Tipple 26.5/3AP, Alcoshu 24.0/2AP
- **Pandawa agility** (`medium`): +100 Agility = 6.452%, +10 flat = 1.613%, high-base share 0.801, mod-range share 0.406. Top: Liqueur 47.0/3AP, Nausea 36.0/2AP, Propulsion 35.0/2AP, Alcoholic Breath 30.0/3AP
- **Rogue strength** (`medium`): +100 Strength = 7.491%, +10 flat = 0.261%, high-base share 0.785, mod-range share 0.045. Top: Obliteration 390.0/4AP, Musket 20.0/2AP, Arquebus 37.0/4AP, Bombard 24.0/3AP
- **Rogue intelligence** (`medium`): +100 Intelligence = 6.294%, +10 flat = 1.817%, high-base share 0.502, mod-range share 0.609. Top: Extraction 40.5/3AP, Shot Pellets 46.0/4AP, Weigh Down 32.0/3AP, Pulsar 24.0/3AP
- **Rogue chance** (`medium`): +100 Chance = 6.006%, +10 flat = 2.192%, high-base share 0.345, mod-range share 0.118. Top: Stolen Goods 29.0/3AP, Shrapnel 18.0/2AP, Blunderbuss 37.0/4AP, Deception 35.0/4AP
- **Rogue agility** (`medium`): +100 Agility = 6.087%, +10 flat = 2.087%, high-base share 0.272, mod-range share 0.668. Top: Cadence 27.0/3AP, Machine Gun 36.0/4AP, Boomerang Daggers 34.0/4AP, Carbine 24.0/3AP
- **Sacrier strength** (`medium`): +100 Strength = 7.473%, +10 flat = 0.285%, high-base share 0.819, mod-range share 0.0. Top: Decimation 334.0/3AP, Gash 49.0/4AP, Torture 24.0/3AP, Ravages 30.0/3AP
- **Sacrier intelligence** (`medium`): +100 Intelligence = 7.438%, +10 flat = 0.331%, high-base share 0.756, mod-range share 0.0. Top: Excruciating Pain 315.5/3AP, Hostility 16.5/2AP, Absorption 22.0/3AP, Immolation 42.0/4AP
- **Sacrier chance** (`medium`): +100 Chance = 7.448%, +10 flat = 0.318%, high-base share 0.763, mod-range share 0.0. Top: Nervousness 325.0/3AP, Stase 22.0/3AP, Clobbering 41.0/4AP, Projection 15.5/2AP
- **Sacrier agility** (`medium`): +100 Agility = 7.493%, +10 flat = 0.26%, high-base share 0.834, mod-range share 0.0. Top: Fury 360.5/3AP, Hemorrhage 24.0/3AP, Assault 15.5/2AP, Carnage 46.0/4AP
- **Sadida strength** (`medium`): +100 Strength = 7.472%, +10 flat = 0.286%, high-base share 0.786, mod-range share 0.273. Top: Force of Nature 390.0/5AP, Bramble 25.5/3AP, Aggressive Bramble 47.5/4AP, Poisoned Undergrowth 26.0/3AP
- **Sadida intelligence** (`medium`): +100 Intelligence = 6.077%, +10 flat = 2.1%, high-base share 0.155, mod-range share 0.572. Top: Plaguing Bramble 24.5/2AP, Bush Fire 28.0/3AP, Prickly Embers 25.5/3AP, Voodoo Curse 48.0/3AP
- **Sadida chance** (`medium`): +100 Chance = 6.713%, +10 flat = 1.273%, high-base share 0.747, mod-range share 0.453. Top: Bane 57.0/3AP, Mangrove 54.0/3AP, Dolly Sacrifice 84.5/4AP, Bush Fire 28.0/3AP
- **Sadida agility** (`medium`): +100 Agility = 6.487%, +10 flat = 1.567%, high-base share 0.533, mod-range share 0.507. Top: Inoculation 71.0/3AP, Paralysing Bramble 21.5/3AP, Contagion 41.0/4AP, Shake 33.5/3AP
- **Sram strength** (`medium`): +100 Strength = 7.651%, +10 flat = 0.053%, high-base share 0.959, mod-range share 0.762. Top: Malevolent Trap 1950.0/3AP, Pitfall 312.0/4AP, Lethal Attack 102.5/4AP, Lethal Trap 92.5/3AP
- **Sram intelligence** (`medium`): +100 Intelligence = 7.185%, +10 flat = 0.66%, high-base share 0.579, mod-range share 0.215. Top: Plotter 300.0/3AP, Fragmentation Trap 132.0/4AP, Deviousness 27.5/3AP, Cut-Throat 36.0/4AP
- **Sram chance** (`medium`): +100 Chance = 7.194%, +10 flat = 0.647%, high-base share 0.62, mod-range share 0.419. Top: Plotter 300.0/3AP, Waylaying 23.5/3AP, Miry Trap 35.0/3AP, Raiding 31.5/3AP
- **Sram agility** (`medium`): +100 Agility = 7.27%, +10 flat = 0.55%, high-base share 0.624, mod-range share 0.407. Top: Toxines 150.0/3AP, Plotter 300.0/3AP, Con 30.5/3AP, Epidemic 38.0/4AP
- **Xelor strength** (`medium`): +100 Strength = 7.351%, +10 flat = 0.444%, high-base share 0.616, mod-range share 0.188. Top: Knell 320.0/3AP, Dark Ray 105.0/5AP, Shadowy Beam 21.0/2AP, Souvenir 30.0/3AP
- **Xelor intelligence** (`medium`): +100 Intelligence = 7.388%, +10 flat = 0.395%, high-base share 0.663, mod-range share 0.408. Top: Knell 320.0/3AP, Temporal Dust 67.0/4AP, Temporal Suspension 27.0/3AP, Xelor's Sandglass 24.5/3AP
- **Xelor chance** (`medium`): +100 Chance = 7.384%, +10 flat = 0.4%, high-base share 0.705, mod-range share 0.224. Top: Knell 320.0/3AP, Time Theft 32.0/4AP, Clock 37.5/5AP, Petrification 36.0/5AP
- **Xelor agility** (`medium`): +100 Agility = 7.365%, +10 flat = 0.426%, high-base share 0.943, mod-range share 0.248. Top: Knell 320.0/3AP, Drying Up 80.0/4AP, Shrivelling 60.0/3AP, Pendulum 40.0/4AP

## Details

### Cra strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `6.283%`, +100 power `6.283%`, +10 flat damage `1.832%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Arrow of Judgement | 47.5 | 3 | 15.83 | 3 | None | 1-9 | True | 47.5 | EARTH_STEAL, EARTH_DAMAGE |
| Lashing Arrow | 27.0 | 3 | 9.0 | 3 | None | 1-6 | True | 27.0 | EARTH_DAMAGE |
| Covering Fire | 40.0 | 4 | 10.0 | 2 | None | 3-10 | True | 20.0 | EARTH_DAMAGE |
| Barricade Shot | 28.0 | 3 | 9.33 | 2 | None | 1-8 | True | 18.667 | EARTH_DAMAGE |
| Persecuting Arrow | 28.0 | 3 | 9.33 | 2 | None | 3-10 | True | 18.667 | WATER_DAMAGE, EARTH_DAMAGE |
| Destructive Bolts | 37.0 | 4 | 9.25 | 2 | None | 1-8 | True | 18.5 | EARTH_DAMAGE |
| Poisoned Arrow | 17.5 | 3 | 5.83 | 3 | None | 1-10 | True | 17.5 | NEUTRAL_DAMAGE |
| Punitive Arrow | 30.0 | 4 | 7.5 | None | 1 | 4-8 | True | 15.0 | EARTH_DAMAGE |

### Cra intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `7.321%`, +100 power `7.321%`, +10 flat damage `0.482%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Fulminating Arrow | 366.0 | 4 | 91.5 | 1 | None | 1-8 | True | 91.5 | FIRE_DAMAGE |
| Exploding Arrow | 36.5 | 2 | 18.25 | 3 | None | 1-7 | True | 54.75 | FIRE_DAMAGE, FIRE_STEAL |
| Explosive Arrow | 64.0 | 4 | 16.0 | 2 | None | 1-8 | True | 32.0 | FIRE_DAMAGE |
| Tyrannical Arrow | 45.0 | 4 | 11.25 | None | 1 | 2-7 | True | 22.5 | AIR_DAMAGE, FIRE_DAMAGE |
| Repulsive Shot | 30.0 | 3 | 10.0 | 2 | None | 1-5 | True | 20.0 | FIRE_DAMAGE |
| Burning Arrows | 34.5 | 4 | 8.62 | 2 | None | 1-5 | True | 17.25 | FIRE_DAMAGE |
| Assailing Arrow | 33.0 | 4 | 8.25 | 2 | None | 2-6 | True | 16.5 | FIRE_DAMAGE |
| Crushing Arrow | 32.0 | 3 | 10.67 | None | 2 | 3-7 | True | 13.867 | FIRE_DAMAGE |

### Cra chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `6.277%`, +100 power `6.277%`, +10 flat damage `1.84%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Redemption Arrow | 49.0 | 3 | 16.33 | 3 | None | 4-8 | True | 49.0 | WATER_DAMAGE |
| Frozen Arrow | 26.0 | 3 | 8.67 | 3 | None | 1-10 | True | 26.0 | WATER_DAMAGE |
| Persecuting Arrow | 28.0 | 3 | 9.33 | 2 | None | 3-10 | True | 18.667 | WATER_DAMAGE, EARTH_DAMAGE |
| Atonement Arrow | 36.0 | 4 | 9.0 | None | 1 | 6-10 | True | 18.0 | WATER_DAMAGE |
| Immobilising Arrow | 12.0 | 2 | 6.0 | 4 | None | 1-10 | True | 18.0 | WATER_STEAL |
| Slow Down Arrow | 35.0 | 4 | 8.75 | 2 | None | 1-8 | True | 17.5 | WATER_DAMAGE |
| Bat's Eye | 26.0 | 3 | 8.67 | None | 2 | 3-10 | True | 11.267 | WATER_DAMAGE |
| Paralysing Arrow | 38.0 | 4 | 9.5 | 1 | None | 2-6 | True | 9.5 | WATER_DAMAGE |

### Cra agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `7.367%`, +100 power `7.367%`, +10 flat damage `0.423%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Devouring Arrow | 271.0 | 3 | 90.33 | 2 | None | 1-6 | True | 180.667 | AIR_DAMAGE, AIR_STEAL |
| Piercing Shot | 168.0 | 4 | 42.0 | 2 | None | 1-8 | True | 84.0 | AIR_DAMAGE |
| Tormenting Arrow | 41.0 | 4 | 10.25 | 3 | None | 1-10 | True | 30.75 | AIR_DAMAGE |
| Optical Arrow | 25.0 | 3 | 8.33 | 3 | None | 0-12 | True | 25.0 | AIR_DAMAGE |
| Tyrannical Arrow | 45.0 | 4 | 11.25 | None | 1 | 2-7 | True | 22.5 | AIR_DAMAGE, FIRE_DAMAGE |
| Retreating Shot | 26.5 | 3 | 8.83 | 2 | None | 1-8 | True | 17.667 | AIR_DAMAGE |
| Concentration Arrow | 24.5 | 3 | 8.17 | 2 | None | 2-8 | True | 16.333 | AIR_DAMAGE |
| Raining Arrows | 25.0 | 3 | 8.33 | 1 | None | 0-7 | True | 8.333 | AIR_DAMAGE |

### Ecaflip strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `7.199%`, +100 power `7.199%`, +10 flat damage `0.641%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Trickery | 168.0 | 5 | 33.6 | 3 | None | 1-5 | True | 100.8 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Rekop | 216.0 | 5 | 43.2 | 2 | None | 1-5 | True | 86.4 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Misadventure | 105.5 | 4 | 26.38 | 2 | None | 0-2 | False | 52.75 | EARTH_STEAL, EARTH_DAMAGE |
| Heads or Tails | 46.5 | 3 | 15.5 | 3 | None | 1-7 | True | 46.5 | EARTH_DAMAGE |
| Feline Spirit | 32.5 | 3 | 10.83 | 3 | None | 1-1 | False | 32.5 | EARTH_DAMAGE |
| Fate of Ecaflip | 40.0 | 4 | 10.0 | 3 | None | 1-5 | False | 30.0 | EARTH_DAMAGE |
| Ecaflip's Audacity | 28.5 | 3 | 9.5 | 3 | None | 1-4 | False | 28.5 | EARTH_DAMAGE |
| Tails or Heads | 35.0 | 4 | 8.75 | 3 | None | 1-6 | False | 26.25 | EARTH_DAMAGE |

### Ecaflip intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `7.262%`, +100 power `7.262%`, +10 flat damage `0.559%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Trickery | 168.0 | 5 | 33.6 | 3 | None | 1-5 | True | 100.8 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Rekop | 216.0 | 5 | 43.2 | 2 | None | 1-5 | True | 86.4 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Topkaj | 28.5 | 3 | 9.5 | 4 | None | 1-7 | True | 28.5 | FIRE_DAMAGE |
| Meowch | 36.0 | 4 | 9.0 | 3 | None | 1-5 | False | 27.0 | FIRE_DAMAGE |
| Pawpads | 26.5 | 3 | 8.83 | 3 | None | 1-7 | True | 26.5 | FIRE_DAMAGE |
| Yowling | 32.0 | 4 | 8.0 | 2 | None | 1-5 | False | 16.0 | FIRE_DAMAGE |
| Rough Tongue | 31.5 | 4 | 7.88 | 2 | None | 1-5 | True | 15.75 | FIRE_DAMAGE |

### Ecaflip chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `7.235%`, +100 power `7.235%`, +10 flat damage `0.594%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Trickery | 168.0 | 5 | 33.6 | 3 | None | 1-5 | True | 100.8 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Rekop | 216.0 | 5 | 43.2 | 2 | None | 1-5 | True | 86.4 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| All or Nothing | 44.0 | 2 | 22.0 | None | 2 | 0-2 | False | 28.6 | WATER_DAMAGE |
| Misfortune | 28.5 | 3 | 9.5 | 3 | None | 1-6 | True | 28.5 | WATER_DAMAGE |
| Bluff | 27.5 | 3 | 9.17 | 3 | None | 1-6 | False | 27.5 | WATER_DAMAGE |
| Playful Claw | 37.0 | 4 | 9.25 | 2 | None | 1-5 | False | 18.5 | WATER_DAMAGE |
| Felintion | 34.5 | 4 | 8.62 | 2 | None | 3-6 | True | 17.25 | WATER_STEAL |
| Peril | 39.0 | 3 | 13.0 | None | 2 | 0-2 | False | 16.9 | WATER_DAMAGE |

### Ecaflip agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `7.264%`, +100 power `7.264%`, +10 flat damage `0.557%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Trickery | 168.0 | 5 | 33.6 | 3 | None | 1-5 | True | 100.8 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Rekop | 216.0 | 5 | 43.2 | 2 | None | 1-5 | True | 86.4 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Balling Up | 30.5 | 3 | 10.17 | 3 | None | 1-4 | False | 30.5 | AIR_DAMAGE |
| Nerve | 37.0 | 4 | 9.25 | 3 | None | 1-8 | True | 27.75 | AIR_DAMAGE |
| Claw of Ceangal | 18.0 | 2 | 9.0 | 3 | None | 1-3 | False | 27.0 | AIR_DAMAGE |
| Reflex | 33.0 | 4 | 8.25 | 2 | None | 1-5 | False | 16.5 | AIR_DAMAGE |
| Bravado | 38.5 | 4 | 9.62 | 1 | None | 0-6 | False | 9.625 | AIR_DAMAGE |

### Eliotrope strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `5.918%`, +100 power `5.918%`, +10 flat damage `2.307%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Persiflage | 27.0 | 3 | 9.0 | 3 | None | 1-5 | True | 27.0 | EARTH_DAMAGE |
| Sarcasm | 34.0 | 4 | 8.5 | 3 | None | 1-4 | False | 25.5 | EARTH_DAMAGE |
| Snub | 24.5 | 3 | 8.17 | 3 | None | 1-4 | True | 24.5 | EARTH_DAMAGE |
| Therapy | 22.0 | 3 | 7.33 | 3 | None | 1-7 | True | 22.0 | EARTH_DAMAGE |
| Convulsion | 21.0 | 3 | 7.0 | 2 | None | 2-5 | False | 14.0 | EARTH_DAMAGE |
| Shock | 20.0 | 3 | 6.67 | 2 | None | 2-6 | False | 13.333 | EARTH_DAMAGE |

### Eliotrope intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `6.628%`, +100 power `6.628%`, +10 flat damage `1.384%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Parasite | 70.0 | 5 | 14.0 | 3 | None | 1-4 | False | 42.0 | FIRE_DAMAGE |
| Lazybeam | 58.0 | 4 | 14.5 | 2 | None | 1-6 | False | 29.0 | FIRE_DAMAGE, FIRE_STEAL |
| Offence | 33.5 | 4 | 8.38 | 3 | None | 0-7 | True | 25.125 | FIRE_DAMAGE |
| Wakfu Ray | 27.0 | 3 | 9.0 | 2 | None | 2-5 | False | 18.0 | FIRE_DAMAGE |
| Affront | 21.5 | 3 | 7.17 | 2 | None | 1-7 | False | 14.333 | FIRE_DAMAGE |
| Virus | 36.0 | 4 | 9.0 | 1 | None | 0-4 | False | 9.0 | FIRE_DAMAGE |

### Eliotrope chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `6.35%`, +100 power `6.35%`, +10 flat damage `1.745%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Audacious | 55.0 | 3 | 18.33 | 3 | None | 1-4 | False | 55.0 | WATER_DAMAGE |
| Insolence | 26.5 | 3 | 8.83 | 3 | None | 1-6 | False | 26.5 | WATER_DAMAGE |
| Composure | 34.0 | 4 | 8.5 | 3 | None | 1-8 | True | 25.5 | WATER_DAMAGE |
| Lightning Fist | 24.0 | 3 | 8.0 | 3 | None | 1-4 | False | 24.0 | WATER_DAMAGE |
| Affliction | 26.5 | 4 | 6.62 | 3 | None | 1-6 | True | 19.875 | WATER_DAMAGE |
| Tribulation | 22.5 | 3 | 7.5 | 2 | None | 1-7 | True | 15.0 | WATER_DAMAGE |

### Eliotrope agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `6.018%`, +100 power `6.018%`, +10 flat damage `2.176%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Sermon | 35.0 | 4 | 8.75 | 3 | None | 1-5 | False | 26.25 | AIR_DAMAGE |
| Ridicule | 32.0 | 4 | 8.0 | 3 | None | 1-6 | False | 24.0 | AIR_DAMAGE |
| Insult | 27.0 | 3 | 9.0 | 2 | None | 1-3 | False | 18.0 | AIR_DAMAGE |
| Contempt | 25.5 | 3 | 8.5 | 2 | None | 1-7 | False | 17.0 | AIR_DAMAGE |
| Bullying | 24.0 | 3 | 8.0 | 2 | None | 0-6 | False | 16.0 | AIR_DAMAGE |
| Sinecure | 13.0 | 2 | 6.5 | 2 | None | 1-7 | False | 13.0 | AIR_DAMAGE |

### Eniripsa strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `6.422%`, +100 power `6.422%`, +10 flat damage `1.652%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| War Cry | 78.0 | 4 | 19.5 | 1 | None | 0-0 | False | 19.5 | EARTH_DAMAGE |
| Ancestral Ointment | 36.5 | 4 | 9.12 | 2 | None | 0-7 | False | 18.25 | EARTH_DAMAGE |
| Profanity | 23.5 | 3 | 7.83 | 2 | None | 1-6 | False | 15.667 | EARTH_DAMAGE |
| Tribal Paintbrush | 20.5 | 3 | 6.83 | 2 | None | 0-6 | False | 13.667 | EARTH_DAMAGE |
| Ritual Word | 30.0 | 3 | 10.0 | None | 2 | 0-4 | False | 13.0 | EARTH_DAMAGE |
| Scalpel | 57.0 | 4 | 14.25 | None | 3 | 0-2 | False | 12.041 | BEST_ELEMENT_DAMAGE |
| Warpaint | 10.0 | 2 | 5.0 | 2 | None | 0-7 | False | 10.0 | EARTH_DAMAGE |
| Furious Word | 34.0 | 4 | 8.5 | 1 | None | 1-3 | False | 8.5 | EARTH_DAMAGE |

### Eniripsa intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `6.242%`, +100 power `6.242%`, +10 flat damage `1.885%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Deafening Cry | 26.0 | 3 | 8.67 | 2 | None | 1-6 | True | 17.333 | FIRE_DAMAGE |
| Raucous Word | 25.5 | 3 | 8.5 | 2 | None | 0-5 | True | 17.0 | FIRE_DAMAGE |
| Pilfering | 21.0 | 3 | 7.0 | 2 | None | 1-8 | True | 14.0 | FIRE_STEAL |
| Scalpel | 57.0 | 4 | 14.25 | None | 3 | 0-2 | False | 12.041 | BEST_ELEMENT_DAMAGE |
| Turbulent Word | 38.5 | 4 | 9.62 | 1 | None | 0-4 | True | 9.625 | FIRE_DAMAGE |
| Commotion | 35.0 | 4 | 8.75 | 1 | None | 1-3 | False | 8.75 | FIRE_DAMAGE |
| Shrill Choir | 42.0 | 5 | 8.4 | 1 | None | 1-5 | True | 8.4 | FIRE_DAMAGE |
| Distracting Word | 32.0 | 4 | 8.0 | 1 | None | 0-6 | True | 8.0 | FIRE_DAMAGE |

### Eniripsa chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `6.253%`, +100 power `6.253%`, +10 flat damage `1.871%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Vampiric Word | 28.5 | 3 | 9.5 | 3 | None | 1-6 | False | 28.5 | WATER_STEAL |
| Bloodless Word | 38.5 | 4 | 9.62 | 2 | None | 0-5 | False | 19.25 | WATER_DAMAGE |
| Sobs | 24.5 | 3 | 8.17 | 2 | None | 1-6 | False | 16.333 | WATER_DAMAGE |
| Scalpel | 57.0 | 4 | 14.25 | None | 3 | 0-2 | False | 12.041 | BEST_ELEMENT_DAMAGE |
| Cryotherapy | 15.0 | 3 | 5.0 | 2 | None | 0-6 | False | 10.0 | WATER_DAMAGE |
| Forbidden Word | 48.0 | 5 | 9.6 | 1 | None | 0-4 | False | 9.6 | WATER_DAMAGE |
| Lamentations | 30.5 | 4 | 7.62 | 1 | None | 0-4 | False | 7.625 | WATER_DAMAGE |
| Defensive Word | 29.5 | 4 | 7.38 | 1 | None | 1-5 | False | 7.375 | WATER_STEAL |

### Eniripsa agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `7.142%`, +100 power `7.142%`, +10 flat damage `0.715%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Secret Word | 238.0 | 4 | 59.5 | 1 | None | 1-10 | True | 59.5 | AIR_DAMAGE |
| Malicious Word | 32.0 | 4 | 8.0 | 3 | None | 1-8 | True | 24.0 | AIR_DAMAGE |
| Mischievous Word | 22.5 | 3 | 7.5 | 3 | None | 1-7 | True | 22.5 | AIR_DAMAGE |
| Flowery Word | 35.0 | 4 | 8.75 | 2 | None | 0-6 | True | 17.5 | AIR_DAMAGE |
| Murmur | 17.0 | 2 | 8.5 | 2 | None | 0-6 | True | 17.0 | AIR_DAMAGE |
| Prankster's Word | 23.0 | 3 | 7.67 | 2 | None | 0-6 | True | 15.333 | AIR_DAMAGE |
| Scalpel | 57.0 | 4 | 14.25 | None | 3 | 0-2 | False | 12.041 | BEST_ELEMENT_DAMAGE |
| Enchanted Thicket | 41.0 | 4 | 10.25 | 1 | None | 0-7 | True | 10.25 | AIR_DAMAGE |

### Enutrof strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `6.27%`, +100 power `6.27%`, +10 flat damage `1.848%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Collapse | 46.0 | 3 | 15.33 | None | 1 | 1-7 | False | 30.667 | EARTH_DAMAGE |
| Prime of Life | 30.0 | 3 | 10.0 | 3 | None | 1-5 | False | 30.0 | EARTH_DAMAGE |
| Shovel Throwing | 33.5 | 4 | 8.38 | 3 | None | 1-8 | True | 25.125 | EARTH_DAMAGE |
| Mound | 21.0 | 3 | 7.0 | 2 | None | 2-8 | True | 14.0 | EARTH_DAMAGE |
| Peat Bog | 23.5 | 4 | 5.88 | 1 | None | 1-8 | True | 5.875 | EARTH_DAMAGE |

### Enutrof intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `6.908%`, +100 power `6.908%`, +10 flat damage `1.019%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Unsummoning | 121.5 | 4 | 30.38 | None | None | 1-5 | True | 60.75 | FIRE_DAMAGE |
| Mine Fire | 32.0 | 4 | 8.0 | 3 | None | 1-5 | True | 24.0 | FIRE_DAMAGE |
| Shovel Kiss | 21.0 | 3 | 7.0 | 3 | None | 1-8 | True | 21.0 | FIRE_DAMAGE |
| Ghostly Shovel | 27.0 | 3 | 9.0 | 2 | None | 1-8 | True | 18.0 | FIRE_DAMAGE |
| Firedamp Explosion | 49.0 | 3 | 16.33 | 1 | None | 1-8 | False | 16.333 | FIRE_DAMAGE |
| Deposit | 30.5 | 3 | 10.17 | 1 | None | 0-8 | False | 10.167 | FIRE_DAMAGE |

### Enutrof chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `6.206%`, +100 power `6.206%`, +10 flat damage `1.932%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Obsolescence | 28.0 | 3 | 9.33 | 3 | None | 1-7 | True | 28.0 | WATER_DAMAGE |
| Placer Mining | 40.0 | 3 | 13.33 | None | 1 | 1-6 | False | 26.667 | WATER_DAMAGE |
| Auriferous Shovel | 34.0 | 4 | 8.5 | 3 | None | 1-7 | True | 25.5 | WATER_DAMAGE |
| Shovel of the Ancients | 40.0 | 4 | 10.0 | None | None | 2-7 | True | 20.0 | WATER_DAMAGE |
| Coin Throwing | 14.0 | 2 | 7.0 | None | None | 0-12 | True | 14.0 | WATER_DAMAGE |
| Sieving | 27.0 | 3 | 9.0 | 1 | None | 1-5 | True | 9.0 | WATER_DAMAGE |

### Enutrof agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `6.168%`, +100 power `6.168%`, +10 flat damage `1.982%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Hard Cash | 43.0 | 3 | 14.33 | None | 1 | 1-5 | False | 28.667 | AIR_DAMAGE |
| Bankruptcy | 38.0 | 4 | 9.5 | 3 | None | 1-8 | True | 28.5 | AIR_DAMAGE |
| Opportuneness | 15.0 | 2 | 7.5 | 3 | None | 1-8 | False | 22.5 | AIR_DAMAGE |
| Loafylactic | 20.0 | 3 | 6.67 | 3 | None | 1-7 | True | 20.0 | AIR_DAMAGE |
| Spade of the Ancients | 34.0 | 4 | 8.5 | 2 | None | 2-8 | True | 17.0 | AIR_DAMAGE |

### Feca strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `6.798%`, +100 power `6.798%`, +10 flat damage `1.162%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Distrust | 86.0 | 2 | 43.0 | None | 1 | 0-9 | True | 86.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Barrier | 86.0 | 3 | 28.67 | None | 2 | 0-6 | False | 37.267 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Backlash | 31.0 | 3 | 10.33 | 3 | None | 1-4 | False | 31.0 | EARTH_DAMAGE |
| Tetany | 38.0 | 4 | 9.5 | 3 | None | 1-1 | False | 28.5 | EARTH_DAMAGE |
| Torpor | 28.5 | 3 | 9.5 | 3 | None | 1-5 | False | 28.5 | EARTH_DAMAGE |
| Dirt Floor | 32.5 | 3 | 10.83 | None | 3 | 0-5 | False | 14.083 | EARTH_DAMAGE |
| Refuge | 34.0 | 3 | 11.33 | 1 | None | 0-3 | False | 11.333 | EARTH_DAMAGE |
| Gather the Flock | 40.0 | 4 | 10.0 | 1 | None | 0-0 | False | 10.0 | EARTH_DAMAGE |

### Feca intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `6.776%`, +100 power `6.776%`, +10 flat damage `1.191%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Distrust | 86.0 | 2 | 43.0 | None | 1 | 0-9 | True | 86.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Barrier | 86.0 | 3 | 28.67 | None | 2 | 0-6 | False | 37.267 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Lethargy | 29.5 | 3 | 9.83 | 3 | None | 1-5 | True | 29.5 | FIRE_DAMAGE |
| Languor | 28.0 | 3 | 9.33 | 3 | None | 1-6 | True | 28.0 | FIRE_DAMAGE |
| Shepherd's Crook | 25.5 | 3 | 8.5 | 3 | None | 1-7 | True | 25.5 | FIRE_DAMAGE |
| Cowbell | 34.0 | 4 | 8.5 | 2 | None | 1-7 | True | 17.0 | FIRE_DAMAGE |
| Scorched Dirt | 35.0 | 3 | 11.67 | None | 3 | 0-5 | False | 15.167 | FIRE_DAMAGE |
| Lookout | 32.0 | 3 | 10.67 | 1 | None | 0-7 | True | 10.667 | FIRE_DAMAGE |

### Feca chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `6.778%`, +100 power `6.778%`, +10 flat damage `1.188%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Distrust | 86.0 | 2 | 43.0 | None | 1 | 0-9 | True | 86.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Barrier | 86.0 | 3 | 28.67 | None | 2 | 0-6 | False | 37.267 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Getaway | 28.0 | 3 | 9.33 | 3 | None | 1-6 | True | 28.0 | WATER_DAMAGE |
| Bubble | 18.0 | 2 | 9.0 | 3 | None | 1-8 | True | 27.0 | WATER_DAMAGE |
| Sudden Shower | 38.0 | 4 | 9.5 | 2 | None | 1-7 | True | 19.0 | WATER_DAMAGE |
| Nimbus | 24.0 | 3 | 8.0 | 2 | None | 0-7 | True | 16.0 | WATER_DAMAGE |
| Valley | 32.0 | 3 | 10.67 | None | 3 | 0-7 | True | 13.867 | WATER_DAMAGE |
| Black Ice | 33.0 | 3 | 11.0 | 1 | None | 0-8 | True | 11.0 | WATER_DAMAGE |

### Feca agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `6.813%`, +100 power `6.813%`, +10 flat damage `1.143%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Distrust | 86.0 | 2 | 43.0 | None | 1 | 0-9 | True | 86.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Barrier | 86.0 | 3 | 28.67 | None | 2 | 0-6 | False | 37.267 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Gust | 20.0 | 2 | 10.0 | 2 | None | 1-5 | False | 20.0 | AIR_DAMAGE |
| Typhoon | 26.0 | 3 | 8.67 | 2 | None | 1-4 | False | 17.333 | AIR_DAMAGE |
| Shiver | 34.0 | 4 | 8.5 | 2 | None | 1-4 | False | 17.0 | AIR_DAMAGE |
| Silbo | 24.0 | 3 | 8.0 | 2 | None | 1-6 | False | 16.0 | AIR_DAMAGE |
| Prairie | 33.0 | 3 | 11.0 | None | 3 | 0-5 | False | 14.3 | AIR_DAMAGE |
| Pastureland | 33.0 | 3 | 11.0 | 1 | None | 0-6 | False | 11.0 | AIR_DAMAGE |

### Foggernaut strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `7.565%`, +100 power `7.565%`, +10 flat damage `0.165%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Drill | 644.0 | 2 | 322.0 | None | 3 | 1-7 | False | 418.6 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Harpooner | 340.5 | 2 | 170.25 | None | 3 | 1-7 | False | 221.325 | BEST_ELEMENT_DAMAGE, FIRE_STEAL, AIR_STEAL, WATER_STEAL, EARTH_STEAL |
| Mooring | 19.5 | 2 | 9.75 | 3 | None | 1-7 | True | 29.25 | EARTH_DAMAGE |
| Backwash | 17.0 | 2 | 8.5 | 3 | None | 0-7 | True | 25.5 | EARTH_DAMAGE |
| Capstan | 30.5 | 3 | 10.17 | 2 | None | 0-8 | False | 20.333 | EARTH_DAMAGE |
| Anchor | 36.5 | 4 | 9.12 | 2 | None | 0-8 | False | 18.25 | EARTH_DAMAGE |
| Rudder | 28.5 | 3 | 9.5 | 1 | None | 0-7 | False | 9.5 | EARTH_DAMAGE |
| Ambush | 32.0 | 4 | 8.0 | 1 | None | 2-6 | False | 8.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |

### Foggernaut intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `7.571%`, +100 power `7.571%`, +10 flat damage `0.158%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Drill | 644.0 | 2 | 322.0 | None | 3 | 1-7 | False | 418.6 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Harpooner | 340.5 | 2 | 170.25 | None | 3 | 1-7 | False | 221.325 | BEST_ELEMENT_DAMAGE, FIRE_STEAL, AIR_STEAL, WATER_STEAL, EARTH_STEAL |
| Valve | 14.0 | 2 | 7.0 | 3 | None | 1-8 | False | 21.0 | FIRE_DAMAGE |
| Hoofbeat | 25.5 | 3 | 8.5 | 2 | None | 0-6 | False | 17.0 | FIRE_DAMAGE |
| Vapour | 31.0 | 3 | 10.33 | 1 | None | 0-5 | False | 10.333 | FIRE_DAMAGE |
| Turbine | 29.0 | 3 | 9.67 | 1 | None | 0-7 | False | 9.667 | FIRE_DAMAGE |
| Short-Circuit | 35.0 | 4 | 8.75 | 1 | None | 0-7 | False | 8.75 | FIRE_DAMAGE |
| Ambush | 32.0 | 4 | 8.0 | 1 | None | 2-6 | False | 8.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |

### Foggernaut chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `7.559%`, +100 power `7.559%`, +10 flat damage `0.173%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Drill | 644.0 | 2 | 322.0 | None | 3 | 1-7 | False | 418.6 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Harpooner | 340.5 | 2 | 170.25 | None | 3 | 1-7 | False | 221.325 | BEST_ELEMENT_DAMAGE, FIRE_STEAL, AIR_STEAL, WATER_STEAL, EARTH_STEAL |
| Torrent | 64.0 | 3 | 21.33 | 3 | None | 1-4 | True | 64.0 | WATER_DAMAGE |
| Periscope | 30.0 | 3 | 10.0 | 3 | None | 1-5 | False | 30.0 | WATER_DAMAGE |
| Spyglass | 27.0 | 3 | 9.0 | 3 | None | 0-6 | True | 27.0 | WATER_DAMAGE |
| Froth | 38.0 | 4 | 9.5 | 2 | None | 1-6 | True | 19.0 | WATER_DAMAGE |
| Tide | 36.0 | 3 | 12.0 | 1 | None | 0-3 | False | 12.0 | WATER_DAMAGE |
| Ambush | 32.0 | 4 | 8.0 | 1 | None | 2-6 | False | 8.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |

### Foggernaut agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `7.562%`, +100 power `7.562%`, +10 flat damage `0.17%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Drill | 644.0 | 2 | 322.0 | None | 3 | 1-7 | False | 418.6 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Harpooner | 340.5 | 2 | 170.25 | None | 3 | 1-7 | False | 221.325 | BEST_ELEMENT_DAMAGE, FIRE_STEAL, AIR_STEAL, WATER_STEAL, EARTH_STEAL |
| Pilfer | 84.0 | 4 | 21.0 | 2 | None | 1-7 | False | 42.0 | AIR_DAMAGE |
| Corrosion | 28.0 | 3 | 9.33 | 3 | None | 1-6 | True | 28.0 | AIR_DAMAGE |
| Torpedo | 27.0 | 3 | 9.0 | 3 | None | 1-6 | True | 27.0 | AIR_DAMAGE |
| Trident | 30.0 | 3 | 10.0 | 2 | None | 1-6 | False | 20.0 | AIR_DAMAGE |
| Harmattan | 33.0 | 4 | 8.25 | None | 1 | 1-6 | True | 16.5 | AIR_DAMAGE |
| Ambush | 32.0 | 4 | 8.0 | 1 | None | 2-6 | False | 8.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |

### Forgelance strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `6.018%`, +100 power `6.018%`, +10 flat damage `2.176%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Upheaval | 31.0 | 3 | 10.33 | 2 | None | 1-1 | False | 20.667 | EARTH_DAMAGE |
| Slingshot | 26.5 | 3 | 8.83 | 2 | None | 1-5 | False | 17.667 | EARTH_DAMAGE |
| Earthen Weakness | 15.0 | 2 | 7.5 | 2 | None | 1-2 | False | 15.0 | EARTH_DAMAGE |
| Middle Earth | 32.0 | 3 | 10.67 | 1 | None | 0-0 | False | 10.667 | EARTH_DAMAGE |
| Seismic Pike | 27.5 | 3 | 9.17 | 1 | None | 1-1 | False | 9.167 | EARTH_DAMAGE |
| Vajra | 41.5 | 4 | 10.38 | None | 3 | 2-4 | False | 8.767 | BEST_ELEMENT_STEAL |
| Heroic Charge | 31.0 | 3 | 10.33 | None | 2 | 1-5 | False | 8.732 | BEST_ELEMENT_DAMAGE |
| Collapse | 21.0 | 3 | 7.0 | 1 | None | 0-2 | False | 7.0 | EARTH_DAMAGE |

### Forgelance intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `5.923%`, +100 power `5.923%`, +10 flat damage `2.3%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Burning Estoc | 24.5 | 3 | 8.17 | 2 | None | 1-2 | False | 16.333 | FIRE_DAMAGE |
| Fire Lance | 22.5 | 3 | 7.5 | 2 | None | 2-6 | False | 15.0 | FIRE_DAMAGE |
| Hot Iron | 21.5 | 3 | 7.17 | 2 | None | 1-2 | False | 14.333 | FIRE_DAMAGE |
| Maelstrom | 19.0 | 2 | 9.5 | None | 2 | 0-1 | False | 12.35 | FIRE_DAMAGE |
| Spicy Mill | 30.0 | 3 | 10.0 | 1 | None | 0-2 | False | 10.0 | FIRE_DAMAGE |
| Vajra | 41.5 | 4 | 10.38 | None | 3 | 2-4 | False | 8.767 | BEST_ELEMENT_STEAL |
| Heroic Charge | 31.0 | 3 | 10.33 | None | 2 | 1-5 | False | 8.732 | BEST_ELEMENT_DAMAGE |
| Muspel | 34.0 | 4 | 8.5 | 1 | None | 1-4 | False | 8.5 | FIRE_DAMAGE |

### Forgelance chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `6.012%`, +100 power `6.012%`, +10 flat damage `2.185%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Octave | 17.0 | 2 | 8.5 | 2 | None | 1-1 | False | 17.0 | WATER_DAMAGE |
| Lance of the Lake | 23.5 | 3 | 7.83 | 2 | None | 1-5 | True | 15.667 | WATER_DAMAGE |
| Biting Trident | 22.5 | 3 | 7.5 | 2 | None | 1-6 | True | 15.0 | WATER_DAMAGE |
| Elding | 34.0 | 4 | 8.5 | None | 2 | 1-6 | True | 11.05 | WATER_DAMAGE |
| Jormun | 32.0 | 3 | 10.67 | 1 | None | 0-8 | True | 10.667 | WATER_DAMAGE |
| Lightning-Javelin | 30.0 | 3 | 10.0 | 1 | None | 2-6 | True | 10.0 | WATER_DAMAGE |
| Balestra | 29.5 | 3 | 9.83 | 1 | None | 1-5 | False | 9.833 | WATER_DAMAGE |
| Vajra | 41.5 | 4 | 10.38 | None | 3 | 2-4 | False | 8.767 | BEST_ELEMENT_STEAL |

### Forgelance agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `6.059%`, +100 power `6.059%`, +10 flat damage `2.123%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| No Myr Javelin | 28.0 | 3 | 9.33 | 2 | None | 2-5 | False | 18.667 | AIR_DAMAGE |
| Brass Volley | 23.5 | 3 | 7.83 | 2 | None | 1-6 | False | 15.667 | AIR_DAMAGE |
| Cyclone Lancer | 32.0 | 3 | 10.67 | 1 | None | 2-6 | False | 10.667 | AIR_DAMAGE |
| Windmill | 31.0 | 3 | 10.33 | 1 | None | 0-1 | False | 10.333 | AIR_DAMAGE |
| Brass Rain | 20.0 | 2 | 10.0 | 1 | None | 0-1 | False | 10.0 | AIR_DAMAGE |
| Vajra | 41.5 | 4 | 10.38 | None | 3 | 2-4 | False | 8.767 | BEST_ELEMENT_STEAL |
| Heroic Charge | 31.0 | 3 | 10.33 | None | 2 | 1-5 | False | 8.732 | BEST_ELEMENT_DAMAGE |
| Disengaging | 30.5 | 4 | 7.62 | 1 | None | 0-0 | False | 7.625 | AIR_DAMAGE |

### Huppermage strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `7.36%`, +100 power `7.36%`, +10 flat damage `0.433%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Morph | 280.0 | 3 | 93.33 | 3 | None | 1-4 | False | 280.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Arcane Torrent | 276.0 | 3 | 92.0 | None | 3 | 1-8 | False | 119.6 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Elemental Drain | 100.0 | 2 | 50.0 | 2 | None | 1-3 | False | 100.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Manifestation | 60.0 | 2 | 30.0 | 2 | None | 1-8 | True | 60.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Runification | 60.0 | 2 | 30.0 | 2 | None | 0-0 | False | 60.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Journey | 142.0 | 4 | 35.5 | None | 3 | 5-5 | False | 46.15 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Telluric Blade | 36.0 | 4 | 9.0 | 3 | None | 0-7 | True | 27.0 | EARTH_DAMAGE |
| Telluric Wave | 27.0 | 3 | 9.0 | 3 | None | 1-6 | True | 27.0 | EARTH_DAMAGE |

### Huppermage intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `7.357%`, +100 power `7.357%`, +10 flat damage `0.435%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Morph | 280.0 | 3 | 93.33 | 3 | None | 1-4 | False | 280.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Arcane Torrent | 276.0 | 3 | 92.0 | None | 3 | 1-8 | False | 119.6 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Elemental Drain | 100.0 | 2 | 50.0 | 2 | None | 1-3 | False | 100.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Manifestation | 60.0 | 2 | 30.0 | 2 | None | 1-8 | True | 60.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Runification | 60.0 | 2 | 30.0 | 2 | None | 0-0 | False | 60.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Journey | 142.0 | 4 | 35.5 | None | 3 | 5-5 | False | 46.15 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Sun Lance | 36.0 | 4 | 9.0 | 3 | None | 1-3 | False | 27.0 | FIRE_DAMAGE |
| Runic Overcharge | 40.0 | 3 | 13.33 | 2 | None | 1-5 | False | 26.667 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |

### Huppermage chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `7.354%`, +100 power `7.354%`, +10 flat damage `0.439%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Morph | 280.0 | 3 | 93.33 | 3 | None | 1-4 | False | 280.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Arcane Torrent | 276.0 | 3 | 92.0 | None | 3 | 1-8 | False | 119.6 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Elemental Drain | 100.0 | 2 | 50.0 | 2 | None | 1-3 | False | 100.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Manifestation | 60.0 | 2 | 30.0 | 2 | None | 1-8 | True | 60.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Runification | 60.0 | 2 | 30.0 | 2 | None | 0-0 | False | 60.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Journey | 142.0 | 4 | 35.5 | None | 3 | 5-5 | False | 46.15 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Stalagmite | 29.5 | 3 | 9.83 | 3 | None | 1-2 | False | 29.5 | WATER_DAMAGE |
| Runic Overcharge | 40.0 | 3 | 13.33 | 2 | None | 1-5 | False | 26.667 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |

### Huppermage agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `7.361%`, +100 power `7.361%`, +10 flat damage `0.43%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Morph | 280.0 | 3 | 93.33 | 3 | None | 1-4 | False | 280.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Arcane Torrent | 276.0 | 3 | 92.0 | None | 3 | 1-8 | False | 119.6 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Elemental Drain | 100.0 | 2 | 50.0 | 2 | None | 1-3 | False | 100.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Manifestation | 60.0 | 2 | 30.0 | 2 | None | 1-8 | True | 60.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Runification | 60.0 | 2 | 30.0 | 2 | None | 0-0 | False | 60.0 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Journey | 142.0 | 4 | 35.5 | None | 3 | 5-5 | False | 46.15 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Runic Overcharge | 40.0 | 3 | 13.33 | 2 | None | 1-5 | False | 26.667 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Comet | 30.0 | 4 | 7.5 | 3 | None | 1-8 | True | 22.5 | AIR_DAMAGE |

### Iop strength - high

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `6.519%`, +100 power `6.519%`, +10 flat damage `1.525%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Concentration | 54.0 | 2 | 27.0 | 4 | None | 1-1 | False | 81.0 | EARTH_DAMAGE |
| Accumulation | 24.0 | 3 | 8.0 | 3 | None | 0-4 | False | 24.0 | EARTH_DAMAGE |
| Sword of Iop | 39.0 | 4 | 9.75 | 2 | None | 0-8 | False | 19.5 | EARTH_DAMAGE |
| Pressure | 28.0 | 3 | 9.33 | None | None | 1-4 | False | 18.667 | EARTH_DAMAGE |
| Iop's Wrath | 90.5 | 7 | 12.93 | None | 3 | 1-1 | False | 16.807 | EARTH_DAMAGE |
| Pygmachia | 10.0 | 2 | 5.0 | 4 | None | 1-6 | False | 15.0 | EARTH_DAMAGE |
| Fit of Rage | 30.0 | 3 | 10.0 | 1 | None | 1-1 | False | 10.0 | EARTH_DAMAGE |
| Intimidation | 9.0 | 2 | 4.5 | 3 | None | 1-2 | False | 8.775 | BEST_ELEMENT_DAMAGE |

### Iop intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `7.438%`, +100 power `7.438%`, +10 flat damage `0.331%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Tumult | 400.0 | 4 | 100.0 | None | 1 | 0-5 | False | 200.0 | FIRE_DAMAGE |
| Strengthstorm | 101.0 | 3 | 33.67 | 3 | None | 3-5 | False | 101.0 | FIRE_DAMAGE |
| Sentence | 42.5 | 2 | 21.25 | 3 | None | 0-6 | True | 63.75 | FIRE_DAMAGE |
| Destructive Sword | 34.0 | 4 | 8.5 | 2 | None | 1-3 | False | 17.0 | FIRE_DAMAGE |
| Chopper | 25.0 | 3 | 8.33 | 2 | None | 1-6 | True | 16.667 | FIRE_DAMAGE |
| Sword of Fate | 40.0 | 4 | 10.0 | None | 2 | 1-2 | False | 13.0 | FIRE_DAMAGE |
| Intimidation | 9.0 | 2 | 4.5 | 3 | None | 1-2 | False | 8.775 | BEST_ELEMENT_DAMAGE |

### Iop chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `6.418%`, +100 power `6.418%`, +10 flat damage `1.657%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Endurance | 32.0 | 3 | 10.67 | 3 | None | 0-2 | False | 32.0 | WATER_DAMAGE |
| Outpouring | 40.0 | 4 | 10.0 | 3 | None | 1-6 | False | 30.0 | WATER_DAMAGE |
| Threat | 27.0 | 3 | 9.0 | 3 | None | 1-3 | False | 27.0 | WATER_DAMAGE |
| Fervour | 25.5 | 3 | 8.5 | 3 | None | 1-5 | False | 25.5 | WATER_DAMAGE |
| Sword of Judgement | 83.0 | 4 | 20.75 | 1 | None | 0-4 | False | 20.75 | WATER_DAMAGE |
| Cleaver | 50.0 | 5 | 10.0 | 2 | None | 0-4 | False | 20.0 | WATER_DAMAGE |
| Castigation | 36.0 | 4 | 9.0 | 2 | None | 1-1 | False | 18.0 | WATER_DAMAGE |
| Intimidation | 9.0 | 2 | 4.5 | 3 | None | 1-2 | False | 8.775 | BEST_ELEMENT_DAMAGE |

### Iop agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `6.194%`, +100 power `6.194%`, +10 flat damage `1.948%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Celestial Sword | 38.0 | 4 | 9.5 | 2 | None | 0-4 | False | 19.0 | AIR_DAMAGE |
| Divine Sword | 28.0 | 3 | 9.33 | 2 | None | 0-0 | False | 18.667 | AIR_DAMAGE |
| Destructive Ring | 26.0 | 3 | 8.67 | 2 | None | 0-2 | False | 17.333 | AIR_DAMAGE |
| Fracture | 34.0 | 4 | 8.5 | 2 | None | 1-4 | False | 17.0 | AIR_DAMAGE |
| Pounding | 32.0 | 4 | 8.0 | 2 | None | 1-7 | True | 16.0 | AIR_DAMAGE |
| Intimidation | 9.0 | 2 | 4.5 | 3 | None | 1-2 | False | 8.775 | BEST_ELEMENT_DAMAGE |
| Zenith | 83.0 | 20 | 4.15 | 1 | None | 1-2 | False | 4.15 | AIR_DAMAGE |

### Masqueraider strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `6.471%`, +100 power `6.471%`, +10 flat damage `1.587%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Furia | 37.0 | 3 | 12.33 | 3 | None | 1-3 | False | 37.0 | EARTH_DAMAGE |
| Carnavalo | 93.0 | 3 | 31.0 | None | 5 | 1-3 | False | 18.135 | BEST_ELEMENT_DAMAGE |
| Catalepsy | 24.0 | 3 | 8.0 | 2 | None | 0-0 | False | 16.0 | EARTH_STEAL |
| Martelo | 23.5 | 3 | 7.83 | 2 | None | 1-5 | True | 15.667 | EARTH_DAMAGE |
| Apathy | 30.0 | 4 | 7.5 | None | None | 2-8 | True | 15.0 | EARTH_DAMAGE |
| Shove Off | 34.0 | 3 | 11.33 | None | 2 | 1-1 | False | 14.733 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Ronda | 40.0 | 4 | 10.0 | 1 | None | 0-1 | False | 10.0 | EARTH_DAMAGE |

### Masqueraider intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `6.364%`, +100 power `6.364%`, +10 flat damage `1.726%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Inferno | 40.0 | 4 | 10.0 | 3 | None | 1-2 | False | 30.0 | FIRE_DAMAGE |
| Apostasy | 26.5 | 3 | 8.83 | 3 | None | 2-6 | True | 26.5 | FIRE_DAMAGE |
| Decoy | 26.0 | 3 | 8.67 | 3 | None | 1-4 | False | 26.0 | FIRE_STEAL |
| Brincaderia | 14.0 | 2 | 7.0 | 4 | None | 1-8 | True | 21.0 | FIRE_DAMAGE |
| Carnavalo | 93.0 | 3 | 31.0 | None | 5 | 1-3 | False | 18.135 | BEST_ELEMENT_DAMAGE |
| Shove Off | 34.0 | 3 | 11.33 | None | 2 | 1-1 | False | 14.733 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Purgatorio | 34.0 | 3 | 11.33 | 1 | None | 1-3 | False | 11.333 | FIRE_DAMAGE |

### Masqueraider chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `6.237%`, +100 power `6.237%`, +10 flat damage `1.892%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Boliche | 27.0 | 3 | 9.0 | 3 | None | 1-5 | False | 27.0 | WATER_DAMAGE |
| Bocciara | 17.5 | 2 | 8.75 | 3 | None | 1-5 | False | 26.25 | WATER_DAMAGE |
| Ponteira | 21.5 | 3 | 7.17 | 3 | None | 1-7 | False | 21.5 | WATER_DAMAGE |
| Carnavalo | 93.0 | 3 | 31.0 | None | 5 | 1-3 | False | 18.135 | BEST_ELEMENT_DAMAGE |
| Distance | 25.0 | 3 | 8.33 | 2 | None | 2-10 | False | 16.667 | WATER_DAMAGE |
| Parafuso | 22.5 | 3 | 7.5 | 2 | None | 0-5 | False | 15.0 | WATER_STEAL |
| Shove Off | 34.0 | 3 | 11.33 | None | 2 | 1-1 | False | 14.733 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |

### Masqueraider agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `6.429%`, +100 power `6.429%`, +10 flat damage `1.642%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Cavalcade | 40.0 | 4 | 10.0 | 3 | None | 1-5 | False | 30.0 | AIR_DAMAGE |
| Retention | 29.0 | 3 | 9.67 | 3 | None | 1-3 | False | 29.0 | AIR_STEAL |
| Picada | 26.5 | 3 | 8.83 | 3 | None | 2-6 | True | 26.5 | AIR_DAMAGE |
| Capering | 30.0 | 3 | 10.0 | 2 | None | 1-1 | False | 20.0 | AIR_DAMAGE |
| Carnavalo | 93.0 | 3 | 31.0 | None | 5 | 1-3 | False | 18.135 | BEST_ELEMENT_DAMAGE |
| Agular | 32.0 | 4 | 8.0 | 2 | None | 1-7 | False | 16.0 | AIR_DAMAGE |
| Shove Off | 34.0 | 3 | 11.33 | None | 2 | 1-1 | False | 14.733 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |

### Osamodas strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `6.131%`, +100 power `6.131%`, +10 flat damage `2.029%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Sedimentation | 40.0 | 4 | 10.0 | 3 | None | 1-3 | False | 30.0 | EARTH_DAMAGE |
| Woolly Sledgehammer | 19.0 | 2 | 9.5 | 3 | None | 1-3 | False | 28.5 | EARTH_DAMAGE |
| Constriction | 26.5 | 3 | 8.83 | 3 | None | 1-5 | False | 26.5 | EARTH_STEAL |
| Crackler Punch | 38.5 | 4 | 9.62 | 2 | None | 1-3 | False | 19.25 | EARTH_DAMAGE |
| Gobball Fleece | 34.0 | 4 | 8.5 | 2 | None | 0-2 | False | 17.0 | EARTH_DAMAGE |
| Fossil | 24.0 | 3 | 8.0 | 2 | None | 0-4 | False | 16.0 | EARTH_DAMAGE |

### Osamodas intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `5.966%`, +100 power `5.966%`, +10 flat damage `2.245%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Sparkmeleon | 27.5 | 3 | 9.17 | 3 | None | 1-5 | True | 27.5 | FIRE_DAMAGE |
| Dragon's Breath | 33.0 | 4 | 8.25 | 3 | None | 1-7 | True | 24.75 | FIRE_DAMAGE |
| Cross Scale | 35.0 | 4 | 8.75 | 2 | None | 1-3 | False | 17.5 | FIRE_DAMAGE |
| Dragonic | 22.0 | 3 | 7.33 | 2 | None | 1-7 | False | 14.667 | FIRE_DAMAGE |
| Flaming Crow | 9.0 | 2 | 4.5 | 3 | None | 1-5 | False | 13.5 | FIRE_DAMAGE |
| Dragon Heart | 23.0 | 3 | 7.67 | 1 | None | 0-0 | False | 7.667 | FIRE_DAMAGE |

### Osamodas chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `6.045%`, +100 power `6.045%`, +10 flat damage `2.142%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Aquatic Wave | 27.0 | 3 | 9.0 | 3 | None | 1-7 | False | 27.0 | WATER_DAMAGE |
| Geyser | 26.5 | 3 | 8.83 | 3 | None | 1-5 | False | 26.5 | WATER_DAMAGE |
| Batra | 38.0 | 4 | 9.5 | 2 | None | 0-0 | False | 19.0 | WATER_DAMAGE |
| Whirlwind | 32.5 | 4 | 8.12 | 2 | None | 1-4 | False | 16.25 | WATER_DAMAGE |
| Scalding Poison | 16.0 | 2 | 8.0 | 2 | None | 1-6 | False | 16.0 | WATER_DAMAGE |
| Aquaculture | 29.5 | 4 | 7.38 | 2 | None | 1-4 | False | 14.75 | WATER_DAMAGE |

### Osamodas agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `5.808%`, +100 power `5.808%`, +10 flat damage `2.45%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Canine | 22.5 | 3 | 7.5 | 3 | None | 1-7 | True | 22.5 | AIR_DAMAGE |
| Gambol | 20.0 | 2 | 10.0 | 2 | None | 1-1 | False | 20.0 | AIR_DAMAGE |
| Plucking | 24.5 | 3 | 8.17 | 2 | None | 1-5 | True | 16.333 | AIR_DAMAGE |
| Repulsive Fang | 16.0 | 2 | 8.0 | 2 | None | 1-5 | False | 16.0 | AIR_DAMAGE |
| Duster | 31.0 | 4 | 7.75 | 2 | None | 1-6 | True | 15.5 | AIR_DAMAGE |
| Takeoff | 35.0 | 4 | 8.75 | 1 | None | 1-3 | False | 8.75 | AIR_DAMAGE |

### Ouginak strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `6.306%`, +100 power `6.306%`, +10 flat damage `1.802%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Mastiff | 36.0 | 2 | 18.0 | 4 | None | 1-2 | False | 54.0 | EARTH_STEAL, EARTH_DAMAGE |
| Humerus | 43.5 | 4 | 10.88 | 2 | None | 1-1 | False | 21.75 | EARTH_DAMAGE |
| Watchdog | 32.5 | 3 | 10.83 | 2 | None | 1-1 | False | 21.667 | EARTH_DAMAGE |
| Amarok | 29.5 | 3 | 9.83 | 2 | None | 0-3 | False | 19.667 | EARTH_DAMAGE |
| Cerberus | 16.5 | 4 | 4.12 | 1 | None | 1-2 | False | 4.125 | EARTH_DAMAGE |

### Ouginak intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `6.629%`, +100 power `6.629%`, +10 flat damage `1.382%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Hunt | 83.0 | 4 | 20.75 | 3 | None | 1-2 | False | 62.25 | FIRE_DAMAGE |
| Woof | 21.0 | 2 | 10.5 | 3 | None | 1-2 | False | 31.5 | FIRE_DAMAGE |
| Tally Ho | 30.0 | 3 | 10.0 | 3 | None | 1-4 | False | 30.0 | FIRE_DAMAGE |
| Tracking | 33.0 | 3 | 11.0 | 2 | None | 1-6 | False | 22.0 | FIRE_DAMAGE |
| Tetanisation | 43.5 | 4 | 10.88 | 2 | None | 1-2 | False | 21.75 | FIRE_DAMAGE |
| Jaw | 29.5 | 3 | 9.83 | 2 | None | 0-5 | False | 19.667 | FIRE_DAMAGE |

### Ouginak chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `5.979%`, +100 power `5.979%`, +10 flat damage `2.227%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Ulna | 17.0 | 2 | 8.5 | 3 | None | 1-10 | False | 25.5 | WATER_DAMAGE |
| Radius | 34.0 | 3 | 11.33 | 2 | None | 1-2 | False | 22.667 | WATER_DAMAGE |
| Calcaneus | 15.0 | 2 | 7.5 | 3 | None | 1-7 | False | 22.5 | WATER_DAMAGE |
| Marrow Bone | 22.5 | 3 | 7.5 | 3 | None | 1-6 | False | 22.5 | WATER_DAMAGE |
| Tibia | 42.5 | 4 | 10.62 | 2 | None | 0-0 | False | 21.25 | WATER_DAMAGE |
| Vertebra | 34.0 | 4 | 8.5 | 2 | None | 1-3 | False | 17.0 | WATER_DAMAGE |

### Ouginak agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `7.479%`, +100 power `7.479%`, +10 flat damage `0.278%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Stripping | 385.0 | 5 | 77.0 | None | 1 | 1-2 | False | 154.0 | AIR_DAMAGE |
| Muzzle | 415.0 | 5 | 83.0 | 1 | None | 1-2 | False | 83.0 | AIR_DAMAGE |
| Carrion | 30.5 | 3 | 10.17 | 3 | None | 1-4 | False | 30.5 | AIR_DAMAGE |
| Bloodhound | 29.5 | 3 | 9.83 | 3 | None | 1-3 | False | 29.5 | AIR_DAMAGE |
| Beaten | 28.5 | 3 | 9.5 | 3 | None | 1-6 | False | 28.5 | AIR_DAMAGE |
| Carving Up | 42.5 | 4 | 10.62 | 2 | None | 1-4 | False | 21.25 | AIR_DAMAGE |
| Carcass | 10.0 | 2 | 5.0 | 4 | None | 1-6 | False | 15.0 | AIR_DAMAGE |

### Pandawa strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `6.735%`, +100 power `6.735%`, +10 flat damage `1.245%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Pandatak | 88.0 | 4 | 22.0 | 2 | None | 1-6 | False | 44.0 | EARTH_DAMAGE |
| Filthipint | 72.0 | 4 | 18.0 | 2 | None | 0-0 | False | 36.0 | EARTH_STEAL, EARTH_DAMAGE |
| Debauchery | 29.0 | 3 | 9.67 | 3 | None | 1-6 | False | 29.0 | EARTH_DAMAGE |
| Hangover | 25.5 | 3 | 8.5 | 3 | None | 1-2 | False | 25.5 | EARTH_DAMAGE |
| Stretcher | 33.0 | 2 | 16.5 | 1 | None | 1-5 | False | 16.5 | EARTH_DAMAGE |
| Eviction | 16.0 | 2 | 8.0 | 2 | None | 1-1 | False | 16.0 | EARTH_DAMAGE |
| Pandawa's Hand | 75.0 | 5 | 15.0 | None | 5 | 1-5 | False | 13.5 | EARTH_DAMAGE, BEST_ELEMENT_DAMAGE, AIR_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE, NEUTRAL_DAMAGE |

### Pandawa intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `6.301%`, +100 power `6.301%`, +10 flat damage `1.809%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Pandilongation | 29.5 | 2 | 14.75 | 2 | None | 1-5 | False | 29.5 | FIRE_DAMAGE |
| Absinthe | 27.0 | 2 | 13.5 | 2 | None | 1-5 | False | 27.0 | FIRE_DAMAGE, FIRE_STEAL |
| Explosive Flask | 42.5 | 2 | 21.25 | 1 | None | 1-8 | False | 21.25 | FIRE_DAMAGE |
| Explosive Palm | 21.0 | 3 | 7.0 | 3 | None | 1-5 | False | 21.0 | FIRE_DAMAGE |
| Pandjiu | 30.0 | 3 | 10.0 | 2 | None | 1-5 | False | 20.0 | FIRE_DAMAGE |
| Pandawa's Hand | 75.0 | 5 | 15.0 | None | 5 | 1-5 | False | 13.5 | EARTH_DAMAGE, BEST_ELEMENT_DAMAGE, AIR_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE, NEUTRAL_DAMAGE |
| Fiery Breath | 40.0 | 4 | 10.0 | 1 | None | 1-3 | False | 10.0 | FIRE_DAMAGE |

### Pandawa chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `6.694%`, +100 power `6.694%`, +10 flat damage `1.298%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Melancholy | 84.0 | 4 | 21.0 | 2 | None | 1-10 | False | 42.0 | WATER_DAMAGE |
| Brandy | 27.5 | 2 | 13.75 | 2 | None | 1-4 | False | 27.5 | WATER_DAMAGE |
| Tipple | 26.5 | 3 | 8.83 | 3 | None | 1-6 | True | 26.5 | WATER_DAMAGE |
| Alcoshu | 24.0 | 2 | 12.0 | 2 | None | 1-6 | True | 24.0 | WATER_DAMAGE, WATER_STEAL |
| Distillation | 78.5 | 4 | 19.62 | 1 | None | 1-8 | False | 19.625 | WATER_DAMAGE |
| Pandawa's Hand | 75.0 | 5 | 15.0 | None | 5 | 1-5 | False | 13.5 | EARTH_DAMAGE, BEST_ELEMENT_DAMAGE, AIR_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE, NEUTRAL_DAMAGE |
| Waterfall | 26.0 | 3 | 8.67 | 1 | None | 1-5 | False | 8.667 | WATER_DAMAGE |

### Pandawa agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `6.452%`, +100 power `6.452%`, +10 flat damage `1.613%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Liqueur | 47.0 | 3 | 15.67 | 3 | None | 1-7 | True | 47.0 | AIR_DAMAGE, AIR_STEAL |
| Nausea | 36.0 | 2 | 18.0 | 2 | None | 1-8 | False | 36.0 | AIR_DAMAGE |
| Propulsion | 35.0 | 2 | 17.5 | 2 | None | 1-4 | False | 35.0 | AIR_DAMAGE |
| Alcoholic Breath | 30.0 | 3 | 10.0 | 2 | None | 1-6 | False | 20.0 | AIR_DAMAGE |
| Schnaps | 22.5 | 3 | 7.5 | 2 | None | 1-8 | True | 15.0 | AIR_DAMAGE |
| Pandawa's Hand | 75.0 | 5 | 15.0 | None | 5 | 1-5 | False | 13.5 | EARTH_DAMAGE, BEST_ELEMENT_DAMAGE, AIR_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE, NEUTRAL_DAMAGE |
| Numbness | 38.0 | 4 | 9.5 | 1 | None | 1-7 | True | 9.5 | AIR_DAMAGE |

### Rogue strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `7.491%`, +100 power `7.491%`, +10 flat damage `0.261%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Obliteration | 390.0 | 4 | 97.5 | 2 | None | 1-5 | False | 195.0 | EARTH_DAMAGE |
| Musket | 20.0 | 2 | 10.0 | 3 | None | 1-5 | False | 30.0 | EARTH_DAMAGE |
| Arquebus | 37.0 | 4 | 9.25 | 2 | None | 1-6 | False | 18.5 | EARTH_DAMAGE |
| Bombard | 24.0 | 3 | 8.0 | 2 | None | 1-6 | False | 16.0 | EARTH_DAMAGE |
| Sticky Bomb | 19.0 | 2 | 9.5 | 2 | None | 1-6 | True | 12.35 | BEST_ELEMENT_DAMAGE |

### Rogue intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `6.294%`, +100 power `6.294%`, +10 flat damage `1.817%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Extraction | 40.5 | 3 | 13.5 | 2 | None | 1-8 | True | 27.0 | FIRE_STEAL |
| Shot Pellets | 46.0 | 4 | 11.5 | 2 | None | 0-5 | False | 23.0 | FIRE_STEAL |
| Weigh Down | 32.0 | 3 | 10.67 | 2 | None | 1-5 | True | 21.333 | FIRE_DAMAGE |
| Pulsar | 24.0 | 3 | 8.0 | 2 | None | 1-6 | False | 16.0 | FIRE_DAMAGE |
| Sticky Bomb | 19.0 | 2 | 9.5 | 2 | None | 1-6 | True | 12.35 | BEST_ELEMENT_DAMAGE |

### Rogue chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `6.006%`, +100 power `6.006%`, +10 flat damage `2.192%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Stolen Goods | 29.0 | 3 | 9.67 | 3 | None | 1-5 | False | 29.0 | WATER_DAMAGE |
| Shrapnel | 18.0 | 2 | 9.0 | 3 | None | 1-5 | False | 27.0 | WATER_DAMAGE |
| Blunderbuss | 37.0 | 4 | 9.25 | 2 | None | 1-4 | False | 18.5 | WATER_DAMAGE |
| Deception | 35.0 | 4 | 8.75 | 2 | None | 0-1 | False | 17.5 | WATER_DAMAGE |
| Sticky Bomb | 19.0 | 2 | 9.5 | 2 | None | 1-6 | True | 12.35 | BEST_ELEMENT_DAMAGE |

### Rogue agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `6.087%`, +100 power `6.087%`, +10 flat damage `2.087%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Cadence | 27.0 | 3 | 9.0 | 3 | None | 1-7 | True | 27.0 | AIR_DAMAGE |
| Machine Gun | 36.0 | 4 | 9.0 | 3 | None | 1-6 | True | 27.0 | AIR_DAMAGE |
| Boomerang Daggers | 34.0 | 4 | 8.5 | 2 | None | 1-7 | False | 17.0 | AIR_DAMAGE |
| Carbine | 24.0 | 3 | 8.0 | 2 | None | 1-8 | False | 16.0 | AIR_DAMAGE |
| Sticky Bomb | 19.0 | 2 | 9.5 | 2 | None | 1-6 | True | 12.35 | BEST_ELEMENT_DAMAGE |

### Sacrier strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `7.473%`, +100 power `7.473%`, +10 flat damage `0.285%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Decimation | 334.0 | 3 | 111.33 | 3 | None | 1-1 | False | 334.0 | EARTH_DAMAGE |
| Gash | 49.0 | 4 | 12.25 | 2 | None | 1-1 | False | 24.5 | EARTH_DAMAGE |
| Torture | 24.0 | 3 | 8.0 | 3 | None | 1-1 | False | 24.0 | EARTH_STEAL |
| Ravages | 30.0 | 3 | 10.0 | 2 | None | 1-6 | False | 20.0 | EARTH_DAMAGE |
| Blood Bath | 29.0 | 4 | 7.25 | 2 | None | 0-0 | False | 14.5 | EARTH_STEAL |
| Influx | 13.5 | 2 | 6.75 | 2 | None | 0-0 | False | 13.5 | EARTH_DAMAGE |
| Bloodthirsty Madness | 26.0 | 3 | 8.67 | None | 2 | 1-3 | False | 7.323 | BEST_ELEMENT_STEAL |

### Sacrier intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `7.438%`, +100 power `7.438%`, +10 flat damage `0.331%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Excruciating Pain | 315.5 | 3 | 105.17 | 2 | None | 0-5 | False | 210.333 | FIRE_DAMAGE |
| Hostility | 16.5 | 2 | 8.25 | 3 | None | 1-4 | False | 24.75 | FIRE_DAMAGE |
| Absorption | 22.0 | 3 | 7.33 | 3 | None | 1-6 | False | 22.0 | FIRE_STEAL |
| Immolation | 42.0 | 4 | 10.5 | 2 | None | 0-4 | False | 21.0 | FIRE_DAMAGE |
| Slaughter | 28.0 | 4 | 7.0 | 2 | None | 0-4 | False | 14.0 | FIRE_STEAL |
| Bloodthirsty Madness | 26.0 | 3 | 8.67 | None | 2 | 1-3 | False | 7.323 | BEST_ELEMENT_STEAL |
| Aversion | 13.5 | 2 | 6.75 | 1 | None | 2-5 | False | 6.75 | FIRE_DAMAGE |

### Sacrier chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `7.448%`, +100 power `7.448%`, +10 flat damage `0.318%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Nervousness | 325.0 | 3 | 108.33 | 2 | None | 0-4 | False | 216.667 | WATER_DAMAGE |
| Stase | 22.0 | 3 | 7.33 | 3 | None | 1-5 | False | 22.0 | WATER_STEAL |
| Clobbering | 41.0 | 4 | 10.25 | 2 | None | 0-5 | False | 20.5 | WATER_DAMAGE |
| Projection | 15.5 | 2 | 7.75 | 2 | None | 1-2 | False | 15.5 | WATER_DAMAGE |
| Condensation | 23.0 | 3 | 7.67 | 2 | None | 0-5 | False | 15.333 | WATER_DAMAGE |
| Dissolution | 27.0 | 4 | 6.75 | 2 | None | 0-5 | False | 13.5 | WATER_STEAL |
| Bloodthirsty Madness | 26.0 | 3 | 8.67 | None | 2 | 1-3 | False | 7.323 | BEST_ELEMENT_STEAL |

### Sacrier agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `7.493%`, +100 power `7.493%`, +10 flat damage `0.26%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Fury | 360.5 | 3 | 120.17 | 3 | None | 1-1 | False | 360.5 | AIR_DAMAGE |
| Hemorrhage | 24.0 | 3 | 8.0 | 3 | None | 1-1 | False | 24.0 | AIR_STEAL |
| Assault | 15.5 | 2 | 7.75 | 3 | None | 1-2 | False | 23.25 | AIR_DAMAGE |
| Carnage | 46.0 | 4 | 11.5 | 2 | None | 1-1 | False | 23.0 | AIR_DAMAGE |
| Desolation | 28.0 | 4 | 7.0 | 2 | None | 1-3 | False | 14.0 | AIR_STEAL |
| Light Speed | 24.0 | 3 | 8.0 | 1 | None | 1-5 | False | 8.0 | AIR_DAMAGE |
| Bloodthirsty Madness | 26.0 | 3 | 8.67 | None | 2 | 1-3 | False | 7.323 | BEST_ELEMENT_STEAL |

### Sadida strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `7.472%`, +100 power `7.472%`, +10 flat damage `0.286%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Force of Nature | 390.0 | 5 | 78.0 | 2 | None | 1-5 | False | 156.0 | EARTH_DAMAGE |
| Bramble | 25.5 | 3 | 8.5 | 3 | None | 1-8 | True | 25.5 | EARTH_DAMAGE |
| Aggressive Bramble | 47.5 | 4 | 11.88 | 2 | None | 1-6 | True | 23.75 | EARTH_DAMAGE |
| Poisoned Undergrowth | 26.0 | 3 | 8.67 | 2 | None | 1-8 | True | 17.333 | EARTH_DAMAGE |
| Earthquake | 36.0 | 3 | 12.0 | 1 | None | 0-0 | False | 12.0 | EARTH_DAMAGE |
| Manifold Bramble | 28.5 | 3 | 9.5 | 1 | None | 0-7 | False | 9.5 | EARTH_DAMAGE |

### Sadida intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `6.077%`, +100 power `6.077%`, +10 flat damage `2.1%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Plaguing Bramble | 24.5 | 2 | 12.25 | 3 | None | 1-63 | False | 36.75 | FIRE_DAMAGE |
| Bush Fire | 28.0 | 3 | 9.33 | 3 | None | 1-7 | True | 28.0 | FIRE_DAMAGE, WATER_DAMAGE |
| Prickly Embers | 25.5 | 3 | 8.5 | 3 | None | 1-7 | True | 25.5 | FIRE_DAMAGE |
| Voodoo Curse | 48.0 | 3 | 16.0 | None | 3 | 1-5 | False | 20.8 | FIRE_DAMAGE, WATER_DAMAGE |
| Wild Grass | 27.5 | 3 | 9.17 | 1 | None | 0-8 | True | 9.167 | FIRE_DAMAGE |
| Paralysing Poison | 22.0 | 3 | 7.33 | 1 | None | 1-8 | True | 7.333 | FIRE_DAMAGE |
| Paralysing Poison | 21.0 | 3 | 7.0 | 1 | None | 1-8 | True | 7.0 | FIRE_DAMAGE |

### Sadida chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `6.713%`, +100 power `6.713%`, +10 flat damage `1.273%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Bane | 57.0 | 3 | 19.0 | 3 | None | 1-2 | False | 57.0 | WATER_DAMAGE, WATER_STEAL |
| Mangrove | 54.0 | 3 | 18.0 | 3 | None | 1-8 | True | 54.0 | WATER_DAMAGE |
| Dolly Sacrifice | 84.5 | 4 | 21.12 | 2 | None | 1-8 | False | 42.25 | WATER_DAMAGE, WATER_STEAL |
| Bush Fire | 28.0 | 3 | 9.33 | 3 | None | 1-7 | True | 28.0 | FIRE_DAMAGE, WATER_DAMAGE |
| Tear | 23.5 | 3 | 7.83 | 3 | None | 1-8 | True | 23.5 | WATER_DAMAGE |
| Voodoo Curse | 48.0 | 3 | 16.0 | None | 3 | 1-5 | False | 20.8 | FIRE_DAMAGE, WATER_DAMAGE |
| Rise of Sap | 30.0 | 4 | 7.5 | 1 | None | 1-6 | False | 7.5 | WATER_STEAL |

### Sadida agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `6.487%`, +100 power `6.487%`, +10 flat damage `1.567%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Inoculation | 71.0 | 3 | 23.67 | 1 | None | 1-8 | False | 23.667 | AIR_DAMAGE |
| Paralysing Bramble | 21.5 | 3 | 7.17 | 3 | None | 1-7 | True | 21.5 | AIR_DAMAGE |
| Contagion | 41.0 | 4 | 10.25 | 2 | None | 1-7 | True | 20.5 | AIR_DAMAGE |
| Shake | 33.5 | 3 | 11.17 | 1 | None | 0-0 | False | 11.167 | AIR_DAMAGE |
| Contamination | 12.0 | 2 | 6.0 | 1 | None | 0-0 | False | 6.0 | AIR_DAMAGE |

### Sram strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `7.651%`, +100 power `7.651%`, +10 flat damage `0.053%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Malevolent Trap | 1950.0 | 3 | 650.0 | 2 | None | 1-6 | True | 1300.0 | EARTH_DAMAGE |
| Pitfall | 312.0 | 4 | 78.0 | 3 | None | 1-4 | False | 234.0 | EARTH_DAMAGE |
| Lethal Attack | 102.5 | 4 | 25.62 | 3 | None | 1-2 | False | 76.875 | EARTH_DAMAGE |
| Lethal Trap | 92.5 | 3 | 30.83 | 2 | None | 1-4 | True | 61.667 | EARTH_DAMAGE |
| Plotter | 300.0 | 3 | 100.0 | None | 5 | 1-3 | False | 58.5 | BEST_ELEMENT_DAMAGE |
| Shakedown | 32.5 | 3 | 10.83 | 3 | None | 1-3 | False | 32.5 | EARTH_DAMAGE |
| Perfidy | 58.0 | 6 | 9.67 | 3 | None | 1-1 | False | 29.0 | EARTH_DAMAGE |
| Gangsterdom | 27.5 | 3 | 9.17 | 3 | None | 1-6 | True | 27.5 | EARTH_DAMAGE |

### Sram intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `7.185%`, +100 power `7.185%`, +10 flat damage `0.66%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Plotter | 300.0 | 3 | 100.0 | None | 5 | 1-3 | False | 58.5 | BEST_ELEMENT_DAMAGE |
| Fragmentation Trap | 132.0 | 4 | 33.0 | 1 | None | 1-6 | True | 33.0 | FIRE_DAMAGE |
| Deviousness | 27.5 | 3 | 9.17 | 3 | None | 1-6 | False | 27.5 | FIRE_DAMAGE |
| Cut-Throat | 36.0 | 4 | 9.0 | 3 | None | 1-7 | False | 27.0 | FIRE_DAMAGE |
| Perquisition | 25.5 | 3 | 8.5 | 3 | None | 1-6 | False | 25.5 | FIRE_DAMAGE |
| Break-In | 16.0 | 2 | 8.0 | 3 | None | 1-6 | False | 24.0 | FIRE_DAMAGE |
| Furrow | 38.0 | 4 | 9.5 | 2 | None | 0-3 | False | 19.0 | FIRE_DAMAGE |
| Drift Trap | 18.0 | 2 | 9.0 | 1 | None | 1-6 | True | 9.0 | FIRE_DAMAGE |

### Sram chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `7.194%`, +100 power `7.194%`, +10 flat damage `0.647%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Plotter | 300.0 | 3 | 100.0 | None | 5 | 1-3 | False | 58.5 | BEST_ELEMENT_DAMAGE |
| Waylaying | 23.5 | 3 | 7.83 | 3 | None | 0-6 | True | 23.5 | WATER_STEAL |
| Miry Trap | 35.0 | 3 | 11.67 | 2 | None | 1-6 | True | 23.333 | WATER_DAMAGE |
| Raiding | 31.5 | 3 | 10.5 | 2 | None | 1-2 | False | 21.0 | WATER_STEAL |
| Larceny | 40.0 | 4 | 10.0 | 2 | None | 0-4 | False | 20.0 | WATER_DAMAGE |
| Cruelty | 23.5 | 3 | 7.83 | 2 | None | 1-6 | True | 15.667 | WATER_DAMAGE |
| Calamity | 42.0 | 4 | 10.5 | 1 | None | 1-6 | True | 10.5 | WATER_DAMAGE |
| Jinx | 36.0 | 4 | 9.0 | 1 | None | 1-4 | False | 9.0 | WATER_STEAL |

### Sram agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `7.27%`, +100 power `7.27%`, +10 flat damage `0.55%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Toxines | 150.0 | 3 | 50.0 | None | 2 | 1-7 | True | 65.0 | AIR_DAMAGE |
| Plotter | 300.0 | 3 | 100.0 | None | 5 | 1-3 | False | 58.5 | BEST_ELEMENT_DAMAGE |
| Con | 30.5 | 3 | 10.17 | 3 | None | 1-6 | False | 30.5 | AIR_DAMAGE |
| Epidemic | 38.0 | 4 | 9.5 | 2 | None | 1-5 | False | 19.0 | AIR_DAMAGE |
| Arsenic | 17.0 | 3 | 5.67 | 3 | None | 1-6 | True | 17.0 | AIR_DAMAGE |
| Mistake | 34.0 | 4 | 8.5 | 2 | None | 0-5 | False | 17.0 | AIR_DAMAGE |
| Repelling Trap | 20.0 | 3 | 6.67 | 1 | None | 1-7 | True | 6.667 | AIR_DAMAGE |
| Toxic Injection | 30.0 | 5 | 6.0 | None | 5 | 1-5 | False | 5.4 | AIR_DAMAGE |

### Xelor strength - medium

Primary: `Strength`. Elemental damage stats: Earth Damage, Neutral Damage.

Sensitivity: +100 primary `7.351%`, +100 power `7.351%`, +10 flat damage `0.444%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Knell | 320.0 | 3 | 106.67 | None | 2 | 0-3 | False | 138.667 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Dark Ray | 105.0 | 5 | 21.0 | 3 | None | 1-6 | False | 63.0 | EARTH_DAMAGE |
| Shadowy Beam | 21.0 | 2 | 10.5 | 3 | None | 1-5 | True | 31.5 | EARTH_DAMAGE |
| Souvenir | 30.0 | 3 | 10.0 | 3 | None | 1-6 | True | 30.0 | EARTH_DAMAGE |
| Xelor's Punch | 25.0 | 3 | 8.33 | 3 | None | 1-3 | False | 25.0 | EARTH_DAMAGE |
| Loss of Motivation | 24.5 | 3 | 8.17 | 3 | None | 1-5 | False | 24.5 | EARTH_DAMAGE |
| Gear | 29.0 | 4 | 7.25 | 2 | None | 1-6 | False | 14.5 | EARTH_DAMAGE |

### Xelor intelligence - medium

Primary: `Intelligence`. Elemental damage stats: Fire Damage.

Sensitivity: +100 primary `7.388%`, +100 power `7.388%`, +10 flat damage `0.395%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Knell | 320.0 | 3 | 106.67 | None | 2 | 0-3 | False | 138.667 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Temporal Dust | 67.0 | 4 | 16.75 | 2 | None | 0-6 | True | 33.5 | FIRE_DAMAGE |
| Temporal Suspension | 27.0 | 3 | 9.0 | 3 | None | 1-6 | True | 27.0 | FIRE_DAMAGE |
| Xelor's Sandglass | 24.5 | 3 | 8.17 | 3 | None | 1-8 | True | 24.5 | FIRE_DAMAGE |
| Hand | 21.0 | 3 | 7.0 | 3 | None | 1-7 | True | 21.0 | FIRE_DAMAGE |
| Disruption | 10.0 | 2 | 5.0 | 3 | None | 1-2 | False | 15.0 | FIRE_DAMAGE |

### Xelor chance - medium

Primary: `Chance`. Elemental damage stats: Water Damage.

Sensitivity: +100 primary `7.384%`, +100 power `7.384%`, +10 flat damage `0.4%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Knell | 320.0 | 3 | 106.67 | None | 2 | 0-3 | False | 138.667 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Time Theft | 32.0 | 4 | 8.0 | 3 | None | 1-5 | False | 24.0 | WATER_DAMAGE |
| Clock | 37.5 | 5 | 7.5 | 3 | None | 1-6 | False | 22.5 | WATER_STEAL |
| Petrification | 36.0 | 5 | 7.2 | 3 | None | 1-7 | True | 21.6 | WATER_DAMAGE |
| Cog | 18.5 | 3 | 6.17 | 3 | None | 1-7 | True | 18.5 | WATER_DAMAGE |
| Slow Down | 12.0 | 2 | 6.0 | 4 | None | 1-6 | True | 18.0 | WATER_DAMAGE |
| Water Clock | 32.0 | 4 | 8.0 | 2 | None | 1-3 | False | 16.0 | WATER_DAMAGE |

### Xelor agility - medium

Primary: `Agility`. Elemental damage stats: Air Damage.

Sensitivity: +100 primary `7.365%`, +100 power `7.365%`, +10 flat damage `0.426%`, +10 spell damage `10.0%`.

| Spell | Avg base | AP | Dmg/AP | Casts | Cooldown | Range | Mod | Weight | Effects |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |
| Knell | 320.0 | 3 | 106.67 | None | 2 | 0-3 | False | 138.667 | AIR_DAMAGE, EARTH_DAMAGE, WATER_DAMAGE, FIRE_DAMAGE |
| Drying Up | 80.0 | 4 | 20.0 | 3 | None | 1-6 | False | 60.0 | AIR_DAMAGE |
| Shrivelling | 60.0 | 3 | 20.0 | 3 | None | 1-6 | True | 60.0 | AIR_DAMAGE |
| Pendulum | 40.0 | 4 | 10.0 | 2 | None | 1-4 | False | 20.0 | AIR_DAMAGE |
| Frostbite | 12.0 | 2 | 6.0 | 3 | None | 1-5 | True | 18.0 | AIR_DAMAGE |
| Temporal Distortion | 36.0 | 4 | 9.0 | 2 | None | 0-0 | False | 18.0 | AIR_DAMAGE |
