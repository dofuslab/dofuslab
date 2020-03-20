/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { SharedFilters, SharedFilterAction } from 'common/types';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import { topMarginStyle } from 'common/mixins';
import SelectorFilters from './SelectorFilters';
import ItemSelector from './ItemSelector';
import { mq } from 'common/constants';
import SetSelector from './SetSelector';
import BackTop from 'antd/lib/back-top';

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
  selectItemSlot: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
}

const Selector: React.FC<IProps> = ({
  customSet,
  selectedItemSlot,
  selectItemSlot,
}) => {
  const [filters, dispatch] = React.useReducer(reducer, {
    stats: [],
    maxLevel: customSet?.level || 200,
    search: '',
  });

  const [showSets, setShowSets] = React.useState(false);

  const customSetItemIds = new Set<string>();
  (customSet?.equippedItems ?? []).forEach(equippedItem =>
    customSetItemIds.add(equippedItem.item.id),
  );

  const selectorDivRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        key={`div-${selectedItemSlot?.id}`} // re-render so div loses scroll position on selectedItemSlot change
        css={{
          display: 'none',
          padding: '0 14px',
          [mq[0]]: {
            display: 'block',
            flex: 1,
          },
          overflowY: 'scroll',
          ...topMarginStyle,
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
          showSets={showSets}
          setShowSets={setShowSets}
        />
        {showSets ? (
          <SetSelector customSet={customSet} filters={filters} />
        ) : (
          <ItemSelector
            key={`selected-item-slot-${selectedItemSlot?.id}-level-${customSet?.level}`}
            selectedItemSlot={selectedItemSlot}
            customSet={customSet}
            selectItemSlot={selectItemSlot}
            customSetItemIds={customSetItemIds}
            filters={filters}
          />
        )}
      </div>
      <BackTop target={() => selectorDivRef.current!} />
    </>
  );
};

export default Selector;
