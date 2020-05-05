/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';

import { RadioChangeEvent } from 'antd/lib/radio';
import { useTheme } from 'emotion-theming';

import { itemCardStyle } from 'common/mixins';
import Card from 'components/common/Card';
import SpellLevelRadio from 'components/common/SpellLevelRadio';
import { CustomSet, Spell, SpellVariantPair } from 'common/type-aliases';
import { Theme } from 'common/types';
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

const SpellVariantPairCard: React.FC<Props> = ({
  spellVariantPair,
  customSet,
}) => {
  const theme = useTheme<Theme>();

  const [selectedSpellId, setSelectedSpellId] = React.useState<string>(
    spellVariantPair.spells[0].id,
  );
  const customSetLevel = customSet?.level || 200;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const spell = spellVariantPair.spells.find(
    ({ id }) => id === selectedSpellId,
  )!;
  const spellLevelIdx = getSpellLevelIdx(spell, customSetLevel);
  const [selectedSpellLevelIdx, selectSpellLevelIdx] = React.useState<number>(
    spellLevelIdx,
  );

  const tabList = spellVariantPair.spells.map((currSpell) => ({
    key: currSpell.id,
    tab: currSpell.name,
  }));

  const onTabChange = React.useCallback(
    (key: string) => {
      setSelectedSpellId(key);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const newSelectedSpell = spellVariantPair.spells.find(
        ({ id }) => id === key,
      )!;
      selectSpellLevelIdx(getSpellLevelIdx(newSelectedSpell, customSetLevel));
    },
    [spellVariantPair, customSetLevel],
  );

  const onLevelChange = React.useCallback(
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
          spell={spell}
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
        spell={spell}
        selectedSpellLevelIdx={selectedSpellLevelIdx}
      />
    </Card>
  );
};

export default SpellVariantPairCard;
