/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { Buff, ClassBuffSpell, Item } from 'common/type-aliases';
import { useTranslation } from 'i18n';
import { AppliedBuffActionType } from 'common/types';
import { Badge } from 'common/wrappers';
import { blue6, blue8 } from 'common/mixins';
import { statIcons } from 'common/constants';
import { AppliedBuffsContext } from 'common/utils';
import { notification } from 'antd';

interface Props {
  buff: Buff;
  isCrit: boolean;
  spell?: ClassBuffSpell;
  item?: Item;
  shouldNotify?: boolean;
}

const AddBuffLink: React.FC<Props> = ({
  buff,
  isCrit,
  spell,
  item,
  shouldNotify,
}) => {
  const buffName = spell?.name || item?.name || '';
  const { appliedBuffs, dispatch } = React.useContext(AppliedBuffsContext);
  const key = isCrit ? 'critIncrementBy' : 'incrementBy';
  const { t } = useTranslation(['stat', 'common', 'weapon_spell_effect']);

  const currentBuff = appliedBuffs.find((ab) => ab.buff.id === buff.id);

  const maxStacksApplied =
    buff.maxStacks &&
    (currentBuff?.numCritStacks ?? 0) + (currentBuff?.numStacks ?? 0) >=
      buff.maxStacks;

  const onAddBuff = React.useCallback(() => {
    if (maxStacksApplied) {
      notification.error({
        message: t('ERROR', { ns: 'common' }),
        description: t('MAX_STACKS_APPLIED', { ns: 'weapon_spell_effect' }),
      });
      return;
    }
    dispatch({
      type: AppliedBuffActionType.ADD_STACK,
      isCrit,
      buff,
      spell,
      item,
    });
    if (shouldNotify) {
      notification.success({
        message: t('SUCCESS', { ns: 'common' }),
        description: t('BUFF_APPLY_SUCCESS', { ns: 'common', buffName }),
      });
    }
  }, [isCrit, buff, spell, item, maxStacksApplied]);

  const onAddMax = React.useCallback(() => {
    if (maxStacksApplied) {
      notification.error({
        message: t('ERROR', { ns: 'common' }),
        description: t('MAX_STACKS_APPLIED', { ns: 'weapon_spell_effect' }),
      });
      return;
    }
    dispatch({
      type: AppliedBuffActionType.MAX_STACKS,
      isCrit,
      buff,
      spell,
      item,
    });
    if (shouldNotify) {
      notification.success({
        message: t('SUCCESS', { ns: 'common' }),
        description: t('BUFF_APPLY_SUCCESS', { ns: 'common', buffName }),
      });
    }
  }, [isCrit, buff, spell, item, maxStacksApplied]);

  return (
    <div>
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
