/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import {
  SharedFilters,
  SharedFilterAction,
  MobileScreen,
  mobileScreenTypes,
} from 'common/types';
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
  showSets?: boolean;
  setMobileScreen?: React.Dispatch<React.SetStateAction<MobileScreen>>;
  windowNode?: Window | null;
}

const Selector: React.FC<IProps> = ({
  customSet,
  selectedItemSlot,
  selectItemSlot,
  showSets,
  setMobileScreen,
  windowNode,
}) => {
  const [filters, dispatch] = React.useReducer(reducer, {
    stats: [],
    maxLevel: customSet?.level || 200,
    search: '',
  });

  const [showSetsState, setShowSetsState] = React.useState(showSets || false);

  const customSetItemIds = new Set<string>();
  (customSet?.equippedItems ?? []).forEach(equippedItem =>
    customSetItemIds.add(equippedItem.item.id),
  );

  const selectorDivRef = React.useRef<HTMLDivElement>(null);

  const goHomeMobile = React.useCallback(() => {
    setMobileScreen && setMobileScreen(mobileScreenTypes.HOME);
    selectItemSlot(null);
  }, [setMobileScreen]);

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
          goHomeMobile={goHomeMobile}
        />
        {showSetsState ? (
          <SetSelector
            customSet={customSet}
            filters={filters}
            setMobileScreen={setMobileScreen}
            windowNode={windowNode}
            selectItemSlot={selectItemSlot}
          />
        ) : (
          <ItemSelector
            key={`selected-item-slot-${selectedItemSlot?.id}-level-${customSet?.level}`}
            selectedItemSlot={selectedItemSlot}
            customSet={customSet}
            selectItemSlot={selectItemSlot}
            customSetItemIds={customSetItemIds}
            filters={filters}
            setMobileScreen={setMobileScreen}
            windowNode={windowNode}
          />
        )}
      </div>
      <BackTop target={() => selectorDivRef.current!} />
    </>
  );
};

export default Selector;
