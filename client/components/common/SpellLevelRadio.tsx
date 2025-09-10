import React from 'react';
import { Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { useTranslation } from 'next-i18next';
import Tooltip from './Tooltip';

interface Props {
  spellStats: Array<{ level: number }>;
  selectedSpellLevelIdx: number;
  onChange: (e: RadioChangeEvent) => void;
  spellLevelIdx: number;
  className?: string;
}

const SpellLevelRadio = ({
  spellStats,
  selectedSpellLevelIdx,
  onChange,
  spellLevelIdx,
  className,
}: Props) => {
  const { t } = useTranslation('weapon_spell_effect');
  return (
    <Radio.Group
      value={selectedSpellLevelIdx}
      onChange={onChange}
      size="small"
      className={className}
    >
      {Array(spellStats.length)
        .fill(null)
        .map((_, idx) => {
          const button = (
            // eslint-disable-next-line react/no-array-index-key
            <Radio.Button key={idx} value={idx} disabled={idx > spellLevelIdx}>
              {idx + 1}
            </Radio.Button>
          );
          return idx > spellLevelIdx ? (
            <Tooltip
              getPopupContainer={(element) =>
                element.parentElement || document.body
              }
              // eslint-disable-next-line react/no-array-index-key
              key={idx}
              title={t('AVAILABLE_AT_LEVEL', {
                level: spellStats[idx].level,
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
