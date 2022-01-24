/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import StatTable from 'components/common/StatTable';
import { Stat } from '__generated__/globalTypes';
import { mq } from 'common/constants';

interface Props {
  openBuffModal: () => void;
}

const margin = { marginBottom: 12, [mq[4]]: { marginBottom: 20 } };

const ClassicRightColumnStats: React.FC<Props> = ({ openBuffModal }) => {
  return (
    <div
      css={{
        flex: '0 2 244px',
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 12,
        [mq[4]]: { marginLeft: 20, flex: '0 2 260px' },
      }}
    >
      <StatTable
        group={[
          Stat.VITALITY,
          Stat.WISDOM,
          Stat.AGILITY,
          Stat.CHANCE,
          Stat.STRENGTH,
          Stat.INTELLIGENCE,
          Stat.POWER,
        ]}
        css={margin}
        openBuffModal={openBuffModal}
      />
      <StatTable
        group={[
          Stat.DAMAGE,
          Stat.NEUTRAL_DAMAGE,
          Stat.EARTH_DAMAGE,
          Stat.FIRE_DAMAGE,
          Stat.WATER_DAMAGE,
          Stat.AIR_DAMAGE,
        ]}
        css={margin}
        openBuffModal={openBuffModal}
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
        css={margin}
        openBuffModal={openBuffModal}
      />
      <StatTable
        group={[Stat.TRAP_DAMAGE, Stat.TRAP_POWER, Stat.REFLECT]}
        css={margin}
        openBuffModal={openBuffModal}
      />
    </div>
  );
};

export default ClassicRightColumnStats;
