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
  BuildDiscoveryBuild,
  BuildDiscoveryElement,
  BuildDiscoveryJob,
  BuildDiscoveryImportContext,
  BuildDiscoveryQueryInput,
  DEFAULT_BUILD_DISCOVERY_INPUT,
  buildDiscoveryExoLabels,
  buildDiscoveryHasExos,
  buildDiscoveryHasUnsupportedExos,
  buildDiscoveryImportItems,
  buildDiscoveryItemIds,
  buildDiscoveryRequestPayload,
  buildDiscoveryResultKey,
  formatBuildDiscoveryLabel,
  generatedBuildName,
  generatedExoImportMessage,
  generatedImportBlockMessage,
  parseBuildDiscoveryJob,
  useBuildDiscoveryJobQuery,
  useStartBuildDiscoveryMutation,
} from 'common/buildDiscovery';
import { mq } from 'common/constants';
import { checkAuthentication, navigateToNewCustomSet } from 'common/utils';
import ImportGeneratedCustomSetMutation from 'graphql/mutations/importGeneratedCustomSet.graphql';
import {
  importGeneratedCustomSet,
  importGeneratedCustomSetVariables,
} from 'graphql/mutations/__generated__/importGeneratedCustomSet';
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

function buildDiscoveryJobErrorMessage(job: BuildDiscoveryJob | undefined) {
  if (job?.status !== 'failed') {
    return null;
  }

  const message = job.errorPayload?.message;

  return typeof message === 'string' && message.length > 0
    ? message
    : 'Build Discovery job failed.';
}

function buildDiscoveryJobStatusColor(status: string | undefined) {
  if (status === 'succeeded') {
    return 'green';
  }
  if (status === 'failed') {
    return 'red';
  }
  if (status === 'running') {
    return 'blue';
  }
  return 'gold';
}

function buildDiscoveryJobStatusLabel(job: BuildDiscoveryJob | undefined) {
  if (!job?.status) {
    return null;
  }

  const status = formatBuildDiscoveryLabel(job.status);

  return typeof job.progress === 'number' &&
    job.progress > 0 &&
    job.progress < 100
    ? `${status} ${job.progress}%`
    : status;
}

function useOpenBuildDiscoveryBuild(
  build: BuildDiscoveryBuild,
  context: BuildDiscoveryImportContext,
) {
  const router = useRouter();
  const client = useApolloClient();
  const { t } = useTranslation('common');
  const itemIds = useMemo(() => buildDiscoveryItemIds(build), [build]);
  const importInput = useMemo(() => buildDiscoveryImportItems(build), [build]);
  const hasExos = buildDiscoveryHasExos(build);
  const hasUnsupportedExos = buildDiscoveryHasUnsupportedExos(build);
  const hasMissingInternalIds = importInput.hasMissingInternalIds;
  const hasUnmatchedExos = importInput.hasUnmatchedExos;
  const importItemCount = importInput.items.length;
  const [error, setError] = useState<string | null>(null);
  const [importGeneratedCustomSetMutate, { loading: isImporting }] =
    useMutation<importGeneratedCustomSet, importGeneratedCustomSetVariables>(
      ImportGeneratedCustomSetMutation,
      { refetchQueries: () => ['buildList'] },
    );

  const openInBuilder = useCallback(async () => {
    setError(null);
    gtag.event({
      action: 'build_discovery_open_builder_attempt',
      category: 'Build Discovery',
      label: buildDiscoveryResultKey(build),
      value: itemIds.length,
    });
    const ok = await checkAuthentication(client, t);

    if (
      !ok ||
      importItemCount === 0 ||
      hasMissingInternalIds ||
      hasUnsupportedExos ||
      hasUnmatchedExos
    ) {
      return;
    }

    try {
      const { data } = await importGeneratedCustomSetMutate({
        variables: {
          items: importInput.items,
          name: generatedBuildName(build, context),
          level: 200,
          source: 'build_discovery',
          datasetVersion: context.datasetVersion,
          solverVersion: context.solverVersion,
          requestPayload: buildDiscoveryRequestPayload(build, context),
        },
      });
      const customSet = data?.importGeneratedCustomSet?.customSet;

      if (!customSet) {
        throw new Error('Could not create build.');
      }

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
      gtag.event({
        action: 'build_discovery_open_builder_error',
        category: 'Build Discovery',
        label: 'generated_import_failed',
        value: itemIds.length,
      });
    }
  }, [
    build,
    client,
    context,
    hasMissingInternalIds,
    hasUnsupportedExos,
    hasUnmatchedExos,
    importGeneratedCustomSetMutate,
    importInput,
    importItemCount,
    itemIds,
    router,
    t,
  ]);

  return {
    error,
    hasExos,
    hasMissingInternalIds,
    hasUnsupportedExos,
    hasUnmatchedExos,
    importItemCount,
    loading: isImporting,
    openInBuilder,
  };
}

