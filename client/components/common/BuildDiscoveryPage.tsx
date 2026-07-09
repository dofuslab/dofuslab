/** @jsxImportSource @emotion/react */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { useTheme } from '@emotion/react';
import {
  Alert,
  Button,
  Empty,
  InputNumber,
  Select,
  Skeleton,
  Space,
  Tag,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import {
  BUILD_DISCOVERY_EXO_STAT_MAP,
  BuildDiscoveryBuild,
  BuildDiscoveryElement,
  BuildDiscoveryQueryInput,
  DEFAULT_BUILD_DISCOVERY_INPUT,
  buildDiscoveryExoLabels,
  buildDiscoveryHasExos,
  buildDiscoveryHasUnsupportedExos,
  buildDiscoveryItemIds,
  buildDiscoveryNumberedSlotParts,
  formatBuildDiscoveryLabel,
  normalizeBuildDiscoverySlotName,
  useBuildDiscoveryQuery,
} from 'common/buildDiscovery';
import { mq } from 'common/constants';
import { checkAuthentication, navigateToNewCustomSet } from 'common/utils';
import { Stat } from '__generated__/globalTypes';
import EquipItemsMutation from 'graphql/mutations/equipItems.graphql';
import {
  equipItems,
  equipItemsVariables,
} from 'graphql/mutations/__generated__/equipItems';
import SetEquippedItemExoMutation from 'graphql/mutations/setEquippedItemExo.graphql';
import {
  setEquippedItemExo,
  setEquippedItemExoVariables,
} from 'graphql/mutations/__generated__/setEquippedItemExo';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as gtag from 'gtag';

const elementOptions: Array<{
  label: string;
  value: BuildDiscoveryElement;
}> = [
  { label: 'Strength', value: 'strength' },
  { label: 'Intelligence', value: 'intelligence' },
  { label: 'Chance', value: 'chance' },
  { label: 'Agility', value: 'agility' },
];

const budgetOptions = [
  { label: 'Tier 1', value: 1 },
  { label: 'Tier 2', value: 2 },
  { label: 'Tier 3', value: 3 },
  { label: 'Tier 4', value: 4 },
];

const exoOptions = [
  { label: 'Allow', value: 'allow' },
  { label: 'None', value: 'none' },
];

const weaponOptions = [
  { label: 'Stat stick allowed', value: 'stat_stick_allowed' },
  { label: 'Weapon damage allowed', value: 'weapon_damage_allowed' },
];

const limitOptions = [
  { label: '3', value: 3 },
  { label: '5', value: 5 },
];

const defaultApTarget = 11;
const defaultMpTarget = 6;
const defaultRangeTarget = 0;

const statOrder = [
  'ap',
  'mp',
  'range',
  'vitality',
  'strength',
  'intelligence',
  'chance',
  'agility',
  'power',
  'critical_hits',
  'summons',
  'prospecting',
];

const exoStatMap: Record<keyof typeof BUILD_DISCOVERY_EXO_STAT_MAP, Stat> = {
  AP: Stat.AP,
  MP: Stat.MP,
  Range: Stat.RANGE,
};

function isSupportedExoStat(
  stat: string,
): stat is keyof typeof BUILD_DISCOVERY_EXO_STAT_MAP {
  return Object.prototype.hasOwnProperty.call(
    BUILD_DISCOVERY_EXO_STAT_MAP,
    stat,
  );
}

function numberValue(value: number | null, fallback: number) {
  return typeof value === 'number' ? value : fallback;
}

function formatStatName(stat: string) {
  return formatBuildDiscoveryLabel(stat);
}

function sortedTotals(totals: Record<string, number> = {}) {
  return Object.entries(totals)
    .filter(([, value]) => value !== 0)
    .sort(([left], [right]) => {
      const leftIndex = statOrder.indexOf(left);
      const rightIndex = statOrder.indexOf(right);

      if (leftIndex === -1 && rightIndex === -1) {
        return left.localeCompare(right);
      }

      if (leftIndex === -1) {
        return 1;
      }

      if (rightIndex === -1) {
        return -1;
      }

      return leftIndex - rightIndex;
    });
}

function buildResultKey(build: BuildDiscoveryBuild) {
  const itemIds = Object.values(build.items ?? {})
    .map((item) => item.id ?? item.name ?? 'unknown')
    .join(':');

  return `${build.score ?? 'score'}:${itemIds}`;
}

function useOpenBuildDiscoveryBuild(build: BuildDiscoveryBuild) {
  const router = useRouter();
  const client = useApolloClient();
  const { t } = useTranslation('common');
  const itemIds = useMemo(() => buildDiscoveryItemIds(build), [build]);
  const hasExos = buildDiscoveryHasExos(build);
  const hasUnsupportedExos = buildDiscoveryHasUnsupportedExos(build);
  const [error, setError] = useState<string | null>(null);
  const [equipItemsMutate, { loading: isEquipping }] = useMutation<
    equipItems,
    equipItemsVariables
  >(EquipItemsMutation, {
    refetchQueries: () => ['buildList'],
  });
  const [setEquippedItemExoMutate, { loading: isSettingExos }] = useMutation<
    setEquippedItemExo,
    setEquippedItemExoVariables
  >(SetEquippedItemExoMutation);

  const openInBuilder = useCallback(async () => {
    setError(null);
    gtag.event({
      action: 'build_discovery_open_builder_attempt',
      category: 'Build Discovery',
      label: buildResultKey(build),
      value: itemIds.length,
    });
    const ok = await checkAuthentication(client, t);

    if (!ok || itemIds.length === 0 || hasUnsupportedExos) {
      return;
    }

    let createdCustomSetId: string | null = null;

    try {
      const { data } = await equipItemsMutate({ variables: { itemIds } });
      const customSet = data?.equipMultipleItems?.customSet;

      if (!customSet) {
        throw new Error('Could not create build.');
      }

      createdCustomSetId = customSet.id;

      await Object.entries(build.exos ?? {}).reduce(
        async (previous, [stat, exo]) => {
          await previous;

          const mappedStat = isSupportedExoStat(stat)
            ? exoStatMap[stat]
            : undefined;
          const exoSlot = buildDiscoveryNumberedSlotParts(exo.slot);
          const matchingItems = customSet.equippedItems
            .filter((entry) => entry.item.id === exo.itemId)
            .sort((left, right) => left.slot.order - right.slot.order);
          const exactSlotMatch =
            exoSlot.index === null
              ? matchingItems.find(
                  (entry) =>
                    normalizeBuildDiscoverySlotName(entry.slot.enName) ===
                    exoSlot.family,
                )
              : undefined;
          const familySlotMatches = matchingItems.filter(
            (entry) =>
              buildDiscoveryNumberedSlotParts(entry.slot.enName).family ===
              exoSlot.family,
          );
          const numberedSlotMatch =
            typeof exoSlot.index === 'number'
              ? familySlotMatches[exoSlot.index]
              : undefined;

          const equippedItem =
            exactSlotMatch ?? numberedSlotMatch ?? matchingItems[0];

          if (!mappedStat || !equippedItem) {
            throw new Error('Could not apply generated exos to the build.');
          }

          await setEquippedItemExoMutate({
            variables: {
              equippedItemId: equippedItem.id,
              stat: mappedStat,
              hasStat: true,
            },
          });
        },
        Promise.resolve(),
      );

      gtag.event({
        action: 'build_discovery_open_builder_success',
        category: 'Build Discovery',
        label: customSet.id,
        value: itemIds.length,
      });
      navigateToNewCustomSet(router, customSet.id);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not open build.',
      );
      if (createdCustomSetId !== null) {
        gtag.event({
          action: 'build_discovery_open_builder_partial',
          category: 'Build Discovery',
          label: createdCustomSetId,
          value: itemIds.length,
        });
        navigateToNewCustomSet(router, createdCustomSetId);
      } else {
        gtag.event({
          action: 'build_discovery_open_builder_error',
          category: 'Build Discovery',
          label: 'open_failed_before_build_created',
          value: itemIds.length,
        });
      }
    }
  }, [
    build,
    build.exos,
    client,
    equipItemsMutate,
    hasUnsupportedExos,
    itemIds,
    router,
    setEquippedItemExoMutate,
    t,
  ]);

  return {
    error,
    hasExos,
    hasUnsupportedExos,
    itemIds,
    loading: isEquipping || isSettingExos,
    openInBuilder,
  };
}

