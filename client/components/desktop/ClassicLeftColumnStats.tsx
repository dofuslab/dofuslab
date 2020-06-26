/** @jsx jsx */

import * as React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import StatTable from 'components/common/StatTable';
import { Stat } from '__generated__/globalTypes';
import { getStatsFromCustomSet } from 'common/utils';
import { mq } from 'common/constants';
import StatEditor from 'components/common/StatEditor';
import { CustomSet } from 'common/type-aliases';
import { StatsFromAppliedBuffs } from 'common/types';

interface Props {
  customSet: CustomSet | null;
  statsFromAppliedBuffs: StatsFromAppliedBuffs;
  openBuffModal: () => void;
}

const margin = { marginBottom: 12, [mq[4]]: { marginBottom: 20 } };

const ClassicLeftColumnStats: React.FC<Props> = ({
  customSet,
  statsFromAppliedBuffs,
  openBuffModal,
}) => {
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
          Stat.PODS,
        ]}
        statsFromCustomSet={statsFromCustomSet}
        customSet={customSet}
        css={margin}
        statsFromAppliedBuffs={statsFromAppliedBuffs}
        openBuffModal={openBuffModal}
      />
      <ClassNames>
        {({ css, cx }) => (
          <StatEditor
            key={customSet?.stats.id}
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
        statsFromAppliedBuffs={statsFromAppliedBuffs}
        openBuffModal={openBuffModal}
      />
      <StatTable
        group={[
          Stat.AP_PARRY,
          Stat.AP_REDUCTION,
          Stat.MP_PARRY,
          Stat.MP_REDUCTION,
        ]}
        statsFromCustomSet={statsFromCustomSet}
        statsFromAppliedBuffs={statsFromAppliedBuffs}
        customSet={customSet}
        css={margin}
        openBuffModal={openBuffModal}
      />
    </div>
  );
};

export default ClassicLeftColumnStats;
