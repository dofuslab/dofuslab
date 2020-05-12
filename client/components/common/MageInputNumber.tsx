import React from 'react';
import { InputNumber } from 'antd';
import { Stat } from '__generated__/globalTypes';
import { MageAction } from 'common/types';
import { ClassNames } from '@emotion/core';

interface Props {
  stat: Stat;
  value: number;
  dispatch: React.Dispatch<MageAction>;
  isExo: boolean;
}

const MAX = 9999;

const MageInputNumber: React.FC<Props> = ({ stat, value, dispatch, isExo }) => {
  const onChange = React.useCallback(
    (v: number | string | undefined) => {
      if (typeof v !== 'number') {
        return;
      }
      dispatch({
        type: 'EDIT',
        stat,
        value: v || 0,
        isExo,
      });
    },
    [dispatch, stat, value],
  );

  return (
    <ClassNames>
      {({ css }) => (
        <InputNumber
          value={value}
          onChange={onChange}
          type="number"
          max={MAX}
          min={-MAX}
          className={css({
            marginRight: 8,
            fontSize: '0.75rem',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            flex: '0 0 60px',
          })}
        />
      )}
    </ClassNames>
  );
};

export default MageInputNumber;
