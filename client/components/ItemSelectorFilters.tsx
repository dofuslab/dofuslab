/** @jsx jsx */

import * as React from 'react';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import Select from 'antd/lib/select';
import CheckboxGroup, { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { jsx } from '@emotion/core';
import { useDebounceCallback } from '@react-hook/debounce';
import { ItemFilters, Stat } from '__generated__/globalTypes';
import { FilterAction } from 'common/types';
import { DEBOUNCE_INTERVAL, mq } from 'common/constants';
import { useTranslation } from 'i18n';
import { itemSlots_itemSlots_itemTypes } from 'graphql/queries/__generated__/itemSlots';

const { Search } = Input;
const { Option } = Select;

interface IProps {
  filters: ItemFilters;
  dispatch: React.Dispatch<FilterAction>;
  customSetLevel: number | null;
  itemTypes: ReadonlyArray<itemSlots_itemSlots_itemTypes>;
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
    (stats: Array<Stat>) => dispatch({ type: 'STATS', stats }),
    [dispatch],
  );

  return (
    <>
      <div
        css={{
          gridColumn: '1 / -1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          [mq[2]]: {
            flexDirection: 'row',
          },
        }}
      >
        <div
          css={{
            display: 'flex',
            marginBottom: 16,
            [mq[2]]: { marginBottom: 0 },
            flex: '1',
          }}
        >
          <Search placeholder="Search" value={search} onChange={onSearch} />
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
        <Select
          mode="multiple"
          css={{
            gridColumn: '1 / -1',
            flex: '1',
            [mq[2]]: { marginLeft: 16 },
          }}
          placeholder="Stats (e.g. AP, Pods, Prospecting)"
          value={stats}
          onChange={onChangeStats}
        >
          {Object.values(Stat).map(stat => (
            <Option key={stat} value={stat}>
              {t(stat, { ns: 'stat' })}
            </Option>
          ))}
        </Select>
      </div>

      {itemTypes.length > 1 && (
        <CheckboxGroup
          value={itemTypeIds}
          onChange={onChangeItemTypeIds}
          options={itemTypes.map(type => ({
            label: type.name,
            value: type.id,
          }))}
          css={{
            gridColumn: '1 / -1',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            ['.ant-checkbox-group-item']: {
              flex: '1 1 120px',
              minWidth: 0,
              ['&:last-child']: {
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
