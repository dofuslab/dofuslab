/** @jsx jsx */

import * as React from 'react';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import CheckboxGroup, { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { jsx, ClassNames } from '@emotion/core';
import { useDebounceCallback } from '@react-hook/debounce';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo } from '@fortawesome/free-solid-svg-icons';

import { ItemFilters, Stat } from '__generated__/globalTypes';
import { FilterAction } from 'common/types';
import { DEBOUNCE_INTERVAL, mq } from 'common/constants';
import { useTranslation } from 'i18n';
import { itemSlots_itemSlots_itemTypes } from 'graphql/queries/__generated__/itemSlots';
import SelectorFilters from './SelectorFilters';

const { Search } = Input;
const { Option } = Select;

interface IProps {
  filters: ItemFilters;
  dispatch: React.Dispatch<FilterAction>;
  customSetLevel: number | null;
  itemTypes: Array<itemSlots_itemSlots_itemTypes>;
}

const ItemSelectorFilters: React.FC<IProps> = ({
  filters: { itemTypeIds, stats },
  dispatch,
  customSetLevel,
  itemTypes,
}) => {
  const { t } = useTranslation(['common', 'stat']);
  const [search, setSearch] = React.useState('');
  const [maxLevel, setMaxLevel] = React.useState(customSetLevel || 200);
  const handleSearchChange = React.useCallback(
    (searchValue: string) => {
      dispatch({ type: 'SEARCH', search: searchValue });
    },
    [dispatch],
  );

  const debouncedSearch = useDebounceCallback(
    handleSearchChange,
    DEBOUNCE_INTERVAL,
  );

  const onSearch = React.useCallback(
    (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(changeEvent.currentTarget.value);
      debouncedSearch(changeEvent.currentTarget.value);
    },
    [debouncedSearch, setSearch],
  );

  const handleMaxLevelChange = React.useCallback(
    (maxLevel: number) => {
      dispatch({ type: 'MAX_LEVEL', maxLevel });
    },
    [dispatch],
  );

  const debouncedUpdateLevel = useDebounceCallback(
    handleMaxLevelChange,
    DEBOUNCE_INTERVAL,
  );

  const onChangeMaxLevel = React.useCallback(
    (maxLevel: number | undefined) => {
      if (maxLevel) {
        setMaxLevel(maxLevel);
        debouncedUpdateLevel(maxLevel);
      }
    },
    [debouncedUpdateLevel, setMaxLevel],
  );

  const onChangeItemTypeIds = React.useCallback(
    (itemTypeIds: Array<CheckboxValueType>) =>
      dispatch({ type: 'ITEM_TYPE_IDS', itemTypeIds }),
    [dispatch],
  );

  const onChangeStats = React.useCallback(
    (stats: Array<{ label: string; value: Stat }>) => {
      dispatch({ type: 'STATS', stats: stats.map(stat => stat.value) });
    },
    [dispatch],
  );

  const onResetFilters = React.useCallback(() => {
    setSearch('');
    setMaxLevel(customSetLevel || 200);
    dispatch({ type: 'RESET', maxLevel: customSetLevel || 200 });
  }, [dispatch, setMaxLevel, setSearch]);

  return (
    <>
      <SelectorFilters
        search={search}
        onSearch={onSearch}
        maxLevel={maxLevel}
        onChangeMaxLevel={onChangeMaxLevel}
        stats={stats}
        onChangeStats={onChangeStats}
        onResetFilters={onResetFilters}
      />
      {itemTypes.length > 1 && (
        <CheckboxGroup
          value={itemTypeIds}
          onChange={onChangeItemTypeIds}
          options={itemTypes
            .sort((t1, t2) => t1.name.localeCompare(t2.name))
            .map(type => ({
              label: type.name,
              value: type.id,
            }))}
          css={{
            gridColumn: '1 / -1',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            ['.ant-checkbox-group-item']: {
              flex: '0 1 120px',
              minWidth: 0,
              marginTop: 4,
              fontSize: '0.75rem',
              ['&:last-of-type']: {
                marginRight: 8,
              },
            },
          }}
        />
      )}
    </>
  );
};

export default ItemSelectorFilters;
