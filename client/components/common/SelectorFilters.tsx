/** @jsx jsx */

import * as React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import { Stat } from '__generated__/globalTypes';
import { mq, DEBOUNCE_INTERVAL, SEARCH_BAR_ID } from 'common/constants';
import Search from 'antd/lib/input/Search';
import InputNumber from 'antd/lib/input-number';
import Select from 'antd/lib/select';
import Button from 'antd/lib/button';
import Switch from 'antd/lib/switch';
import { useTranslation } from 'i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCubes,
  faCube,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { SharedFilterAction, SharedFilters } from 'common/types';
import { useDebounceCallback } from '@react-hook/debounce';
import Tooltip from 'antd/lib/tooltip';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Media } from './Media';
import ResetAllButton from './ResetAllButton';

const { Option } = Select;

interface IProps {
  filters: SharedFilters;
  dispatch: React.Dispatch<SharedFilterAction>;
  customSetLevel: number | null;
  showSets: boolean;
  setShowSets: React.Dispatch<React.SetStateAction<boolean>>;
  onReset: () => void;
}

const SelectorFilters: React.FC<IProps> = ({
  filters: { stats },
  dispatch,
  customSetLevel,
  showSets,
  setShowSets,
  onReset,
}) => {
  const router = useRouter();
  const { customSetId } = router.query;
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

  const { t } = useTranslation(['common', 'stat']);

  return (
    <div
      css={{
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
          marginBottom: 12,
          flexDirection: 'column',
          [mq[1]]: { flex: 1, flexDirection: 'row' },
          [mq[2]]: { marginBottom: 0, maxWidth: 480 },
          alignItems: 'stretch',
        }}
      >
        <div
          css={{
            display: 'flex',
            fontSize: '0.75rem',
            alignItems: 'center',
            height: 36,
            justifyContent: 'space-between',
            [mq[1]]: {
              height: 'auto',
            },
          }}
        >
          <Media lessThan="xs">
            <Link
              href={{ pathname: '/index', query: { customSetId } }}
              as={customSetId ? `/build/${customSetId}` : '/'}
            >
              <Button size="large" css={{ fontSize: '0.75rem' }}>
                <FontAwesomeIcon icon={faArrowLeft} css={{ marginRight: 12 }} />
                {t('BACK')}
              </Button>
            </Link>
          </Media>
          <div css={{ display: 'flex', alignItems: 'center' }}>
            <span css={{ [mq[1]]: { display: 'none' } }}>{t('ITEMS')}</span>
            <Tooltip title={t(showSets ? 'VIEW_ITEMS' : 'VIEW_SETS')}>
              <Switch
                checkedChildren={<FontAwesomeIcon icon={faCubes} />}
                unCheckedChildren={<FontAwesomeIcon icon={faCube} />}
                css={{ margin: '0 12px', [mq[1]]: { margin: '0 20px 0 0' } }}
                checked={showSets}
                onChange={setShowSets}
              />
            </Tooltip>
            <span css={{ [mq[1]]: { display: 'none' } }}>{t('SETS')}</span>
          </div>
        </div>
        <div
          css={{
            display: 'flex',
            flex: '0 0 42px',
            marginTop: 12,
            [mq[1]]: { flex: '1', marginTop: 0 },
          }}
        >
          <Search
            id={SEARCH_BAR_ID}
            placeholder={t('SEARCH')}
            value={search}
            onChange={onSearch}
            css={{
              '.ant-input': { fontSize: '0.75rem' },
              '.ant-input-suffix': { display: 'flex', alignItems: 'center' },
            }}
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
              display: 'flex',
              alignItems: 'center',
            }}
          />
        </div>
      </div>
      <div
        css={{
          gridColumn: '1 / -1',
          display: 'flex',
          flex: '1',
          flexDirection: 'column',
          [mq[1]]: { flexDirection: 'row' },
          [mq[2]]: { marginLeft: 12, maxWidth: 360 },
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
                flex: '1 1 0%',
                height: 42,
                [mq[1]]: {
                  height: 'auto',
                },
                '.ant-select-selector': {
                  height: '100%',
                },
              }}
              placeholder={t('STATS_PLACEHOLDER')}
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
        <ResetAllButton
          onReset={onReset}
          css={{
            display: 'none',
            [mq[1]]: { display: 'block', margin: '0 0 0 12px' },
          }}
        />
      </div>
    </div>
  );
};

export default SelectorFilters;
