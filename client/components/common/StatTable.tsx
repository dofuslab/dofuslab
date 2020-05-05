/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useTranslation } from 'i18n';
import { List } from 'antd';
import { useTheme } from 'emotion-theming';

import { Theme, StatGroup, StatsFromCustomSet } from 'common/types';

import { statCalculators } from 'common/utils';
import { CustomSet } from 'common/type-aliases';

interface Props {
  group: StatGroup;
  statsFromCustomSet: StatsFromCustomSet | null;
  customSet?: CustomSet | null;
}

const StatTable: React.FC<Props> = ({
  group,
  statsFromCustomSet,
  customSet,
}) => {
  const { t } = useTranslation('stat');
  const theme = useTheme<Theme>();
  return (
    <List
      css={{
        background: theme.layer?.background,
        border: theme.border?.default,
        borderRadius: 4,
      }}
      itemLayout="horizontal"
      size="small"
      bordered
      dataSource={group}
      rowKey={(item) => item.stat}
      renderItem={(item) => {
        let statValue = 0;
        if (statCalculators[item.stat]) {
          statValue = statCalculators[item.stat](statsFromCustomSet, customSet);
        } else if (statsFromCustomSet) {
          statValue = statsFromCustomSet[item.stat] || 0;
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
                  background: item.icon
                    ? 'url(https://dofus-lab.s3.us-east-2.amazonaws.com/sprite.png)'
                    : 'none',
                  height: 22,
                  width: 22,
                  backgroundPositionX: item.icon?.backgroundPositionX,
                  backgroundPositionY: item.icon?.backgroundPositionY
                    ? item.icon.backgroundPositionY + 1
                    : undefined,
                  marginRight: 6,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {item.svgIcon && (
                  <img
                    src={item.svgIcon}
                    css={{ height: '80%', width: '80%' }}
                    alt={item.stat}
                  />
                )}
              </div>
              <div css={{ fontSize: '0.75rem' }}>
                {t([`STAT_TABLE.${item.stat}`, item.stat])}
              </div>
            </div>
            <div css={{ fontSize: '0.75rem' }}>{statValue}</div>
          </List.Item>
        );
      }}
    />
  );
};

export default React.memo(StatTable);
