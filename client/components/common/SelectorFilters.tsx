/** @jsx jsx */

import * as React from 'react';
import { ClassNames, jsx } from '@emotion/core';
import { Stat } from '__generated__/globalTypes';
import { mq, DEBOUNCE_INTERVAL, SEARCH_BAR_ID } from 'common/constants';
import { Select, Input, InputNumber, Button, Switch } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  faCubes,
  faCube,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { useDebounceCallback } from '@react-hook/debounce';
import { useTheme } from 'emotion-theming';

import { Theme, SharedFilterAction, SharedFilters } from 'common/types';

import { useTranslation } from 'i18n';
import Tooltip from 'components/common/Tooltip';
import ResetAllButton from './ResetAllButton';

const { Search } = Input;
const { Option } = Select;

interface Props {
  filters: SharedFilters;
  dispatch: React.Dispatch<SharedFilterAction>;
  customSetLevel: number | null;
  showSets: boolean;
  setShowSets: React.Dispatch<React.SetStateAction<boolean>>;
  onReset: () => void;
  shouldShowBack?: boolean;
  isMobile: boolean;
}

const SelectorFilters: React.FC<Props> = ({
  filters: { stats },
  dispatch,
  customSetLevel,
  showSets,
  setShowSets,
  onReset,
  shouldShowBack,
  isMobile,
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
    (max: number) => {
      dispatch({ type: 'MAX_LEVEL', maxLevel: max });
    },
    [dispatch],
  );

  const debouncedUpdateLevel = useDebounceCallback(
    handleMaxLevelChange,
    DEBOUNCE_INTERVAL,
  );

  const onChangeMaxLevel = React.useCallback(
    (max: number | undefined) => {
      if (max) {
        setMaxLevel(max);
        debouncedUpdateLevel(max);
      }
    },
    [debouncedUpdateLevel, setMaxLevel],
  );

  const onChangeStats = React.useCallback(
    (s: Array<{ label: string; value: Stat }>) => {
      dispatch({ type: 'STATS', stats: s.map((stat) => stat.value) });
    },
    [dispatch],
  );

  const onResetAll = React.useCallback(() => {
    onReset();
    setSearch('');
  }, [onReset]);

  const { t } = useTranslation(['common', 'stat']);

  const theme = useTheme<Theme>();

  let searchId = showSets ? 'sets-search' : SEARCH_BAR_ID;
  if (isMobile) searchId = `${searchId}-mobile`;

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
            alignItems: 'center',
            height: 36,
            fontSize: '0.75rem',
            justifyContent: 'space-between',
            [mq[1]]: {
              height: 'auto',
            },
          }}
        >
          {shouldShowBack && (
            <Link
              href={{ pathname: '/index', query: { customSetId } }}
              as={customSetId ? `/build/${customSetId}/` : '/'}
              passHref
            >
              <a>
                <Button
                  size="large"
                  css={{ fontSize: '0.75rem', [mq[1]]: { marginRight: 20 } }}
                >
                  <FontAwesomeIcon
                    icon={faArrowLeft}
                    css={{ marginRight: 12 }}
                  />
                  {t('BACK')}
                </Button>
              </a>
            </Link>
          )}
          <div css={{ display: 'flex', alignItems: 'center' }}>
            <span css={{ [mq[1]]: { display: 'none' } }}>{t('ITEMS')}</span>
            <Tooltip title={t(showSets ? 'VIEW_ITEMS' : 'VIEW_SETS')}>
              <Switch
                checkedChildren={<FontAwesomeIcon icon={faCubes} />}
                unCheckedChildren={<FontAwesomeIcon icon={faCube} />}
                css={{
                  margin: '0 12px',
                  [mq[1]]: { margin: '0 20px 0 0' },
                  background: theme.switch?.background,
                  '.ant-switch-inner': {
                    color: theme.text?.default,
                  },
                  '&::after': {
                    background: theme.switch?.button,
                  },
                }}
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
            id={searchId}
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
          [mq[2]]: { marginLeft: 12, maxWidth: 420 },
          [mq[4]]: { marginLeft: 16 },
        }}
      >
        <ClassNames>
          {({ css }) => (
            <Select
              getPopupContainer={(node: HTMLElement) => {
                if (node.parentElement) {
                  return node.parentElement;
                }
                return document && document.body;
              }}
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
              value={stats.map((stat) => ({
                label: t(stat, { ns: 'stat' }),
                key: stat,
                value: stat,
              }))}
              onChange={onChangeStats}
              dropdownClassName={css({
                '.ant-select-item': { fontSize: '0.75rem' },
              })}
              filterOption={(input, option) =>
                (option?.children as string)
                  .toLocaleUpperCase()
                  .includes(input.toLocaleUpperCase())
              }
              labelInValue
            >
              {Object.values(Stat)
                .sort((s1, s2) =>
                  t(s1, { ns: 'stat' }).localeCompare(
                    t(s2, { ns: 'stat' }),
                    undefined,
                    { ignorePunctuation: true },
                  ),
                )
                .map((stat) => (
                  <Option key={stat} value={stat}>
                    {t(stat, { ns: 'stat' })}
                  </Option>
                ))}
            </Select>
          )}
        </ClassNames>
        <ResetAllButton
          onReset={onResetAll}
          css={{
            display: 'none',
            [mq[1]]: { display: 'block', margin: '0 0 0 12px' },
            [mq[4]]: { marginLeft: 20 },
          }}
        />
      </div>
    </div>
  );
};

export default SelectorFilters;
