/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import {
  classById_classById_spellVariantPairs,
  classById_classById_spellVariantPairs_spells,
} from 'graphql/queries/__generated__/classById';
import { RadioChangeEvent } from 'antd/lib/radio';
import { useTheme } from 'emotion-theming';

import { TTheme } from 'common/themes';
import { itemCardStyle } from 'common/mixins';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import Card from 'components/common/Card';
import SpellCardContent from '../common/SpellCardContent';
import SpellLevelRadio from 'components/common/SpellLevelRadio';

interface IProps {
  customSet?: customSet | null;
  spellVariantPair: classById_classById_spellVariantPairs;
}

const getSpellLevelIdx = (
  spell: classById_classById_spellVariantPairs_spells,
  customSetLevel: number,
) =>
  spell.spellStats.reduce((max, curr, idx) => {
    if (curr.level <= customSetLevel) {
      return idx;
    }
    return max;
  }, -1);

const SpellVariantPairCard: React.FC<IProps> = ({
  spellVariantPair,
  customSet,
}) => {
  const [selectedSpellId, setSelectedSpellId] = React.useState<string>(
    spellVariantPair.spells[0].id,
  );
  const customSetLevel = customSet?.level || 200;
  const spell = spellVariantPair.spells.find(
    ({ id }) => id === selectedSpellId,
  )!;
  const spellLevelIdx = getSpellLevelIdx(spell, customSetLevel);
  const [selectedSpellLevelIdx, selectSpellLevelIdx] = React.useState<number>(
    spellLevelIdx,
  );

  const tabList = spellVariantPair.spells.map(currSpell => ({
    key: currSpell.id,
    tab: currSpell.name,
  }));

  const onTabChange = React.useCallback(
    (key: string) => {
      setSelectedSpellId(key);
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

  const theme = useTheme<TTheme>();

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
        [':hover']: {
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
