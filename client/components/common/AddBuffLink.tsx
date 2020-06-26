/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { Buff, ClassBuffSpell, Item } from 'common/type-aliases';
import { useTranslation } from 'i18n';
import { AppliedBuffAction, AppliedBuffActionType } from 'common/types';

interface Props {
  buff: Buff;
  isCrit: boolean;
  dispatch: React.Dispatch<AppliedBuffAction>;
  spell?: ClassBuffSpell;
  item?: Item;
}

const AddBuffLink: React.FC<Props> = ({
  buff,
  isCrit,
  dispatch,
  spell,
  item,
}) => {
  const key = isCrit ? 'critIncrementBy' : 'incrementBy';
  const { t } = useTranslation('stat');

  const onAddBuff = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        dispatch({
          type: AppliedBuffActionType.MAX_STACKS,
          isCrit,
          buff,
          spell,
          item,
        });
      } else {
        dispatch({
          type: AppliedBuffActionType.ADD_STACK,
          isCrit,
          buff,
          spell,
          item,
        });
      }
    },
    [isCrit, buff],
  );

  return (
    <div>
      <a onClick={onAddBuff}>
        {buff[key]} {t(buff.stat)}
      </a>
    </div>
  );
};

export default AddBuffLink;
