/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import StatTable from 'components/common/StatTable';
import { Stat } from '__generated__/globalTypes';
import { getStatsFromCustomSet } from 'common/utils';
import { mq } from 'common/constants';

interface IProps {
  customSet: customSet | null;
}

const margin = { marginBottom: 12, [mq[4]]: { marginBottom: 20 } };

const ClassicRightColumnStats: React.FC<IProps> = ({ customSet }) => {
  const statsFromCustomSet = React.useMemo(
    () => getStatsFromCustomSet(customSet),
    [customSet],
  );

  return (
    <div
      css={{
        width: 260,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 12,
        [mq[4]]: { marginLeft: 20 },
      }}
    >
      <StatTable
        group={[
          'HP',
          Stat.VITALITY,
          Stat.WISDOM,
          Stat.AGILITY,
          Stat.CHANCE,
          Stat.STRENGTH,
          Stat.INTELLIGENCE,
          Stat.POWER,
        ]}
        statsFromCustomSet={statsFromCustomSet}
        customSet={customSet}
        css={margin}
      />
      <StatTable
        group={[
          Stat.CRITICAL_DAMAGE,
          Stat.PUSHBACK_DAMAGE,
          Stat.PCT_MELEE_DAMAGE,
          Stat.PCT_RANGED_DAMAGE,
          Stat.PCT_WEAPON_DAMAGE,
          Stat.PCT_SPELL_DAMAGE,
        ]}
        statsFromCustomSet={statsFromCustomSet}
        customSet={customSet}
        css={margin}
      />
      <StatTable
        group={[
          Stat.CRITICAL_RES,
          Stat.PUSHBACK_RES,
          Stat.PCT_MELEE_RES,
          Stat.PCT_RANGED_RES,
        ]}
        statsFromCustomSet={statsFromCustomSet}
        customSet={customSet}
        css={margin}
      />
      <StatTable
        group={[Stat.TRAP_DAMAGE, Stat.TRAP_POWER, Stat.REFLECT, Stat.PODS]}
        statsFromCustomSet={statsFromCustomSet}
        customSet={customSet}
        css={margin}
      />
    </div>
  );
};

export default ClassicRightColumnStats;
