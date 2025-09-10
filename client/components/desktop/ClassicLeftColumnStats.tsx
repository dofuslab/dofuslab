/** @jsxImportSource @emotion/react */

import * as React from 'react';

import { ClassNames } from '@emotion/react';
import StatTable from 'components/common/StatTable';
import { Stat } from '__generated__/globalTypes';
import { CustomSetContext } from 'common/utils';
import { mq } from 'common/constants';
import StatEditor from 'components/common/StatEditor';

interface Props {
  openBuffModal: () => void;
}

const margin = { marginBottom: 12, [mq[4]]: { marginBottom: 20 } };

const ClassicLeftColumnStats = ({ openBuffModal }: Props) => {
  const { customSet } = React.useContext(CustomSetContext);

  return (
    <div
      css={{
        flex: '0 2 244px',
        display: 'flex',
        flexDirection: 'column',
        marginRight: 12,
        [mq[4]]: { marginRight: 20, flex: '0 2 260px' },
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
        css={margin}
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
        css={margin}
        openBuffModal={openBuffModal}
      />
      <StatTable
        group={[
          Stat.AP_PARRY,
          Stat.AP_REDUCTION,
          Stat.MP_PARRY,
          Stat.MP_REDUCTION,
        ]}
        css={margin}
        openBuffModal={openBuffModal}
      />
    </div>
  );
};

export default ClassicLeftColumnStats;
