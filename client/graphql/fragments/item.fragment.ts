import { graphql } from '../__generated__/gql';

export default graphql(/* GraphQL */ `
  fragment item on Item {
    id
    name
    level
    imageUrl
    stats {
      id
      order
      maxValue
      stat
      customStat
    }
    weaponStats {
      id
      apCost
      usesPerTurn
      minRange
      maxRange
      baseCritChance
      critBonusDamage
      weaponEffects {
        id
        minDamage
        maxDamage
        effectType
      }
    }
    conditions
    itemType {
      id
      name
      enName
      eligibleItemSlots {
        id
        enName
        order
      }
    }
    set {
      id
      name
      bonuses {
        id
        numItems
        stat
        value
        customStat
      }
    }
    buffs {
      ...buff
    }
  }
`);