function BuildDiscoveryResult({
  build,
  importContext,
  index,
}: {
  build: BuildDiscoveryBuild;
  importContext: BuildDiscoveryImportContext;
  index: number;
}) {
  const itemEntries = Object.entries(build.items ?? {});
  const totalEntries = sortedTotals(build.totals);
  const exoLabels = buildDiscoveryExoLabels(build);
  const {
    error: openError,
    hasExos,
    hasMissingInternalIds,
    hasUnsupportedExos,
    hasUnmatchedExos,
    importItemCount,
    loading: isOpening,
    openInBuilder,
  } = useOpenBuildDiscoveryBuild(build, importContext);
  const importBlockMessage = generatedImportBlockMessage(
    hasMissingInternalIds,
    hasUnsupportedExos,
    hasUnmatchedExos,
  );

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
          disabled={
            importItemCount === 0 ||
            hasMissingInternalIds ||
            hasUnsupportedExos ||
            hasUnmatchedExos
          }
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
          type={importBlockMessage ? 'warning' : 'info'}
          message={
            importBlockMessage ??
            generatedExoImportMessage(hasUnsupportedExos, hasUnmatchedExos)
          }
          showIcon
          css={{ marginBottom: 12 }}
        />
      )}
      {importBlockMessage && !hasExos && (
        <Alert
          type="warning"
          message={importBlockMessage}
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
  const [displayedJob, setDisplayedJob] = useState<{
    input: BuildDiscoveryQueryInput;
    job: BuildDiscoveryJob;
  } | null>(null);
  const latestRunId = useRef(0);

  const queryInput = useMemo<BuildDiscoveryQueryInput>(
    () => ({
      ...(submittedInput ?? DEFAULT_BUILD_DISCOVERY_INPUT),
      className: 'Iop',
      level: 200,
      mode: 'pvm',
    }),
    [submittedInput],
  );

  const { error, loading, startBuildDiscovery } =
    useStartBuildDiscoveryMutation();
  const buildDiscoveryJobId = displayedJob?.job.id;
  const buildDiscoveryJob = displayedJob?.job;
  const shouldPollJob =
    Boolean(buildDiscoveryJobId) &&
    buildDiscoveryJob?.status !== 'succeeded' &&
    buildDiscoveryJob?.status !== 'failed';
  const {
    buildDiscoveryJob: refreshedJob,
    error: jobLookupError,
    loading: isJobLookupLoading,
  } = useBuildDiscoveryJobQuery(buildDiscoveryJobId, {
    fetchPolicy: 'cache-and-network',
    pollInterval: shouldPollJob ? 2000 : 0,
  });
  const buildDiscovery = displayedJob?.job.result;
  const hasBuilds = Boolean(buildDiscovery?.builds.length);
  const jobErrorMessage = buildDiscoveryJobErrorMessage(buildDiscoveryJob);
  const jobStatusLabel = buildDiscoveryJobStatusLabel(buildDiscoveryJob);
  const showInitialLoading =
    (loading || shouldPollJob || isJobLookupLoading) &&
    !buildDiscovery &&
    !jobLookupError;
  const lastTrackedResultsKey = useRef<string | null>(null);

  const runBuildDiscovery = useCallback(
    async (nextInput: BuildDiscoveryQueryInput) => {
      const runId = latestRunId.current + 1;
      latestRunId.current = runId;
      setSubmittedInput(nextInput);
      setDisplayedJob(null);
      try {
        const result = await startBuildDiscovery({
          ...nextInput,
          className: 'Iop',
          level: 200,
          mode: 'pvm',
        });
        if (latestRunId.current !== runId) {
          return;
        }
        const job = parseBuildDiscoveryJob(
          result.data?.startBuildDiscovery?.job,
        );
        if (job) {
          setDisplayedJob({ input: nextInput, job });
        }
      } catch {
        if (latestRunId.current === runId) {
          setDisplayedJob(null);
        }
      }
    },
    [startBuildDiscovery],
  );

  useEffect(() => {
    if (!refreshedJob?.id) {
      return;
    }

    setDisplayedJob((current) => {
      if (!current || current.job.id !== refreshedJob.id) {
        return current;
      }

      return { ...current, job: refreshedJob };
    });
  }, [refreshedJob]);

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
          {jobStatusLabel && (
            <Tag
              color={buildDiscoveryJobStatusColor(buildDiscoveryJob?.status)}
            >
              {jobStatusLabel}
            </Tag>
          )}
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
          {buildDiscoveryJob?.asyncRecommended && (
            <Tag color="orange">async recommended</Tag>
          )}
          {buildDiscoveryJob?.syncRecommended && (
            <Tag color="green">sync ready</Tag>
          )}
          <Button
            aria-label="Refresh build discovery"
            disabled={submittedInput === null}
            icon={<ReloadOutlined />}
            loading={loading || isJobLookupLoading}
            onClick={() => {
              gtag.event({
                action: 'build_discovery_refresh',
                category: 'Build Discovery',
                label: submittedInput?.element,
              });
              runBuildDiscovery(queryInput);
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
          <div css={{ fontSize: '0.7rem', marginBottom: 4 }}>Min AP</div>
          <InputNumber
            aria-label="Minimum AP target"
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
          <div css={{ fontSize: '0.7rem', marginBottom: 4 }}>Min MP</div>
          <InputNumber
            aria-label="Minimum MP target"
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
          <div css={{ fontSize: '0.7rem', marginBottom: 4 }}>Min Range</div>
          <InputNumber
            aria-label="Minimum Range target"
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
            runBuildDiscovery(input);
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
      {jobLookupError && (
        <Alert type="error" message={jobLookupError.message} showIcon />
      )}
      {jobErrorMessage && (
        <Alert type="error" message={jobErrorMessage} showIcon />
      )}
      {buildDiscovery?.warnings.map((warning) => (
        <Alert key={warning} type="warning" message={warning} showIcon />
      ))}
      <section css={{ display: 'grid', gap: 12 }}>
        {showInitialLoading && <Skeleton active paragraph={{ rows: 8 }} />}
        {!showInitialLoading &&
          hasBuilds &&
          buildDiscovery?.builds.map((build, index) => (
            <BuildDiscoveryResult
              key={buildDiscoveryResultKey(build)}
              build={build}
              importContext={{
                datasetVersion: buildDiscovery.datasetVersion,
                solverVersion: buildDiscovery.solverVersion,
                query: buildDiscovery.query,
                input: displayedJob?.input ?? queryInput,
              }}
              index={index}
            />
          ))}
        {!showInitialLoading &&
          submittedInput !== null &&
          !hasBuilds &&
          !jobErrorMessage && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      </section>
    </main>
  );
}
