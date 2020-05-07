/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { RadioChangeEvent } from 'antd/lib/radio';
import { useTheme } from 'emotion-theming';

import { CardTitleWithLevel } from 'common/wrappers';
import { itemCardStyle } from 'common/mixins';
import Card from 'components/common/Card';
import { Theme } from 'common/types';
import { CustomSet, Spell } from 'common/type-aliases';
import SpellCardContent from './SpellCardContent';
import SpellLevelRadio from './SpellLevelRadio';

interface Props {
  customSet?: CustomSet | null;
  spell: Spell;
}

const SpellCard: React.FC<Props> = ({ spell, customSet }) => {
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

  const theme = useTheme<Theme>();

  return (
    <Card
      key={spell.id}
      size="small"
      title={
        <CardTitleWithLevel
          title={spell.name}
          rightAlignedContent={
            <SpellLevelRadio
              selectedSpellLevelIdx={selectedSpellLevelIdx}
              onChange={onChange}
              spellLevelIdx={spellLevelIdx}
              spell={spell}
            />
          }
        />
      }
      css={{
        ...itemCardStyle,
        ':hover': {
          border: `1px solid ${theme.border?.default}`,
        },
        border: `1px solid ${theme.border?.default}`,
      }}
    >
      <SpellCardContent
        customSet={customSet}
        selectedSpellLevelIdx={selectedSpellLevelIdx}
        spell={spell}
      />
    </Card>
  );
};

export default SpellCard;
