import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useApolloClient } from '@apollo/client';

import { EditableContext } from 'common/utils';
import { CustomSet, Item, ItemSlot } from 'common/type-aliases';
import ItemSuggestionsQuery from 'graphql/queries/itemSuggestions.graphql';
import {
  itemSuggestions,
  itemSuggestionsVariables,
} from 'graphql/queries/__generated__/itemSuggestions';
import {
  buildItemSuggestionVariables,
  getItemSuggestionRequestKey,
  getVisibleItemSuggestions,
  groupItemSuggestionsBySlot,
  ItemSuggestionResult,
} from './itemSuggestionUtils';

export const useItemSuggestions = (
  customSet: CustomSet | null | undefined,
  itemSlots: Array<ItemSlot> | undefined,
) => {
  const client = useApolloClient();
  const isEditable = useContext(EditableContext);
  const retryCounts = useRef<Record<string, number>>({});
  const failedRequestKeys = useRef<Set<string>>(new Set());
  const [retryToken, setRetryToken] = useState(0);
  const [result, setResult] = useState<ItemSuggestionResult<Item> | null>(null);

  const request = useMemo(() => {
    if (!customSet || !itemSlots?.length) return null;
    const variables = buildItemSuggestionVariables(
      customSet.level,
      customSet.equippedItems,
      itemSlots,
    );
    if (variables.equippedItemIds.length === 0) return null;

    return {
      key: getItemSuggestionRequestKey(customSet.id, variables, itemSlots),
      slots: itemSlots,
      variables,
    };
  }, [customSet, itemSlots]);

  useEffect(() => {
    if (!isEditable || !request) return;
    let active = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    client
      .query<itemSuggestions, itemSuggestionsVariables>({
        query: ItemSuggestionsQuery,
        variables: request.variables,
        fetchPolicy: 'cache-first',
        context: { suppressNetworkErrorNotification: true },
      })
      .then(({ data }) => {
        if (active) {
          setResult({
            requestKey: request.key,
            suggestionsBySlot: groupItemSuggestionsBySlot(
              request.slots,
              data.itemSuggestions,
            ),
          });
          delete retryCounts.current[request.key];
          failedRequestKeys.current.delete(request.key);
        }
      })
      .catch(() => {
        if (active && (retryCounts.current[request.key] ?? 0) < 1) {
          retryCounts.current[request.key] = 1;
          retryTimer = setTimeout(() => setRetryToken((value) => value + 1), 5000);
        } else if (active) {
          failedRequestKeys.current.add(request.key);
        }
      });

    return () => {
      active = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [client, isEditable, request?.key, retryToken]);

  useEffect(() => {
    if (!isEditable || !request || typeof window === 'undefined') return;

    const retryAfterReconnect = () => {
      if (!failedRequestKeys.current.has(request.key)) return;

      failedRequestKeys.current.delete(request.key);
      retryCounts.current[request.key] = 0;
      setRetryToken((value) => value + 1);
    };

    window.addEventListener('online', retryAfterReconnect);
    return () => window.removeEventListener('online', retryAfterReconnect);
  }, [isEditable, request?.key]);

  return getVisibleItemSuggestions(
    isEditable ? request?.key ?? null : null,
    result,
  );
};
