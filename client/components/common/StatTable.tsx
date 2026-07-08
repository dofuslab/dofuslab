/** @jsxImportSource @emotion/react */

import { useContext, useMemo, memo } from 'react';
import { ClassNames, useTheme } from '@emotion/react';
import { useTranslation } from 'next-i18next';
import { List } from 'antd';

import { StatsFromCustomSet } from 'common/types';
import { statCalculators, CustomSetContext, getImageUrl } from 'common/utils';
import { Stat } from '__generated__/globalTypes';
import { statIcons } from 'common/constants';
import { CustomSet } from 'common/type-aliases';
import { green5 } from 'common/mixins';

const getStatValue = (
  item: string,
  statsFromCustomSet: StatsFromCustomSet | null,
  customSet?: CustomSet | null,
) => {
  let statValue = 0;
  if (statCalculators[item]) {
    statValue = statCalculators[item](statsFromCustomSet, customSet);
  } else if (statsFromCustomSet) {
    statValue = statsFromCustomSet[item] || 0;
  }
  return statValue;
};

interface Props {
  group: Array<Stat | string>;
  className?: string;
  openBuffModal: () => void;
}

const StatTable = ({ group, className, openBuffModal }: Props) => {
  const { customSet, statsFromCustomSet, statsFromAppliedBuffs } =
    useContext(CustomSetContext);
  const { t } = useTranslation('stat');
  const theme = useTheme();

  const statsFromCustomSetWithBuffs = useMemo(
    () =>
      Object.entries(statsFromAppliedBuffs).reduce(
        (totalStats, [k, v]) => {
          return {
            ...totalStats,
            [k]: (totalStats[k] || 0) + v,
          } as StatsFromCustomSet;
        },
        statsFromCustomSet || ({} as StatsFromCustomSet),
      ),
    [statsFromAppliedBuffs, statsFromCustomSet],
  );

  return (
    <ClassNames>
      {({ css, cx }) => (
        <List
          css={cx(
            css({
              background: theme.layer?.background,
              border: theme.border?.default,
              borderRadius: 4,
            }),
            className,
          )}
          itemLayout="horizontal"
          size="small"
          bordered
          dataSource={group}
          rowKey={(item) => item}
          renderItem={(item) => {
            const statValueWithBuffs = getStatValue(
              item,
              statsFromCustomSetWithBuffs,
              customSet,
            );
            const statValue = getStatValue(item, statsFromCustomSet, customSet);
            return (
              <List.Item
                css={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  '&.ant-list-item': {
                    padding: '6px 16px 6px 8px !important',
                  },
                  alignItems: 'center',
                }}
              >
                <div css={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    css={{
                      height: 22,
                      width: 22,
                      marginRight: 6,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={getImageUrl(statIcons[item])}
                      css={{ height: '80%', width: '80%' }}
                      alt={item}
                    />
                  </div>
                  <div css={{ fontSize: '0.75rem' }}>
                    {t([`STAT_TABLE.${item}`, item])}
                  </div>
                </div>

                <div
                  css={{
                    fontSize: '0.75rem',
                    color: statValueWithBuffs > statValue ? green5 : 'inherit',
                  }}
                >
                  {statValueWithBuffs === statValue ? (
                    <span>{statValueWithBuffs}</span>
                  ) : (
                    <a onClick={openBuffModal}>{statValueWithBuffs}</a>
                  )}
                </div>
              </List.Item>
            );
          }}
        />
      )}
    </ClassNames>
  );
};

export default memo(StatTable);
