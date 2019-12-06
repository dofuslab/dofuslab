import {
  Equipment,
  BasicStat,
  EquipmentTypeId,
  PrimaryStat,
  DamageStat,
  SecondaryStat,
  ResistanceStat
} from './types';

export const HATS: Equipment[] = [
  {
    name: "Bram Worldbeard's Crown",
    typeId: EquipmentTypeId.Hat,
    setId: null,
    level: 200,
    stats: [
      { stat: BasicStat.Vitality, value: 400 },
      { stat: PrimaryStat.Strength, value: 80 },
      { stat: PrimaryStat.Intelligence, value: 80 },
      { stat: DamageStat.NeutralDamage, value: 10 },
      { stat: DamageStat.EarthDamage, value: 10 },
      { stat: DamageStat.FireDamage, value: 10 },
      { stat: DamageStat.WaterDamage, value: 10 },
      { stat: DamageStat.AirDamage, value: 10 },
      { stat: SecondaryStat.MPResistance, value: -30 },
      { stat: DamageStat.PctWeaponDamage, value: 10 },
      { stat: DamageStat.PctSpellDamage, value: -10 },
      {
        customStats: [
          'Whenever the bearer suffers an AP or MP removal, they gain 50 Power for 1 turn, stackable 10 times'
        ]
      }
    ],
    imgUrl: 'https://i.imgur.com/Xm9NqwG.png'
  },
  {
    name: "Ganymede's Diadem",
    typeId: EquipmentTypeId.Hat,
    setId: null,
    level: 200,
    stats: [
      { stat: BasicStat.Vitality, value: 350 },
      { stat: DamageStat.Power, value: 120 },
      { stat: SecondaryStat.CriticalHits, value: -10 },
      { stat: BasicStat.AP, value: 1 },
      { stat: SecondaryStat.Dodge, value: 20 },
      { stat: ResistanceStat.PctNeutralResistance, value: -5 },
      { stat: ResistanceStat.PctEarthResistance, value: -5 },
      { stat: ResistanceStat.PctFireResistance, value: -5 },
      { stat: ResistanceStat.PctWaterResistance, value: -5 },
      { stat: ResistanceStat.PctAirResistance, value: -5 },
      {
        customStats: [
          'The bearer gains 2 AP on even turns and loses 1 AP on odd turns'
        ]
      }
    ],
    conditions: [{ stat: BasicStat.AP, greaterThan: false, threshold: 12 }]
  }
];

export const EQUIPMENT_LISTS: { [key in EquipmentTypeId]?: Equipment[] } = {
  [EquipmentTypeId.Hat]: HATS
};
