/** @jsx jsx */

import * as React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import { Popover } from 'antd';
import { useTranslation } from 'i18n';
import { useTheme } from 'emotion-theming';

import { Theme } from 'common/types';
import { popoverTitleStyle } from 'common/mixins';
import { getBonusesFromCustomSet } from 'common/utils';
import { SetBonuses, BrokenImagePlaceholder } from 'common/wrappers';
import { mq } from 'common/constants';
import SetModal from 'components/common/SetModal';
import { CustomSet, ItemSet } from 'common/type-aliases';

const DISPLAY_ITEM_LIMIT = 3;

interface Props {
  customSet: CustomSet;
  isMobile: boolean;
  isClassic?: boolean;
}

const BonusStats: React.FC<Props> = ({ customSet, isMobile, isClassic }) => {
  const { t } = useTranslation(['stat', 'common']);
  const setBonuses = getBonusesFromCustomSet(customSet);
  const itemOrder = customSet.equippedItems.reduce(
    (acc, curr) => ({ ...acc, [curr.id]: curr.slot.order }),
    {},
  ) as { [key: string]: number };

  const theme = useTheme<Theme>();

  const [brokenImages, setBrokenImages] = React.useState<Array<string>>([]);

  const [setModalVisible, setSetModalVisible] = React.useState(false);
  const [selectedSet, setSelectedSet] = React.useState<ItemSet | null>(null);

  const openSetModal = React.useCallback(
    (set: ItemSet) => {
      setSelectedSet(set);
      setSetModalVisible(true);
    },
    [setSelectedSet, setSetModalVisible],
  );

  const closeSetModal = React.useCallback(() => {
    setSetModalVisible(false);
  }, [setSetModalVisible]);

  return (
    <div
      css={{
        display: 'flex',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        margin: '18px -6px -6px',
        [mq[1]]: isClassic
          ? {
              flexDirection: 'row',
              flexWrap: 'wrap',
              margin: -4,
              justifyContent: 'center',
            }
          : {
              margin: '0 0 0 20px',
              flexDirection: 'row',
              flex: '0 3 auto',
              flexWrap: 'wrap',
              overflowY: 'auto',
            },
      }}
    >
      <ClassNames>
        {({ css }) =>
          Object.values(setBonuses)
            .sort(({ set: { name: name1 } }, { set: { name: name2 } }) =>
              name1.localeCompare(name2),
            )
            .map(
              ({ count, set, set: { id, name, bonuses }, equippedItems }) => {
                const filteredBonuses = bonuses.filter(
                  (bonus) => bonus.numItems === count,
                );
                return (
                  <Popover
                    key={id}
                    overlayClassName={css({
                      ...popoverTitleStyle,
                      maxWidth: 288,
                    })}
                    title={
                      <div
                        css={{
                          display: 'flex',
                          alignItems: 'baseline',
                          fontSize: '0.8rem',
                        }}
                      >
                        <div>{name}</div>
                      </div>
                    }
                    content={
                      <SetBonuses
                        count={count}
                        bonuses={filteredBonuses}
                        t={t}
                      />
                    }
                    placement="bottomLeft"
                    trigger={isMobile ? 'click' : 'hover'}
                  >
                    <div
                      css={{
                        display: 'flex',
                        background: theme.layer?.background,
                        borderRadius: 4,
                        border: `1px solid ${theme.border?.default}`,
                        padding: '4px 8px',
                        cursor: 'pointer',
                        margin: 6,
                        [mq[1]]: isClassic
                          ? { margin: 4 }
                          : {
                              margin: 0,
                              '&:not(:first-of-type)': {
                                marginLeft: 12,
                              },
                            },
                      }}
                      onClick={() => {
                        openSetModal(set);
                      }}
                    >
                      {[...equippedItems]
                        .sort((i, j) => itemOrder[i.id] - itemOrder[j.id])
                        .map((equippedItem) => (
                          <div
                            key={`set-bonus-item-${equippedItem.id}`}
                            css={{
                              width: 40,
                              height: 40,
                              [mq[1]]: {
                                ':not:first-of-type': { marginLeft: 4 },
                              },
                            }}
                          >
                            {brokenImages.includes(equippedItem.id) ? (
                              <BrokenImagePlaceholder
                                css={{ width: '100%', height: '100%' }}
                              />
                            ) : (
                              <img
                                src={equippedItem.item.imageUrl}
                                css={{ maxWidth: '100%', maxHeight: '100%' }}
                                onError={() => {
                                  setBrokenImages((prev) => [
                                    ...prev,
                                    equippedItem.id,
                                  ]);
                                }}
                                alt={equippedItem.item.name}
                              />
                            )}
                          </div>
                        ))
                        .filter((_, idx) =>
                          equippedItems.length - DISPLAY_ITEM_LIMIT > 1
                            ? idx < DISPLAY_ITEM_LIMIT
                            : idx < DISPLAY_ITEM_LIMIT + 1,
                        )}
                      {equippedItems.length > DISPLAY_ITEM_LIMIT + 1 && (
                        <div
                          key="truncated-set"
                          css={{
                            width: 40,
                            height: 40,
                            fontSize: '1rem',
                            fontWeight: 500,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: theme.text?.light,
                            [mq[1]]: {
                              ':not:first-of-type': { marginLeft: 4 },
                            },
                          }}
                        >
                          +{equippedItems.length - DISPLAY_ITEM_LIMIT}
                        </div>
                      )}
                    </div>
                  </Popover>
                );
              },
            )
        }
      </ClassNames>
      {selectedSet && !isMobile && (
        <SetModal
          setId={selectedSet?.id}
          setName={selectedSet?.name}
          visible={setModalVisible}
          onCancel={closeSetModal}
          customSet={customSet}
          shouldRedirect={false}
        />
      )}
    </div>
  );
};

export default BonusStats;
