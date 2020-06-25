/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { RadioChangeEvent } from 'antd/lib/radio';
import { useTheme } from 'emotion-theming';

import { CardTitleWithLevel } from 'common/wrappers';
import { itemCardStyle } from 'common/mixins';
import Card from 'components/common/Card';
import { Theme } from 'common/types';
import { Buff } from 'common/type-aliases';
import SpellLevelRadio from './SpellLevelRadio';

interface Props {
  buffs: Array<Buff>;
  level: number;
}

const BuffCard: React.FC<Props> = ({ buffs, level }) => {
  const spellStats = buffs
    .filter((b) => !!b.spellStats)
    .map((b) => b.spellStats);

  const spellLevelIdx = spellStats.reduce((max, curr, idx) => {
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

  const theme = useTheme<Theme>();

  return (
    <Card
      size="small"
      title={
        <CardTitleWithLevel
          title={
            buffs[selectedSpellLevelIdx]?.spellStats?.spell?.name ||
            buffs[0].item?.name ||
            ''
          }
          rightAlignedContent={
            spellStats.length > 0 && (
              <SpellLevelRadio
                selectedSpellLevelIdx={selectedSpellLevelIdx}
                onChange={onChange}
                spellLevelIdx={spellLevelIdx}
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                spellStats={buffs.map((b) => b.spellStats!)}
              />
            )
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
      asdf
    </Card>
  );
};

export default BuffCard;
