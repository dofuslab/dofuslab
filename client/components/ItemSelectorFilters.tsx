/** @jsx jsx */

import * as React from 'react';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import { jsx } from '@emotion/core';
import { useDebounceCallback } from '@react-hook/debounce';
import { ItemFilters } from '__generated__/globalTypes';
import { FilterAction } from 'common/types';
import { DEBOUNCE_INTERVAL } from 'common/constants';
import { useTranslation } from 'i18n';

const { Search } = Input;

interface IProps {
  filters: ItemFilters;
  dispatch: React.Dispatch<FilterAction>;
  customSetLevel: number | null;
}

const ItemSelectorFilters: React.FC<IProps> = ({
  dispatch,
  customSetLevel,
}) => {
  const { t } = useTranslation('common');
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
      console.log(typeof maxLevel);
      if (maxLevel) {
        setMaxLevel(maxLevel);
        debouncedUpdateLevel(maxLevel);
      }
    },
    [debouncedUpdateLevel, setMaxLevel],
  );
  return (
    <div
      css={{
        gridColumn: '1 / -1',
        display: 'flex',
      }}
    >
      <Search placeholder="Search" value={search} onChange={onSearch}></Search>
      <InputNumber
        placeholder={t('LEVEL')}
        value={maxLevel}
        onChange={onChangeMaxLevel}
        type="number"
        max={200}
        min={1}
        css={{ marginLeft: 16 }}
      />
    </div>
  );
};

export default ItemSelectorFilters;
