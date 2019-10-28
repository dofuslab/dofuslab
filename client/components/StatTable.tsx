/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';

import List from 'antd/lib/list';
import { modifiedStartCase } from '../common/utils';

interface IStatTable {
  name?: string;
  group: any;
}

interface IStat {
  stat: string;
  value?: number;
}

const data = [{ stat: 'Vitality', value: 60 }, { stat: 'AP', value: 12 }];

const StatTable: React.FC<IStatTable> = props => (
  <List
    itemLayout="horizontal"
    size="small"
    bordered
    dataSource={Object.values(props.group).map(v => ({
      stat: modifiedStartCase(v as string)
    }))}
    rowKey={(item: IStat) => item.stat}
    renderItem={(item: IStat) => (
      <List.Item>
        <List.Item.Meta title={item.stat} />
        <div>{item.value}</div>
      </List.Item>
    )}
  />
);

export default StatTable;
