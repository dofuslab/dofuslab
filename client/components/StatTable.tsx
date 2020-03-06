/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useTranslation } from 'react-i18next';

import List from 'antd/lib/list';
import { StatGroup } from 'common/types';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { sumStatsFromCustomSet } from 'common/constants';

interface IStatTable {
  group: StatGroup;
  customSet?: customSet | null;
}

const StatTable: React.FC<IStatTable> = ({ group, customSet }) => {
  const { t } = useTranslation('stat');
  return (
    <List
      css={{ background: 'white' }}
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
            {customSet &&
              (item.customCalculateValue
                ? item.customCalculateValue(customSet)
                : sumStatsFromCustomSet(customSet, item.stat))}
          </div>
        </List.Item>
      )}
    />
  );
};

export default StatTable;
