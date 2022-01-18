/** @jsx jsx */

import * as React from 'react';
import { ClassNames, jsx } from '@emotion/core';
import { Stat } from '__generated__/globalTypes';
import {
  mq,
  DEBOUNCE_INTERVAL,
  SEARCH_BAR_ID,
  SETS_SEARCH_BAR_ID,
} from 'common/constants';
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
import { antdSelectFilterOption, getBuildLink } from 'common/utils';
import { ItemSlot, CustomSet } from 'common/type-aliases';
import { inputFontSize } from 'common/mixins';

import ResetAllButton from './ResetAllButton';
import FavoritesButton from './FavoritesButton';
import NoSSR from 'react-no-ssr';

const { Search } = Input;
const { Option } = Select;

interface Props {
  filters: SharedFilters;
  dispatch: React.Dispatch<SharedFilterAction>;
  customSet?: CustomSet | null;
  showSets: boolean;
  setShowSets: React.Dispatch<React.SetStateAction<boolean>>;
  onReset: () => void;
  isMobile: boolean;
  isClassic: boolean;
  selectItemSlot?: React.Dispatch<React.SetStateAction<ItemSlot | null>>;
  selectedItemSlot: ItemSlot | null;
}

const SelectorFilters: React.FC<Props> = ({
  filters: { stats },
  dispatch,
  customSet,
  showSets,
  setShowSets,
  onReset,
  selectedItemSlot,
  isMobile,
  isClassic,
  selectItemSlot,
}) => {
  const router = useRouter();
  const { customSetId: customSetIdParam } = router.query;
  const customSetId = Array.isArray(customSetIdParam)
    ? customSetIdParam[0]
    : customSetIdParam;
  const [search, setSearch] = React.useState('');
  const [maxLevel, setMaxLevel] = React.useState(customSet?.level || 200);
  const searchRef = React.useRef<Input>(null);
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
    (max: number | string | undefined) => {
      if (typeof max !== 'number') {
        return;
      }
      setMaxLevel(max);
      debouncedUpdateLevel(max);
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

  let searchId = showSets ? SETS_SEARCH_BAR_ID : SEARCH_BAR_ID;
  if (isMobile) searchId = `${searchId}-mobile`;

  React.useEffect(() => {
    const searchBar = searchRef.current?.input;
    const searchOnKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
        return;
      }

      if (e.key === 'Escape' && searchBar) {
        searchBar.blur();
      }
    };

    if (searchBar) {
      searchBar.addEventListener('keydown', searchOnKeyDown);
    }

    return () => {
      if (searchBar) {
        searchBar.removeEventListener('keydown', searchOnKeyDown);
      }
    };
  }, []);

  const buildLink = getBuildLink(customSetId);

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        [mq[3]]: {
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
          [mq[3]]: { marginBottom: 0, maxWidth: 480 },
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
          {(isMobile || isClassic) && (
            <Link href={buildLink.href} as={buildLink.as} passHref>
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
            onKeyDown={(e) => {
              // prevents triggering SetBuilderKeyboardShortcuts
              e.nativeEvent.stopPropagation();
            }}
            css={{
              maxHeight: 'none',
              '.ant-input': inputFontSize,
              '.ant-input-suffix': { display: 'flex', alignItems: 'center' },
            }}
            ref={searchRef}
          />
          <InputNumber
            placeholder={t('LEVEL')}
            value={maxLevel}
            onChange={onChangeMaxLevel}
            type="number"
            max={200}
            min={1}
            css={{
              ...inputFontSize,
              alignSelf: 'stretch',
              marginLeft: 12,
              [mq[4]]: { marginLeft: 16 },
              display: 'flex',
              alignItems: 'center',
            }}
            onKeyDown={(e) => {
              // prevents triggering SetBuilderKeyboardShortcuts
              e.nativeEvent.stopPropagation();
            }}
          />
        </div>
      </div>
      <div
        css={{
          gridColumn: '1 / -1',
          display: 'flex',
          flexDirection: 'column',
          [mq[1]]: {
            flexDirection: 'row',
            height: isClassic ? 40 : 'auto',
          },
          [mq[3]]: { marginLeft: 12, maxWidth: 600, flex: '2 1 0' },
          [mq[4]]: { marginLeft: 16 },
        }}
      >
        <ClassNames>
          {({ css }) => (
            // https://github.com/ant-design/ant-design/issues/30396
            <NoSSR>
              <Select
                getPopupContainer={(node: HTMLElement) => {
                  if (node.parentElement) {
                    return node.parentElement;
                  }
                  return document && document.body;
                }}
                mode="multiple"
                css={{
                  fontSize: '0.9rem',
                  flex: '1 1 0%',
                  height: 42,
                  [mq[1]]: {
                    fontSize: '0.75rem',
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
                filterOption={antdSelectFilterOption}
                labelInValue
                onKeyDown={(e) => {
                  // prevents triggering SetBuilderKeyboardShortcuts
                  e.nativeEvent.stopPropagation();
                }}
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
            </NoSSR>
          )}
        </ClassNames>
        <ResetAllButton
          onReset={onResetAll}
          css={{
            display: 'none',
            [mq[1]]: { display: 'block', margin: '0 0 0 12px' },
            [mq[4]]: { marginLeft: 16, height: 'auto' },
          }}
        />
        <FavoritesButton
          css={{
            display: 'none',
            [mq[1]]: { display: 'block', margin: '0 0 0 12px' },
            [mq[4]]: { marginLeft: 16, height: 'auto' },
          }}
          showSets={showSets}
          selectItemSlot={selectItemSlot}
          shouldRedirect={isMobile || isClassic}
          customSet={customSet}
          selectedItemSlot={selectedItemSlot}
        />
      </div>
    </div>
  );
};

export default SelectorFilters;
