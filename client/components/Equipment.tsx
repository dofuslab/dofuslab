/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import Card from 'antd/lib/card';

import {
  Equipment as EquipmentType,
  CustomStatLine,
  NormalStatLine,
  StatLine
} from '../common/types';
import { formatStat } from '../common/utils';

interface IEquipment {
  equipment: EquipmentType;
}

function isNormalStatLine(statLine: StatLine): statLine is NormalStatLine {
  return !!(statLine as NormalStatLine).value;
}

function isCustomStatLine(statLine: StatLine): statLine is CustomStatLine {
  return !!(statLine as CustomStatLine).customStats;
}

const Equipment: React.FC<IEquipment> = props => {
  return (
    <Card
      size="small"
      title={props.equipment.name}
      css={{ width: '100%', fontSize: '0.75rem' }}
    >
      <ul css={{ paddingLeft: 15, marginBottom: 0 }}>
        {props.equipment.stats.map((statLine, idx) => {
          if (isCustomStatLine(statLine)) {
            return <li key={`stat-${idx}`}>{statLine.customStats}</li>;
          } else {
            return <li key={`stat-${idx}`}>{formatStat(statLine)}</li>;
          }
        })}
      </ul>
    </Card>
  );
};

export default Equipment;
