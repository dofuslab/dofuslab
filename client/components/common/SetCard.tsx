/** @jsxImportSource @emotion/react */

import { useState, useCallback, memo } from 'react';

import { useTheme } from '@emotion/react';

import {
  SetBonuses,
  CardTitleWithLevel,
  BrokenImagePlaceholder,
} from 'common/wrappers';
import { itemCardStyle } from 'common/mixins';
import { mq } from 'common/constants';
import Card from 'components/common/Card';
import { SetWithItems } from 'common/type-aliases';
import { getImageUrl } from 'common/utils';

interface Props {
  set: SetWithItems;
  onClick: (set: SetWithItems) => void;
}

const SetCard = ({ set, onClick }: Props) => {
  const maxSetBonusItems = set.bonuses.reduce(
    (currMax, bonus) => Math.max(currMax, bonus.numItems),
    0,
  );

  const theme = useTheme();

  const [brokenImages, setBrokenImages] = useState<Array<string>>([]);

  const openSetModal = useCallback(() => {
    onClick(set);
  }, [onClick, set]);

  return (
    <Card
      hoverable
      size="small"
      onClick={openSetModal}
      title={
        <CardTitleWithLevel
          title={set.name}
          level={set.items?.reduce(
            (currentMax, item) => Math.max(item?.level || 0, currentMax),
            0,
          )}
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
      <div>
        <div
          css={{
            display: 'flex',
            flexWrap: 'wrap',
            margin: '0px auto 12px',
          }}
        >
          {set.items.map((item) =>
            brokenImages.includes(item.id) ? (
              <BrokenImagePlaceholder
                key={`item-${item.id}`}
                css={{
                  width: 84,
                  height: 84,
                  [mq[1]]: {
                    width: 60,
                    height: 60,
                  },
                  ':not:first-of-type': { marginLeft: 12 },
                }}
              />
            ) : (
              <img
                src={getImageUrl(item.imageUrl)}
                key={`item-${item.id}`}
                css={{
                  width: 84,
                  height: 84,
                  [mq[1]]: {
                    width: 60,
                    height: 60,
                  },
                  ':not:first-of-type': { marginLeft: 12 },
                }}
                onError={() => {
                  setBrokenImages((prev) => [...prev, item.id]);
                }}
                alt={item.name}
              />
            ),
          )}
        </div>
        <SetBonuses
          bonuses={set.bonuses.filter(
            (bonus) => bonus.numItems === maxSetBonusItems,
          )}
          count={maxSetBonusItems}
        />
      </div>
    </Card>
  );
};

export default memo(SetCard);
