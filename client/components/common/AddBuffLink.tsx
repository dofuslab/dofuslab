/** @jsxImportSource @emotion/react */

import { useContext, useCallback } from 'react';

import { Buff, ClassBuffSpell, Item } from 'common/type-aliases';
import { useTranslation } from 'next-i18next';
import { AppliedBuffActionType } from 'common/types';
import { Badge } from 'common/wrappers';
import { blue6, blue8 } from 'common/mixins';
import { statIcons } from 'common/constants';
import { CustomSetContext, getImageUrl } from 'common/utils';
import { notification } from 'antd';

interface Props {
  buff: Buff;
  isCrit: boolean;
  spell?: ClassBuffSpell;
  item?: Item;
  shouldNotify?: boolean;
}

const AddBuffLink = ({ buff, isCrit, spell, item, shouldNotify }: Props) => {
  const buffName = spell?.name || item?.name || '';
  const { appliedBuffs, dispatch } = useContext(CustomSetContext);
  const key = isCrit ? 'critIncrementBy' : 'incrementBy';
  const { t } = useTranslation(['stat', 'common', 'weapon_spell_effect']);

  const currentBuff = appliedBuffs.find((ab) => ab.buff.id === buff.id);

  const maxStacksApplied =
    buff.maxStacks &&
    (currentBuff?.numCritStacks ?? 0) + (currentBuff?.numStacks ?? 0) >=
      buff.maxStacks;

  const onAddBuff = useCallback(() => {
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

  const onAddMax = useCallback(() => {
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
    <div css={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
      <a
        onClick={onAddBuff}
        css={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}
        title={`${buff[key]} ${t(buff.stat)}`}
      >
        <img
          src={getImageUrl(statIcons[buff.stat])}
          alt={t(buff.stat)}
          css={{ width: 16 }}
        />
        <span
          css={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
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
            whiteSpace: 'nowrap',
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
