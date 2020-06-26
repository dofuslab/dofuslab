/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { Buff, ClassBuffSpell, Item } from 'common/type-aliases';
import { useTranslation } from 'i18n';
import { AppliedBuffAction, AppliedBuffActionType } from 'common/types';
import { Badge } from 'common/wrappers';
import { blue6, blue8 } from 'common/mixins';

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
  const { t } = useTranslation(['stat', 'common']);

  const onAddBuff = React.useCallback(() => {
    dispatch({
      type: AppliedBuffActionType.ADD_STACK,
      isCrit,
      buff,
      spell,
      item,
    });
  }, [isCrit, buff]);

  const onAddMax = React.useCallback(() => {
    dispatch({
      type: AppliedBuffActionType.MAX_STACKS,
      isCrit,
      buff,
      spell,
      item,
    });
  }, [isCrit, buff, spell, item]);

  return (
    <div css={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
      <a onClick={onAddBuff} css={{ marginRight: 4 }}>
        {buff[key]} {t(buff.stat)}
      </a>
      {buff.maxStacks && buff.maxStacks > 1 && (
        <Badge
          css={{
            marginLeft: 4,
            background: blue8,
            cursor: 'pointer',
            transition: 'background 0.2s ease-in-out',
            '&:hover': { background: blue6 },
          }}
          role="button"
          onClick={onAddMax}
        >
          {t('MAX_NUM', { ns: 'common', max: buff.maxStacks })}
        </Badge>
      )}
    </div>
  );
};

export default AddBuffLink;
