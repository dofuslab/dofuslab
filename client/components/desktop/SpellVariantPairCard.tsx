/** @jsxImportSource @emotion/react */

import { useState, useCallback } from 'react';

import { RadioChangeEvent } from 'antd/lib/radio';
import { useTheme } from '@emotion/react';

import { itemCardStyle } from 'common/mixins';
import Card from 'components/common/Card';
import SpellLevelRadio from 'components/common/SpellLevelRadio';
import { CustomSet, Spell, SpellVariantPair } from 'common/type-aliases';
import SpellCardContent from '../common/SpellCardContent';

interface Props {
  customSet?: CustomSet | null;
  spellVariantPair: SpellVariantPair;
}

const getSpellLevelIdx = (spell: Spell, customSetLevel: number) =>
  spell.spellStats.reduce((max, curr, idx) => {
    if (curr.level <= customSetLevel) {
      return idx;
    }
    return max;
  }, -1);

const getLowestSpellLevel = (spell: Spell) =>
  spell.spellStats.reduce((min, curr) => Math.min(min, curr.level), 200);

const SpellVariantPairCard = ({ spellVariantPair, customSet }: Props) => {
  const theme = useTheme();

  const spells = [...spellVariantPair.spells].sort(
    (a, b) => getLowestSpellLevel(a) - getLowestSpellLevel(b),
  );

  const [selectedSpellId, setSelectedSpellId] = useState<string>(spells[0].id);
  const customSetLevel = customSet?.level || 200;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const spell = spells.find(({ id }) => id === selectedSpellId)!;
  const spellLevelIdx = getSpellLevelIdx(spell, customSetLevel);
  const [selectedSpellLevelIdx, selectSpellLevelIdx] =
    useState<number>(spellLevelIdx);

  const tabList = spells.map((currSpell) => ({
    key: currSpell.id,
    tab: currSpell.name,
  }));

  const onTabChange = useCallback(
    (key: string) => {
      setSelectedSpellId(key);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const newSelectedSpell = spells.find(({ id }) => id === key)!;
      selectSpellLevelIdx(getSpellLevelIdx(newSelectedSpell, customSetLevel));
    },
    [spells, customSetLevel],
  );

  const onLevelChange = useCallback(
    (e: RadioChangeEvent) => {
      selectSpellLevelIdx(e.target.value);
    },
    [selectSpellLevelIdx],
  );

  return (
    <Card
      key={spellVariantPair.id}
      size="small"
      tabList={tabList}
      tabBarExtraContent={
        <SpellLevelRadio
          selectedSpellLevelIdx={selectedSpellLevelIdx}
          onChange={onLevelChange}
          spellLevelIdx={spellLevelIdx}
          spellStats={spell.spellStats}
          css={{ marginLeft: 8 }}
        />
      }
      onTabChange={onTabChange}
      css={{
        ...itemCardStyle,
        ':hover': {
          border: `1px solid ${theme.border?.default}`,
        },
        border: `1px solid ${theme.border?.default}`,
      }}
      tabProps={{ size: 'small' }}
    >
      <SpellCardContent
        key={spell.id}
        spell={spell}
        selectedSpellLevelIdx={selectedSpellLevelIdx}
        customSet={customSet}
      />
    </Card>
  );
};

export default SpellVariantPairCard;
