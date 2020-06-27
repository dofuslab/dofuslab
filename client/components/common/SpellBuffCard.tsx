/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { RadioChangeEvent } from 'antd/lib/radio';

import { CardTitleWithLevel, damageHeaderStyle } from 'common/wrappers';
import { itemCardStyle } from 'common/mixins';
import Card from 'components/common/Card';
import { classBuffs_classById_spellVariantPairs_spells as ClassBuffSpell } from 'graphql/queries/__generated__/classBuffs';
import { useTranslation } from 'i18n';
import SpellLevelRadio from './SpellLevelRadio';
import AddBuffLink from './AddBuffLink';

interface Props {
  spell: ClassBuffSpell;
  level: number;
}

const SpellBuffCard: React.FC<Props> = ({ spell, level }) => {
  const spellLevelIdx = spell.spellStats.reduce((max, curr, idx) => {
    if (!curr) {
      return max;
    }
    if (curr.level <= level) {
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

  const currentSpellStats = spell.spellStats[selectedSpellLevelIdx];
  const { t } = useTranslation(['weapon_spell_effect', 'common']);

  const filteredNonCritBuffs =
    currentSpellStats.buffs?.filter((b) => !!b.incrementBy) ?? [];
  const filteredCritBuffs =
    currentSpellStats.buffs?.filter((b) => !!b.critIncrementBy) ?? [];

  return (
    <Card
      size="small"
      title={
        <div css={{ display: 'flex' }}>
          <img
            src={spell.imageUrl}
            css={{ width: 24, marginRight: 8 }}
            alt={spell.name}
          />
          <CardTitleWithLevel
            title={spell.name}
            rightAlignedContent={
              spell.spellStats.length > 0 && (
                <SpellLevelRadio
                  selectedSpellLevelIdx={selectedSpellLevelIdx}
                  onChange={onChange}
                  spellLevelIdx={spellLevelIdx}
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  spellStats={spell.spellStats}
                />
              )
            }
            css={{ flex: 1 }}
          />
        </div>
      }
      css={{
        ...itemCardStyle,
      }}
    >
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridColumnGap: 8,
        }}
      >
        <div>
          <div css={damageHeaderStyle}>{t('NON_CRIT')}</div>
          {filteredNonCritBuffs.length > 0
            ? filteredNonCritBuffs.map((b) => (
                <AddBuffLink key={b.id} isCrit={false} buff={b} spell={spell} />
              ))
            : t('N/A', { ns: 'common' })}
        </div>
        <div>
          <div css={damageHeaderStyle}>{t('CRIT')}</div>
          {filteredCritBuffs.length > 0
            ? filteredCritBuffs.map((b) => (
                <AddBuffLink key={b.id} isCrit buff={b} spell={spell} />
              ))
            : t('N/A', { ns: 'common' })}
        </div>
      </div>
    </Card>
  );
};

export default SpellBuffCard;
