/** @jsxImportSource @emotion/react */

import * as React from 'react';

import { ClassNames, useTheme } from '@emotion/react';
import { Popover, Divider } from 'antd';
import { useTranslation } from 'next-i18next';

import { popoverTitleStyle, popoverShadow } from 'common/mixins';
import { getBonusesFromCustomSet, getImageUrl } from 'common/utils';
import { SetBonuses, BrokenImagePlaceholder } from 'common/wrappers';
import { mq } from 'common/constants';
import SetModal from 'components/common/SetModal';
import { CustomSet, ItemSet } from 'common/type-aliases';
import { Media } from 'components/common/Media';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCubes } from '@fortawesome/free-solid-svg-icons';
import EquipSetLink from 'components/common/EquipSetLink';

const DISPLAY_ITEM_LIMIT = 3;

interface Props {
  customSet: CustomSet;
  isMobile: boolean;
  isClassic: boolean;
}

const BonusStats: React.FC<Props> = ({ customSet, isMobile, isClassic }) => {
  const { t } = useTranslation(['stat', 'common']);
  const setBonuses = getBonusesFromCustomSet(customSet);
  const itemOrder = customSet.equippedItems.reduce(
    (acc, curr) => ({ ...acc, [curr.id]: curr.slot.order }),
    {},
  ) as { [key: string]: number };

  const theme = useTheme();

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

  const contentRef = React.useRef<HTMLDivElement | null>(null);

  if (Object.values(setBonuses).length === 0) {
    return null;
  }

  const sortedSetBonuses = Object.values(setBonuses).sort(
    ({ set: { name: name1 } }, { set: { name: name2 } }) =>
      name1.localeCompare(name2),
  );

  const expandedContent = (
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
              margin: '0 0 0 12px',
              flexDirection: 'row',
              flex: '0 3 auto',
              flexWrap: 'wrap',
              overflowY: 'auto',
            },
        [mq[4]]: {
          margin: isClassic ? -4 : '0 0 0 20px',
        },
      }}
    >
      <ClassNames>
        {({ css }) =>
          sortedSetBonuses.map(
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
                    <SetBonuses count={count} bonuses={filteredBonuses} t={t} />
                  }
                  placement={isClassic ? 'bottom' : 'bottomLeft'}
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
                              src={getImageUrl(equippedItem.item.imageUrl)}
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
      {(isMobile || isClassic) && <EquipSetLink customSetId={customSet.id} />}
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

  const popoverTrigger = (
    <div css={{ padding: '0px 8px' }} ref={contentRef}>
      <FontAwesomeIcon icon={faCubes} css={{ fontSize: '1.5em' }} />
    </div>
  );

  return isClassic ? (
    expandedContent
  ) : (
    <>
      <Media lessThan="xs">{expandedContent}</Media>
      <Media
        between={['xs', 'md']}
        css={{ display: 'flex', alignItems: 'center', marginLeft: 12 }}
      >
        <ClassNames>
          {({ css, cx }) => (
            <Popover
              overlayClassName={cx(
                css(popoverTitleStyle),
                css({
                  fontSize: '0.75rem',
                  maxWidth: 288,
                  '.ant-popover-content': {
                    boxShadow: popoverShadow,
                    maxHeight: contentRef.current
                      ? `calc(100vh - ${
                          contentRef.current.offsetTop +
                          contentRef.current.offsetHeight +
                          20
                        }px)`
                      : undefined,
                    overflow: 'auto',
                  },
                }),
              )}
              autoAdjustOverflow={{ adjustX: 1, adjustY: 0 }}
              placement="bottom"
              title={<div>{t('SET_BONUSES', { ns: 'common' })}</div>}
              content={sortedSetBonuses.map(
                ({ count, set: { id, name, bonuses } }, idx) => {
                  const filteredBonuses = bonuses.filter(
                    (bonus) => bonus.numItems === count,
                  );

                  return (
                    <React.Fragment key={id}>
                      {idx !== 0 && <Divider css={{ margin: '8px 0' }} />}
                      <div>
                        <div css={{ fontWeight: 500 }}>{name}</div>
                        <SetBonuses
                          count={count}
                          bonuses={filteredBonuses}
                          t={t}
                        />
                      </div>
                    </React.Fragment>
                  );
                },
              )}
            >
              {popoverTrigger}
            </Popover>
          )}
        </ClassNames>
      </Media>
      <Media greaterThanOrEqual="md">{expandedContent}</Media>
    </>
  );
};

export default BonusStats;
