/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import StatTable from 'components/common/StatTable';
import { Stat } from '__generated__/globalTypes';
import { getStatsFromCustomSet } from 'common/utils';
import { mq } from 'common/constants';
import StatEditor from 'components/common/StatEditor';

interface IProps {
  customSet: customSet | null;
}

const margin = { marginBottom: 12, [mq[4]]: { marginBottom: 20 } };

const ClassicLeftColumnStats: React.FC<IProps> = ({ customSet }) => {
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
        marginRight: 12,
        [mq[4]]: { marginRight: 20 },
      }}
    >
      <StatTable
        group={[
          'HP',
          Stat.AP,
          Stat.MP,
          Stat.RANGE,
          Stat.INITIATIVE,
          Stat.CRITICAL,
          Stat.SUMMON,
          Stat.HEALS,
          Stat.PROSPECTING,
        ]}
        statsFromCustomSet={statsFromCustomSet}
        customSet={customSet}
        css={margin}
      />
      <StatEditor customSet={customSet} css={margin} />
      <StatTable
        group={[Stat.DODGE, Stat.LOCK]}
        statsFromCustomSet={statsFromCustomSet}
        customSet={customSet}
        css={margin}
      />
      <StatTable
        group={[
          Stat.AP_PARRY,
          Stat.AP_REDUCTION,
          Stat.MP_PARRY,
          Stat.MP_REDUCTION,
        ]}
        statsFromCustomSet={statsFromCustomSet}
        customSet={customSet}
        css={margin}
      />
    </div>
  );
};

export default ClassicLeftColumnStats;
