/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { Buff, ClassBuffSpell, Item } from 'common/type-aliases';
import { useTranslation } from 'i18n';
import { AppliedBuffAction, AppliedBuffActionType } from 'common/types';
import { Badge } from 'common/wrappers';
import { blue6, blue8 } from 'common/mixins';
import { statIcons } from 'common/constants';

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
        <img
          src={statIcons[buff.stat]}
          alt={t(buff.stat)}
          css={{ marginRight: 8, width: 16 }}
        />
        <span>
          {buff[key]} {t(buff.stat)}
        </span>
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
