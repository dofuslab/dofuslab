/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';
import { BackTop } from 'antd';
import { useTheme } from 'emotion-theming';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';

import { Theme, SharedFilters, SharedFilterAction } from 'common/types';

import { topMarginStyle } from 'common/mixins';
import { mq } from 'common/constants';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';
import { ItemSlot, CustomSet } from 'common/type-aliases';
import NoSSR from 'react-no-ssr';
import { itemSlots } from 'graphql/queries/__generated__/itemSlots';
import SelectorFilters from './SelectorFilters';
import ItemSelector from './ItemSelector';
import SetSelector from './SetSelector';
import ItemTypeFilter from './ItemTypeFilter';
import ResetAllButton from './ResetAllButton';

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

interface Props {
  customSet: CustomSet | null;
  selectedItemSlot: ItemSlot | null;
  selectItemSlot?: React.Dispatch<React.SetStateAction<ItemSlot | null>>;
  showSets?: boolean;
  isMobile?: boolean;
}

const Selector: React.FC<Props> = ({
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
  const slots = itemSlotsData?.itemSlots;

  const [itemTypeIds, setItemTypeIds] = React.useState<Set<string>>(new Set());

  const [showSetsState, setShowSetsState] = React.useState(showSets || false);

  const customSetItemIds = new Set<string>();
  (customSet?.equippedItems ?? []).forEach((equippedItem) =>
    customSetItemIds.add(equippedItem.item.id),
  );

  const selectorDivRef = React.useRef<HTMLDivElement>(null);

  const onReset = React.useCallback(() => {
    dispatch({ type: 'RESET', maxLevel: customSet?.level || 200 });
    setItemTypeIds(new Set());
  }, [dispatch, customSet]);

  const theme = useTheme<Theme>();

  return (
    <>
      <div
        key={`div-${selectedItemSlot?.name}`} // re-render so div loses scroll position on selectedItemSlot change
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
          onReset={onReset}
        />
        {slots && !showSetsState && (
          <ItemTypeFilter
            setItemTypeIds={setItemTypeIds}
            itemTypeIds={itemTypeIds}
            itemTypes={uniqWith(
              slots
                .filter(
                  (slot: ItemSlot) =>
                    !selectedItemSlot || selectedItemSlot.id === slot.id,
                )
                .flatMap((slot: ItemSlot) => slot.itemTypes),
              isEqual,
            )}
          />
        )}
        <ResetAllButton
          css={{ [mq[1]]: { display: 'none' } }}
          onReset={onReset}
        />
        {showSetsState ? (
          <SetSelector filters={filters} customSet={customSet} />
        ) : (
          <ItemSelector
            key={`selected-item-slot-${selectedItemSlot?.name}-level-${customSet?.level}`}
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
      <NoSSR>
        <BackTop
          target={() => {
            if (selectorDivRef.current) {
              return selectorDivRef.current;
            }
            return document.body;
          }}
          css={{
            '.ant-back-top-content': {
              backgroundColor: theme.backTop?.background,
              '&:hover': { backgroundColor: theme.backTop?.hoverBackground },
            },
          }}
        />
      </NoSSR>
    </>
  );
};

export default Selector;
