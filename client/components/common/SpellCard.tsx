/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { classById_classById_spellVariantPairs_spells } from 'graphql/queries/__generated__/classById';
import Card from 'antd/lib/card';
import { CardTitleWithLevel } from 'common/wrappers';
import { itemCardStyle, BORDER_COLOR } from 'common/mixins';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import Radio, { RadioChangeEvent } from 'antd/lib/radio';
import Tooltip from 'antd/lib/tooltip';
import { useTranslation } from 'i18n';

interface IProps {
  customSet?: customSet | null;
  spell: classById_classById_spellVariantPairs_spells;
}

const SpellCard: React.FC<IProps> = ({ spell, customSet }) => {
  const { t } = useTranslation('weapon_spell_effect');
  const customSetLevel = customSet?.level || 200;
  const spellLevelIdx = spell.spellStats.reduce((max, curr, idx) => {
    if (curr.level <= customSetLevel) {
      return idx;
    }
    return max;
  }, -1);
  const [selectedSpellLevelIdx, selectSpellLevelIdx] = React.useState<number>(
    spellLevelIdx,
  );

  const onChange = React.useCallback(
    (e: RadioChangeEvent) => {
      selectSpellLevelIdx(e.target.value);
    },
    [selectSpellLevelIdx],
  );

  return (
    <Card
      key={spell.id}
      size="small"
      title={
        <CardTitleWithLevel
          title={spell.name}
          rightAlignedContent={
            <Radio.Group
              value={selectedSpellLevelIdx}
              onChange={onChange}
              size="small"
            >
              {Array(spell.spellStats.length)
                .fill(null)
                .map((_, idx) => {
                  const button = (
                    <Radio.Button
                      key={idx}
                      value={idx}
                      disabled={idx > spellLevelIdx}
                    >
                      {idx + 1}
                    </Radio.Button>
                  );
                  return idx > spellLevelIdx ? (
                    <Tooltip
                      key={idx}
                      title={t('AVAILABLE_AT_LEVEL', {
                        level: spell.spellStats[idx].level,
                      })}
                    >
                      {button}
                    </Tooltip>
                  ) : (
                    button
                  );
                })}
            </Radio.Group>
          }
        />
      }
      css={{
        ...itemCardStyle,
        [':hover']: {
          border: `1px solid ${BORDER_COLOR}`,
        },
        border: `1px solid ${BORDER_COLOR}`,
      }}
    >
      {spell.description}
    </Card>
  );
};

export default SpellCard;
