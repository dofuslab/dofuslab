/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';
import { SharedFilters, SharedFilterAction } from 'common/types';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import {
  itemSlots_itemSlots,
  itemSlots,
} from 'graphql/queries/__generated__/itemSlots';
import { topMarginStyle } from 'common/mixins';
import SelectorFilters from './SelectorFilters';
import ItemSelector from './ItemSelector';
import { mq } from 'common/constants';
import SetSelector from './SetSelector';
import BackTop from 'antd/lib/back-top';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo } from '@fortawesome/free-solid-svg-icons';
import Button from 'antd/lib/button';
import { useTranslation } from 'i18n';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';
import ItemTypeFilter from './ItemTypeFilter';
import { uniqWith, isEqual } from 'lodash';

const reducer = (state: SharedFilters, action: SharedFilterAction) => {
  switch (action.type) {
    case 'SEARCH':
      return { ...state, search: action.search };
    case 'MAX_LEVEL':
      return { ...state, maxLevel: action.maxLevel };
    case 'STATS':
      return { ...state, stats: action.stats };
    case 'RESET':
      return {
        search: '',
        stats: [],
        maxLevel: action.maxLevel,
      };
    default:
      throw new Error('Invalid action type');
  }
};

interface IProps {
  customSet?: customSet | null;
  selectedItemSlot: itemSlots_itemSlots | null;
  selectItemSlot?: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
  showSets?: boolean;
  isMobile?: boolean;
}

const Selector: React.FC<IProps> = ({
  customSet,
  selectedItemSlot,
  selectItemSlot,
  showSets,
  isMobile,
}) => {
  const [filters, dispatch] = React.useReducer(reducer, {
    stats: [],
    maxLevel: customSet?.level || 200,
    search: '',
  });

  const { data: itemSlotsData } = useQuery<itemSlots>(ItemSlotsQuery);
  const itemSlots = itemSlotsData?.itemSlots;

  const [itemTypeIds, setItemTypeIds] = React.useState<Set<string>>(new Set());

  const [showSetsState, setShowSetsState] = React.useState(showSets || false);

  const customSetItemIds = new Set<string>();
  (customSet?.equippedItems ?? []).forEach(equippedItem =>
    customSetItemIds.add(equippedItem.item.id),
  );

  const selectorDivRef = React.useRef<HTMLDivElement>(null);

  const onReset = React.useCallback(() => {
    dispatch({ type: 'RESET', maxLevel: customSet?.level || 200 });
    setItemTypeIds(new Set());
  }, [dispatch, customSet]);

  const { t } = useTranslation('common');

  return (
    <>
      <div
        key={`div-${selectedItemSlot?.id}`} // re-render so div loses scroll position on selectedItemSlot change
        css={{
          padding: '0 12px',
          ...topMarginStyle,
          [mq[1]]: {
            padding: '0 14px',
            overflowY: 'scroll',
            overflowAnchor: 'none',
            flex: 1,
            ...(topMarginStyle[mq[1]] as {}),
          },
          [mq[4]]: {
            padding: '0 20px',
            ...(topMarginStyle[mq[4]] as {}),
          },
        }}
        ref={selectorDivRef}
      >
        <SelectorFilters
          key={`filters-level-${customSet?.level}`}
          filters={filters}
          dispatch={dispatch}
          customSetLevel={customSet?.level || null}
          showSets={showSetsState}
          setShowSets={setShowSetsState}
        />
        {itemSlots && !showSetsState && (
          <ItemTypeFilter
            setItemTypeIds={setItemTypeIds}
            itemTypeIds={itemTypeIds}
            itemTypes={uniqWith(
              itemSlots
                .filter(
                  slot => !selectedItemSlot || selectedItemSlot.id === slot.id,
                )
                .flatMap(slot => slot.itemTypes),
              isEqual,
            )}
          />
        )}
        <Button
          css={{
            fontSize: '0.75rem',
            margin: '12px 0',
            height: 42,
            [mq[1]]: {
              height: 'auto',
            },
            [mq[4]]: { marginTop: '20px 0' },
          }}
          onClick={onReset}
        >
          <FontAwesomeIcon icon={faRedo} css={{ marginRight: 8 }} />
          {t('RESET_ALL_FILTERS')}
        </Button>
        {showSetsState ? (
          <SetSelector
            customSet={customSet}
            filters={filters}
            selectItemSlot={selectItemSlot}
            isMobile={isMobile}
          />
        ) : (
          <ItemSelector
            key={`selected-item-slot-${selectedItemSlot?.id}-level-${customSet?.level}`}
            itemTypeIds={itemTypeIds}
            selectedItemSlot={selectedItemSlot}
            customSet={customSet}
            customSetItemIds={customSetItemIds}
            filters={filters}
            isMobile={isMobile}
            selectItemSlot={selectItemSlot}
          />
        )}
      </div>
      <BackTop target={() => selectorDivRef.current!} />
    </>
  );
};

export default Selector;