function BuildDiscoveryResult({
  build,
  index,
}: {
  build: BuildDiscoveryBuild;
  index: number;
}) {
  const itemEntries = Object.entries(build.items ?? {});
  const totalEntries = sortedTotals(build.totals);
  const exoLabels = buildDiscoveryExoLabels(build);
  const {
    error: openError,
    hasExos,
    hasUnsupportedExos,
    itemIds,
    loading: isOpening,
    openInBuilder,
  } = useOpenBuildDiscoveryBuild(build);

  return (
    <article
      css={(theme) => ({
        border: `1px solid ${theme.border?.default}`,
        background: theme.layer?.background,
        borderRadius: 6,
        padding: 16,
        minWidth: 0,
      })}
    >
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h2 css={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
          Build {index + 1}
        </h2>
        {typeof build.score === 'number' && (
          <Tag color="blue">Score {Math.round(build.score)}</Tag>
        )}
      </div>
      <div css={{ marginBottom: 12 }}>
        <Button
          disabled={itemIds.length === 0 || hasUnsupportedExos}
          loading={isOpening}
          onClick={openInBuilder}
        >
          Open in builder
        </Button>
      </div>
      {exoLabels.length > 0 && (
        <div
          css={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}
        >
          {exoLabels.map((exo) => (
            <Tag
              key={exo.key}
              color="purple"
              css={{
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {exo.label}
            </Tag>
          ))}
        </div>
      )}
      {hasExos && (
        <Alert
          type={hasUnsupportedExos ? 'warning' : 'info'}
          message={
            hasUnsupportedExos
              ? 'Open in builder is disabled for unsupported generated exos.'
              : 'Generated AP/MP/Range exos will be applied after opening this build.'
          }
          showIcon
          css={{ marginBottom: 12 }}
        />
      )}
      {openError && (
        <Alert
          type="error"
          message={openError}
          showIcon
          css={{ marginBottom: 12 }}
        />
      )}
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 16,
          [mq[2]]: {
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(220px, 0.8fr)',
          },
        }}
      >
        <div
          css={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 8,
          }}
        >
          {itemEntries.map(([slot, item]) => (
            <div
              key={slot}
              css={(theme) => ({
                border: `1px solid ${theme.border?.default}`,
                borderRadius: 4,
                padding: '8px 10px',
                minWidth: 0,
              })}
            >
              <div css={{ fontSize: '0.65rem', opacity: 0.65 }}>
                {formatStatName(slot)}
              </div>
              <div
                css={{
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={item.name}
              >
                {item.name ?? item.id ?? 'Unknown item'}
              </div>
              {item.type && (
                <div css={{ fontSize: '0.65rem', opacity: 0.65 }}>
                  {item.type}
                  {typeof item.level === 'number' ? ` - ${item.level}` : ''}
                </div>
              )}
            </div>
          ))}
        </div>
        <div
          css={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))',
            alignContent: 'start',
            gap: 8,
          }}
        >
          {totalEntries.slice(0, 16).map(([stat, value]) => (
            <div
              key={stat}
              css={(theme) => ({
                border: `1px solid ${theme.border?.default}`,
                borderRadius: 4,
                padding: '6px 8px',
              })}
            >
              <div css={{ fontSize: '0.65rem', opacity: 0.65 }}>
                {formatStatName(stat)}
              </div>
              <div css={{ fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function BuildDiscoveryPage() {
  const theme = useTheme();
  const [input, setInput] = useState<BuildDiscoveryQueryInput>({
    ...DEFAULT_BUILD_DISCOVERY_INPUT,
  });
  const [submittedInput, setSubmittedInput] =
    useState<BuildDiscoveryQueryInput | null>(null);

  const queryInput = useMemo<BuildDiscoveryQueryInput>(
    () => ({
      ...(submittedInput ?? DEFAULT_BUILD_DISCOVERY_INPUT),
      className: 'Iop',
      level: 200,
      mode: 'pvm',
    }),
    [submittedInput],
  );

  const { buildDiscovery, loading, error, refetch } = useBuildDiscoveryQuery(
    queryInput,
    { skip: submittedInput === null },
  );
  const hasBuilds = Boolean(buildDiscovery?.builds.length);
  const showInitialLoading = loading && !buildDiscovery;
  const lastTrackedResultsKey = useRef<string | null>(null);

  useEffect(() => {
    if (submittedInput === null || !buildDiscovery) {
      return;
    }

    const resultsKey = `${buildDiscovery.cacheKey ?? 'no-cache-key'}:${
      buildDiscovery.builds.length
    }:${buildDiscovery.cache?.status ?? 'unknown'}`;

    if (resultsKey === lastTrackedResultsKey.current) {
      return;
    }

    lastTrackedResultsKey.current = resultsKey;
    gtag.event({
      action: 'build_discovery_results_shown',
      category: 'Build Discovery',
      label: `${submittedInput.element}:${
        buildDiscovery.cache?.status ?? 'unknown'
      }`,
      value: buildDiscovery.builds.length,
    });
  }, [
    buildDiscovery?.cache?.status,
    buildDiscovery?.cacheKey,
    buildDiscovery?.builds.length,
    submittedInput,
  ]);

  return (
    <main
      css={{
        width: '100%',
        maxWidth: 1280,
        margin: '0 auto',
        padding: '8px 16px 32px',
        display: 'grid',
        gap: 16,
      }}
    >
      <section
        css={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 css={{ margin: 0, fontSize: '1.35rem', fontWeight: 600 }}>
            Build Discovery
          </h1>
          <div css={{ color: theme.text?.light, marginTop: 4 }}>
            Iop - Level 200 - PvM
          </div>
        </div>
        <Space wrap>
          {buildDiscovery?.cache?.status && (
            <Tag
              color={buildDiscovery.cache.status === 'hit' ? 'green' : 'gold'}
            >
              {buildDiscovery.cache.storage ?? 'cache'}{' '}
              {buildDiscovery.cache.status}
            </Tag>
          )}
          {typeof buildDiscovery?.diagnostics.elapsedMs === 'number' && (
            <Tag>{Math.round(buildDiscovery.diagnostics.elapsedMs)} ms</Tag>
          )}
          <Button
            aria-label="Refresh build discovery"
            disabled={submittedInput === null}
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => {
              gtag.event({
                action: 'build_discovery_refresh',
                category: 'Build Discovery',
                label: submittedInput?.element,
              });
              refetch();
            }}
          />
        </Space>
      </section>
      <section
        css={{
          border: `1px solid ${theme.border?.default}`,
          background: theme.layer?.background,
          borderRadius: 6,
          padding: 16,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 12,
          alignItems: 'end',
          [mq[2]]: {
            gridTemplateColumns: 'repeat(6, minmax(120px, 1fr))',
          },
        }}
      >
        <div>
          <div css={{ fontSize: '0.7rem', marginBottom: 4 }}>Element</div>
          <Select
            aria-label="Element"
            css={{ width: '100%' }}
            value={input.element}
            options={elementOptions}
            onChange={(element) =>
              setInput((current) => ({ ...current, element }))
            }
          />
        </div>
        <div>
          <div css={{ fontSize: '0.7rem', marginBottom: 4 }}>AP</div>
          <InputNumber
            aria-label="AP target"
            css={{ width: '100%' }}
            min={6}
            max={12}
            value={input.apTarget}
            onChange={(value) =>
              setInput((current) => ({
                ...current,
                apTarget: numberValue(value, defaultApTarget),
              }))
            }
          />
        </div>
        <div>
          <div css={{ fontSize: '0.7rem', marginBottom: 4 }}>MP</div>
          <InputNumber
            aria-label="MP target"
            css={{ width: '100%' }}
            min={3}
            max={6}
            value={input.mpTarget}
            onChange={(value) =>
              setInput((current) => ({
                ...current,
                mpTarget: numberValue(value, defaultMpTarget),
              }))
            }
          />
        </div>
        <div>
          <div css={{ fontSize: '0.7rem', marginBottom: 4 }}>Range</div>
          <InputNumber
            aria-label="Range target"
            css={{ width: '100%' }}
            min={0}
            max={6}
            value={input.rangeTarget}
            onChange={(value) =>
              setInput((current) => ({
                ...current,
                rangeTarget: numberValue(value, defaultRangeTarget),
              }))
            }
          />
        </div>
        <div>
          <div css={{ fontSize: '0.7rem', marginBottom: 4 }}>Budget</div>
          <Select
            aria-label="Budget tier"
            css={{ width: '100%' }}
            value={input.budgetTier}
            options={budgetOptions}
            onChange={(budgetTier) =>
              setInput((current) => ({ ...current, budgetTier }))
            }
          />
        </div>
        <div>
          <div css={{ fontSize: '0.7rem', marginBottom: 4 }}>Limit</div>
          <Select
            aria-label="Result limit"
            css={{ width: '100%' }}
            value={input.limit}
            options={limitOptions}
            onChange={(limit) => setInput((current) => ({ ...current, limit }))}
          />
        </div>
        <div>
          <div css={{ fontSize: '0.7rem', marginBottom: 4 }}>Exos</div>
          <Select
            aria-label="Exo policy"
            css={{ width: '100%' }}
            value={input.exoPolicy}
            options={exoOptions}
            onChange={(exoPolicy) =>
              setInput((current) => ({ ...current, exoPolicy }))
            }
          />
        </div>
        <div css={{ gridColumn: 'span 2', [mq[1]]: { gridColumn: 'span 2' } }}>
          <div css={{ fontSize: '0.7rem', marginBottom: 4 }}>Weapon</div>
          <Select
            aria-label="Weapon policy"
            css={{ width: '100%' }}
            value={input.weaponPolicy}
            options={weaponOptions}
            onChange={(weaponPolicy) =>
              setInput((current) => ({ ...current, weaponPolicy }))
            }
          />
        </div>
        <Button
          type="primary"
          loading={loading}
          onClick={() => {
            gtag.event({
              action: 'build_discovery_run',
              category: 'Build Discovery',
              label: input.element,
              value: input.budgetTier ?? undefined,
            });
            setSubmittedInput(input);
          }}
          css={{
            gridColumn: 'span 2',
            [mq[2]]: {
              gridColumn: 'span 1',
            },
          }}
        >
          Run
        </Button>
      </section>
      {error && <Alert type="error" message={error.message} showIcon />}
      {buildDiscovery?.warnings.map((warning) => (
        <Alert key={warning} type="warning" message={warning} showIcon />
      ))}
      <section css={{ display: 'grid', gap: 12 }}>
        {showInitialLoading && <Skeleton active paragraph={{ rows: 8 }} />}
        {!showInitialLoading &&
          hasBuilds &&
          buildDiscovery?.builds.map((build, index) => (
            <BuildDiscoveryResult
              key={buildResultKey(build)}
              build={build}
              index={index}
            />
          ))}
        {!showInitialLoading && submittedInput !== null && !hasBuilds && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </section>
    </main>
  );
}
