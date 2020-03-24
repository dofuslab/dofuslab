/** @jsx jsx */

import * as React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import { Stat } from '__generated__/globalTypes';
import { mq, DEBOUNCE_INTERVAL } from 'common/constants';
import Search from 'antd/lib/input/Search';
import InputNumber from 'antd/lib/input-number';
import Select from 'antd/lib/select';
import Button from 'antd/lib/button';
import Switch from 'antd/lib/switch';
import { useTranslation } from 'i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo, faCubes, faCube } from '@fortawesome/free-solid-svg-icons';
import { SharedFilterAction, SharedFilters } from 'common/types';
import { useDebounceCallback } from '@react-hook/debounce';
import Tooltip from 'antd/lib/tooltip';

const { Option } = Select;

interface IProps {
  filters: SharedFilters;
  dispatch: React.Dispatch<SharedFilterAction>;
  customSetLevel: number | null;
  showSets: boolean;
  setShowSets: React.Dispatch<React.SetStateAction<boolean>>;
  // selectorDivRef: React.MutableRefObject<HTMLDivElement | null>;
}

const SelectorFilters: React.FC<IProps> = ({
  filters: { stats },
  dispatch,
  customSetLevel,
  showSets,
  setShowSets,
  // selectorDivRef,
}) => {
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

  const { t } = useTranslation(['common', 'stat']);

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        marginBottom: 12,
        [mq[2]]: {
          flexDirection: 'row',
        },
        [mq[4]]: {
          marginBottom: 20,
        },
      }}
    >
      <div
        css={{
          display: 'flex',
          marginBottom: 16,
          [mq[2]]: { marginBottom: 0, maxWidth: 360 },
          flex: '1',
          alignItems: 'center',
        }}
      >
        <Tooltip title={t(showSets ? 'VIEW_ITEMS' : 'VIEW_SETS')}>
          <Switch
            checkedChildren={<FontAwesomeIcon icon={faCubes} />}
            unCheckedChildren={<FontAwesomeIcon icon={faCube} />}
            css={{ marginRight: 20 }}
            checked={showSets}
            onChange={setShowSets}
          />
        </Tooltip>
        <Search
          placeholder="Search"
          value={search}
          onChange={onSearch}
          css={{ ['.ant-input']: { fontSize: '0.75rem' } }}
        />
        <InputNumber
          placeholder={t('LEVEL')}
          value={maxLevel}
          onChange={onChangeMaxLevel}
          type="number"
          max={200}
          min={1}
          css={{
            alignSelf: 'stretch',
            marginLeft: 12,
            [mq[4]]: { marginLeft: 16 },
            fontSize: '0.75rem',
          }}
        />
      </div>
      <div
        css={{
          gridColumn: '1 / -1',
          display: 'flex',
          flex: '1',
          flexDirection: 'column',
          [mq[2]]: { flexDirection: 'row', marginLeft: 12, maxWidth: 420 },
          [mq[4]]: { marginLeft: 16 },
        }}
      >
        <ClassNames>
          {({ css }) => (
            <Select
              getPopupContainer={(node: HTMLElement) => node.parentElement!}
              mode="multiple"
              css={{
                fontSize: '0.75rem',
                flex: '1',
              }}
              placeholder="Stats (e.g. AP, Pods, Prospecting)"
              value={stats.map(stat => ({
                label: t(stat, { ns: 'stat' }),
                key: stat,
                value: stat,
              }))}
              onChange={onChangeStats}
              dropdownClassName={css({
                ['.ant-select-item']: { fontSize: '0.75rem' },
              })}
              filterOption={(input, option) =>
                (option?.children as string)
                  .toLocaleUpperCase()
                  .includes(input.toLocaleUpperCase())
              }
              labelInValue
            >
              {Object.values(Stat).map(stat => (
                <Option key={stat} value={stat}>
                  {t(stat, { ns: 'stat' })}
                </Option>
              ))}
            </Select>
          )}
        </ClassNames>
        <Button
          css={{
            fontSize: '0.75rem',
            marginTop: 12,
            height: 42,
            [mq[2]]: {
              marginTop: 0,
              marginLeft: 12,
              height: 'auto',
            },
            [mq[4]]: { marginLeft: 20 },
          }}
          onClick={onResetFilters}
        >
          <FontAwesomeIcon icon={faRedo} css={{ marginRight: 8 }} />
          {t('RESET_ALL_FILTERS')}
        </Button>
      </div>
    </div>
  );
};

export default SelectorFilters;
