/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useTheme } from 'emotion-theming';

import { Theme } from 'common/types';
import { useTranslation } from 'i18n';
import {
  SetBonuses,
  CardTitleWithLevel,
  BrokenImagePlaceholder,
} from 'common/wrappers';
import { itemCardStyle } from 'common/mixins';
import { mq } from 'common/constants';
import Card from 'components/common/Card';
import { SetWithItems } from 'common/type-aliases';

interface Props {
  set: SetWithItems;
  onClick: (set: SetWithItems) => void;
}

const SetCard: React.FC<Props> = ({ set, onClick }) => {
  const { t } = useTranslation(['stat', 'common']);
  const maxSetBonusItems = set.bonuses.reduce(
    (currMax, bonus) => Math.max(currMax, bonus.numItems),
    0,
  );

  const theme = useTheme<Theme>();

  const [brokenImages, setBrokenImages] = React.useState<Array<string>>([]);

  const openSetModal = React.useCallback(() => {
    onClick(set);
  }, [onClick, set]);

  return (
    <>
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
                  src={item.imageUrl}
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
            t={t}
          />
        </div>
      </Card>
    </>
  );
};

export default React.memo(SetCard);
