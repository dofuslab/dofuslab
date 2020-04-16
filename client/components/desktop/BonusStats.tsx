/** @jsx jsx */

import * as React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import { Popover } from 'antd';
import { useTranslation } from 'i18n';
import { useTheme } from 'emotion-theming';

import { TTheme } from 'common/themes';
import { popoverTitleStyle } from 'common/mixins';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { getBonusesFromCustomSet } from 'common/utils';
import { SetBonuses, BrokenImagePlaceholder } from 'common/wrappers';
import { mq } from 'common/constants';
import SetModal from 'components/common/SetModal';
import { item_set } from 'graphql/fragments/__generated__/item';

interface IProps {
  customSet: customSet;
}

const BonusStats: React.FC<IProps> = ({ customSet }) => {
  const { t } = useTranslation(['stat', 'common']);
  const setBonuses = getBonusesFromCustomSet(customSet);
  const itemOrder = customSet.equippedItems.reduce(
    (acc, curr) => ({ ...acc, [curr.item.id]: curr.slot.order }),
    {},
  ) as { [key: string]: number };

  const theme = useTheme<TTheme>();

  const [brokenImages, setBrokenImages] = React.useState<Array<string>>([]);

  const [setModalVisible, setSetModalVisible] = React.useState(false);
  const [selectedSet, setSelectedSet] = React.useState<item_set | null>(null);

  const openSetModal = React.useCallback(
    (set: item_set) => {
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
        marginTop: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        [mq[1]]: { marginLeft: 20, marginTop: 0, flexDirection: 'row' },
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
                  bonus => bonus.numItems === count,
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
                  >
                    <div
                      css={{
                        display: 'flex',
                        background: theme.layer?.background,
                        borderRadius: 4,
                        border: `1px solid ${theme.border?.default}`,
                        padding: '4px 8px',
                        cursor: 'pointer',
                        ':not(:first-of-type)': {
                          marginTop: 12,
                          [mq[1]]: {
                            marginTop: 0,
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
                        .map(equippedItem => (
                          <div
                            key={`set-bonus-item-${equippedItem.id}`}
                            css={{
                              width: 40,
                              height: 40,
                              [mq[1]]: {
                                [':not:first-of-type']: { marginLeft: 4 },
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
                                  setBrokenImages(prev => [
                                    ...prev,
                                    equippedItem.id,
                                  ]);
                                }}
                              />
                            )}
                          </div>
                        ))}
                    </div>
                  </Popover>
                );
              },
            )
        }
      </ClassNames>
      {selectedSet && (
        <SetModal
          setId={selectedSet?.id}
          setName={selectedSet?.name}
          visible={setModalVisible}
          onCancel={closeSetModal}
          customSet={customSet}
          isMobile={false}
        />
      )}
    </div>
  );
};

export default BonusStats;
