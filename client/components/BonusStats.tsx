/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { EllipsisOutlined } from '@ant-design/icons';
import Popover from 'antd/lib/popover';
import { useTranslation } from 'react-i18next';

import { item_set } from 'graphql/fragments/__generated__/item';
import { itemBox } from 'common/mixins';

interface IProps {
  setBonuses: {
    [key: string]: {
      count: number;
      set: item_set;
    };
  };
}

const BonusStats: React.FC<IProps> = ({ setBonuses }) => {
  const { t } = useTranslation('stat');
  return (
    <Popover
      content={
        <div css={{ fontSize: '0.75rem' }}>
          {Object.values(setBonuses).map(
            ({ count, set: { id, name, bonuses } }) => {
              const filteredBonuses = bonuses.filter(
                bonus => bonus.numItems === count,
              );
              return (
                <div key={id}>
                  <div css={{ fontWeight: 500 }}>
                    <strong>{name}</strong>
                  </div>
                  <div>{count} items</div>
                  <ul css={{ paddingInlineStart: '16px' }}>
                    {filteredBonuses.map(bonus => (
                      <li key={bonus.id}>
                        {bonus.value} {t(bonus.stat)}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            },
          )}
        </div>
      }
    >
      <div css={itemBox}>
        <EllipsisOutlined />
      </div>
    </Popover>
  );
};

export default BonusStats;
