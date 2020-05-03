import React from 'react';
import { Radio } from 'antd';
import Tooltip from './Tooltip';
import { classById_classById_spellVariantPairs_spells } from 'graphql/queries/__generated__/classById';
import { RadioChangeEvent } from 'antd/lib/radio';
import { useTranslation } from 'i18n';

interface IProps {
  spell: classById_classById_spellVariantPairs_spells;
  selectedSpellLevelIdx: number;
  onChange: (e: RadioChangeEvent) => void;
  spellLevelIdx: number;
}

const SpellLevelRadio: React.FC<IProps> = ({
  spell,
  selectedSpellLevelIdx,
  onChange,
  spellLevelIdx,
}) => {
  const { t } = useTranslation('weapon_spell_effect');
  return (
    <Radio.Group value={selectedSpellLevelIdx} onChange={onChange} size="small">
      {Array(spell.spellStats.length)
        .fill(null)
        .map((_, idx) => {
          const button = (
            <Radio.Button key={idx} value={idx} disabled={idx > spellLevelIdx}>
              {idx + 1}
            </Radio.Button>
          );
          return idx > spellLevelIdx ? (
            <Tooltip
              getPopupContainer={element => element.parentElement!}
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
  );
};

export default SpellLevelRadio;
