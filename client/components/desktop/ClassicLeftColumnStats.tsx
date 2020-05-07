/** @jsx jsx */

import * as React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import StatTable from 'components/common/StatTable';
import { Stat } from '__generated__/globalTypes';
import { getStatsFromCustomSet } from 'common/utils';
import { mq } from 'common/constants';
import StatEditor from 'components/common/StatEditor';
import { CustomSet } from 'common/type-aliases';

interface Props {
  customSet: CustomSet | null;
}

const margin = { marginBottom: 12, [mq[4]]: { marginBottom: 20 } };

const ClassicLeftColumnStats: React.FC<Props> = ({ customSet }) => {
  const statsFromCustomSet = React.useMemo(
    () => getStatsFromCustomSet(customSet),
    [customSet],
  );

  return (
    <div
      css={{
        flex: '0 2 260px',
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
      <ClassNames>
        {({ css, cx }) => (
          <StatEditor
            customSet={customSet}
            css={cx(css(margin), css({ [mq[2]]: { marginTop: 16 } }))}
          />
        )}
      </ClassNames>
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
