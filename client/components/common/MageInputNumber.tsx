import React from 'react';
import { InputNumber } from 'antd';
import { Stat } from '__generated__/globalTypes';
import { MageAction } from 'common/types';
import { ClassNames } from '@emotion/react';
import { inputFontSize } from 'common/mixins';

interface Props {
  stat: Stat;
  value: number;
  dispatch: React.Dispatch<MageAction>;
  isExo: boolean;
}

const MAX = 9999;

const MageInputNumber = ({ stat, value, dispatch, isExo }: Props) => {
  const onChange = React.useCallback(
    (v: number | null) => {
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
            ...inputFontSize,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            flex: '0 0 60px',
          })}
          onKeyDown={(e) => {
            // prevents triggering SetBuilderKeyboardShortcuts
            e.nativeEvent.stopPropagation();
          }}
        />
      )}
    </ClassNames>
  );
};

export default MageInputNumber;
