/** @jsx jsx */

import React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import { useTranslation } from 'i18n';
import { List } from 'antd';
import { useTheme } from 'emotion-theming';

import { StatsFromCustomSet, Theme } from 'common/types';
import { statCalculators } from 'common/utils';
import { Stat } from '__generated__/globalTypes';
import { statIcons } from 'common/constants';
import { CustomSet } from 'common/type-aliases';

interface Props {
  group: Array<Stat | string>;
  statsFromCustomSet: StatsFromCustomSet | null;
  customSet?: CustomSet | null;
  className?: string;
}

const StatTable: React.FC<Props> = ({
  group,
  statsFromCustomSet,
  customSet,
  className,
}) => {
  const { t } = useTranslation('stat');
  const theme = useTheme<Theme>();
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
            let statValue = 0;
            if (statCalculators[item]) {
              statValue = statCalculators[item](statsFromCustomSet, customSet);
            } else if (statsFromCustomSet) {
              statValue = statsFromCustomSet[item] || 0;
            }
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
                      src={statIcons[item]}
                      css={{ height: '80%', width: '80%' }}
                      alt={item}
                    />
                  </div>
                  <div css={{ fontSize: '0.75rem' }}>
                    {t([`STAT_TABLE.${item}`, item])}
                  </div>
                </div>
                <div css={{ fontSize: '0.75rem' }}>{statValue}</div>
              </List.Item>
            );
          }}
        />
      )}
    </ClassNames>
  );
};

export default React.memo(StatTable);
