/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useTranslation } from 'i18n';

import List from 'antd/lib/list';
import { StatGroup, StatsFromCustomSet } from 'common/types';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { mq } from 'common/constants';

interface IStatTable {
  group: StatGroup;
  statsFromCustomSet: StatsFromCustomSet | null;
  customSet?: customSet | null;
}

const StatTable: React.FC<IStatTable> = ({
  group,
  statsFromCustomSet,
  customSet,
}) => {
  const { t } = useTranslation('stat');
  return (
    <List
      css={{
        background: 'white',
        [':not(:first-of-type)']: {
          marginTop: 12,
          [mq[4]]: {
            marginTop: 20,
          },
        },
        borderRadius: 4,
      }}
      itemLayout="horizontal"
      size="small"
      bordered
      dataSource={group}
      rowKey={item => item.stat}
      renderItem={item => (
        <List.Item
          css={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div css={{ fontSize: '0.75rem' }}>{t(item.stat)}</div>
          <div css={{ fontSize: '0.75rem' }}>
            {item.customCalculateValue
              ? item.customCalculateValue(statsFromCustomSet, customSet)
              : statsFromCustomSet
              ? statsFromCustomSet[item.stat] || 0
              : 0}
          </div>
        </List.Item>
      )}
    />
  );
};

export default StatTable;
