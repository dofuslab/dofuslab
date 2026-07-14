/** @jsxImportSource @emotion/react */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { useTheme } from '@emotion/react';
import {
  Alert,
  Button,
  Checkbox,
  Empty,
  InputNumber,
  Select,
  Spin,
  Tag,
  Tooltip,
} from 'antd';
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as gtag from 'gtag';

import {
  BuildDiscoveryBuild,
  BuildDiscoveryElement,
  BuildDiscoveryImportContext,
  BuildDiscoveryJob,
  BuildDiscoveryQueryInput,
  DEFAULT_BUILD_DISCOVERY_INPUT,
  buildDiscoveryExoLabels,
  buildDiscoveryHasUnsupportedExos,
  buildDiscoveryImportItems,
  buildDiscoveryRequestPayload,
  buildDiscoveryResultKey,
  formatBuildDiscoveryLabel,
  generatedBuildName,
  generatedImportBlockMessage,
  parseBuildDiscoveryJob,
  useBuildDiscoveryJobQuery,
  useStartBuildDiscoveryMutation,
} from 'common/buildDiscovery';
import { mq, statIcons } from 'common/constants';
import {
  checkAuthentication,
  getImageUrl,
  navigateToNewCustomSet,
} from 'common/utils';
import ClassesQuery from 'graphql/queries/classes.graphql';
import { classes } from 'graphql/queries/__generated__/classes';
import ImportGeneratedCustomSetMutation from 'graphql/mutations/importGeneratedCustomSet.graphql';
import {
  importGeneratedCustomSet,
  importGeneratedCustomSetVariables,
} from 'graphql/mutations/__generated__/importGeneratedCustomSet';

const ELEMENTS: Array<{ label: string; value: BuildDiscoveryElement }> = [
  { label: 'Strength', value: 'strength' },
  { label: 'Intelligence', value: 'intelligence' },
  { label: 'Chance', value: 'chance' },
  { label: 'Agility', value: 'agility' },
];

const ELEMENT_STAT: Record<BuildDiscoveryElement, string> = {
  strength: 'Strength',
  intelligence: 'Intelligence',
  chance: 'Chance',
  agility: 'Agility',
};

const PRESETS = [
  { label: 'Defensive', value: 1 },
  { label: 'Balanced', value: 2 },
  { label: 'Damage', value: 3 },
  { label: 'Glass cannon', value: 4 },
];

const BUDGETS = [
  { label: 'Tier 1', value: 1 },
  { label: 'Tier 2', value: 2 },
  { label: 'Tier 3', value: 3 },
  { label: 'Opti', value: 4 },
];

const RESULT_LIMITS = [
  { label: '1', value: 1 },
  { label: '3', value: 3 },
  { label: '5', value: 5 },
];

const RANGE_OPTIONS = [
  { label: 'Any', value: 'any' },
  ...Array.from({ length: 7 }, (_, value) => ({
    label: `${value}+`,
    value: String(value),
  })),
];

const SLOT_ORDER = [
  'hat',
  'cloak',
  'amulet',
  'ring_1',
  'ring_2',
  'belt',
  'boots',
  'weapon',
  'shield',
  'pet',
  'dofus_1',
  'dofus_2',
  'dofus_3',
  'dofus_4',
  'dofus_5',
  'dofus_6',
];

const COMPARISON_STATS = [
  'AP',
  'MP',
  'Range',
  'Vitality',
  'Strength',
  'Intelligence',
  'Chance',
  'Agility',
  'Power',
  'Wisdom',
  'Critical',
  'Critical Damage',
  'Earth Damage',
  'Fire Damage',
  'Water Damage',
  'Air Damage',
  '% Spell Damage',
  '% Weapon Damage',
  '% Melee Damage',
  '% Ranged Damage',
];

const STAT_ICON_KEYS: Record<string, string> = {
  AP: 'AP',
  MP: 'MP',
  Range: 'RANGE',
  Vitality: 'VITALITY',
  Strength: 'STRENGTH',
  Intelligence: 'INTELLIGENCE',
  Chance: 'CHANCE',
  Agility: 'AGILITY',
  Power: 'POWER',
  Wisdom: 'WISDOM',
  Critical: 'CRITICAL',
  'Critical Damage': 'CRITICAL_DAMAGE',
};

function numberValue(value: number | null, fallback: number) {
  return typeof value === 'number' ? value : fallback;
}

function normalizedKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function statValue(build: BuildDiscoveryBuild, stat: string) {
  const target = normalizedKey(stat);
  const entry = Object.entries(build.totals ?? {}).find(
    ([name]) => normalizedKey(name) === target,
  );
  return entry?.[1];
}

function statIcon(stat: string) {
  const iconKey = STAT_ICON_KEYS[stat];
  return iconKey ? statIcons[iconKey] : undefined;
}

function jobErrorMessage(job: BuildDiscoveryJob | undefined) {
  if (job?.status !== 'failed') {
    return null;
  }
  const message = job.errorPayload?.message;
  return typeof message === 'string' && message
    ? message
    : 'Build generation failed.';
}

function buildImportBlockMessage(build: BuildDiscoveryBuild) {
  const input = buildDiscoveryImportItems(build);
  return generatedImportBlockMessage(
    input.hasMissingInternalIds,
    buildDiscoveryHasUnsupportedExos(build),
    input.hasUnmatchedExos,
  );
}

function FormField({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label css={{ minWidth: 0, gridColumn: wide ? 'span 2' : undefined }}>
      <span
        css={(theme) => ({
          display: 'block',
          color: theme.text?.light,
          fontSize: '0.7rem',
          fontWeight: 600,
          marginBottom: 5,
        })}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function QuerySummary({ input }: { input: BuildDiscoveryQueryInput }) {
  const element = input.element ?? DEFAULT_BUILD_DISCOVERY_INPUT.element;
  const preset = PRESETS.find(
    ({ value }) => value === input.damageSurvivabilityPreset,
  )?.label;
  const range =
    input.rangeTarget === null || input.rangeTarget === undefined
      ? 'Any range'
      : `${input.rangeTarget}+ Range`;

  return (
    <div css={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      <Tag>{input.className ?? 'Iop'}</Tag>
      <Tag>Level {input.level ?? 200}</Tag>
      <Tag color="blue">{formatBuildDiscoveryLabel(element)}</Tag>
      <Tag>
        {input.apTarget}+ AP / {input.mpTarget}+ MP
      </Tag>
      <Tag>{range}</Tag>
      {preset && <Tag>{preset}</Tag>}
    </div>
  );
}

function LoadingExperience({ elapsedSeconds }: { elapsedSeconds: number }) {
  const { t } = useTranslation('common');
  const phase = elapsedSeconds < 2 ? 0 : elapsedSeconds < 6 ? 1 : 2;
  const phases = [
    'Preparing equipment',
    'Solving requirements',
    'Ranking complete builds',
  ];

  return (
    <section
      aria-live="polite"
      css={(theme) => ({
        background: theme.layer?.background,
        border: `1px solid ${theme.border?.default}`,
        borderRadius: 6,
        padding: '28px 20px',
        display: 'grid',
        justifyItems: 'center',
        gap: 20,
      })}
    >
      <Spin indicator={<LoadingOutlined spin css={{ fontSize: 30 }} />} />
      <div css={{ textAlign: 'center' }}>
        <h2 css={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
          {t('BUILD_DISCOVERY_COOKING', {
            defaultValue: 'DofusLab is cooking up your options…',
          })}
        </h2>
        <div
          css={(theme) => ({
            color: theme.text?.light,
            fontSize: '0.75rem',
            marginTop: 5,
          })}
        >
          {Math.max(1, Math.round(elapsedSeconds))}s elapsed
        </div>
      </div>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          width: '100%',
          maxWidth: 620,
          gap: 8,
        }}
      >
        {phases.map((label, index) => (
          <div
            key={label}
            css={(theme) => ({
              color: index <= phase ? theme.text?.default : theme.text?.light,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: '0.7rem',
              textAlign: 'center',
              minWidth: 0,
            })}
          >
            {index < phase ? (
              <CheckCircleFilled
                css={(theme) => ({ color: theme.text?.primary })}
              />
            ) : index === phase ? (
              <LoadingOutlined spin />
            ) : (
              <ClockCircleOutlined />
            )}
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function KeyStat({
  build,
  stat,
}: {
  build: BuildDiscoveryBuild;
  stat: string;
}) {
  const value = statValue(build, stat);
  const icon = statIcon(stat);
  return (
    <div css={{ minWidth: 0 }}>
      <div
        css={(theme) => ({
          color: theme.text?.light,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: '0.65rem',
        })}
      >
        {icon && (
          <img
            alt=""
            aria-hidden
            src={getImageUrl(icon)}
            css={{ width: 14, height: 14 }}
          />
        )}
        {stat}
      </div>
      <div css={{ fontSize: '1rem', fontWeight: 600, marginTop: 2 }}>
        {value ?? '—'}
      </div>
    </div>
  );
}

function ResultChoice({
  build,
  index,
  element,
  selected,
  saving,
  onSelect,
  onOpen,
}: {
  build: BuildDiscoveryBuild;
  index: number;
  element: BuildDiscoveryElement;
  selected: boolean;
  saving: boolean;
  onSelect: (selected: boolean) => void;
  onOpen: () => void;
}) {
  const importBlockMessage = buildImportBlockMessage(build);
  const exos = buildDiscoveryExoLabels(build);
  const primaryStat = ELEMENT_STAT[element];

  return (
    <article
      css={(theme) => ({
        border: `1px solid ${
          selected ? theme.border?.primarySelected : theme.border?.default
        }`,
        background: theme.layer?.background,
        borderRadius: 6,
        padding: 14,
        display: 'grid',
        alignContent: 'start',
        gap: 13,
        minWidth: 0,
      })}
    >
      <div
        css={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div css={{ fontSize: '0.95rem', fontWeight: 600 }}>
            {index === 0 ? 'Recommended' : `Alternative ${index}`}
          </div>
          <div
            css={(theme) => ({
              color: theme.text?.light,
              fontSize: '0.7rem',
              marginTop: 2,
            })}
          >
            {Object.keys(build.items ?? {}).length} items
            {exos.length > 0 ? ` · ${exos.length} exo` : ''}
          </div>
        </div>
        <Checkbox
          aria-label={`Include build ${index + 1} in comparison`}
          checked={selected}
          onChange={(event) => onSelect(event.target.checked)}
        >
          Compare
        </Checkbox>
      </div>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '10px 8px',
        }}
      >
        {['AP', 'MP', 'Range', primaryStat, 'Power', 'Vitality'].map((stat) => (
          <KeyStat key={stat} build={build} stat={stat} />
        ))}
      </div>
      {exos.length > 0 && (
        <div css={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {exos.map((exo) => (
            <Tag key={exo.key} color="purple" css={{ margin: 0 }}>
              {exo.label}
            </Tag>
          ))}
        </div>
      )}
      <Tooltip title={importBlockMessage ?? undefined}>
        <Button
          block
          disabled={Boolean(importBlockMessage)}
          icon={<SaveOutlined />}
          loading={saving}
          onClick={onOpen}
        >
          Open in builder
        </Button>
      </Tooltip>
    </article>
  );
}

function ComparisonTable({
  title,
  builds,
  rows,
  renderValue,
}: {
  title: string;
  builds: Array<{ build: BuildDiscoveryBuild; index: number }>;
  rows: string[];
  renderValue: (build: BuildDiscoveryBuild, row: string) => React.ReactNode;
}) {
  return (
    <section css={{ minWidth: 0 }}>
      <h3 css={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 8px' }}>
        {title}
      </h3>
      <div
        css={(theme) => ({
          border: `1px solid ${theme.border?.default}`,
          borderRadius: 6,
          overflowX: 'auto',
        })}
      >
        <table
          css={{
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            width: '100%',
            minWidth: 180 + builds.length * 190,
          }}
        >
          <thead>
            <tr>
              <th
                css={(theme) => ({
                  background: theme.layer?.background,
                  borderBottom: `1px solid ${theme.border?.default}`,
                  padding: '9px 12px',
                  position: 'sticky',
                  left: 0,
                  textAlign: 'left',
                  width: 180,
                  zIndex: 1,
                })}
              >
                {title}
              </th>
              {builds.map(({ build, index }) => (
                <th
                  key={buildDiscoveryResultKey(build)}
                  css={(theme) => ({
                    background: theme.layer?.background,
                    borderBottom: `1px solid ${theme.border?.default}`,
                    padding: '9px 12px',
                    textAlign: 'left',
                    width: 190,
                  })}
                >
                  {index === 0 ? 'Recommended' : `Alternative ${index}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row}>
                <th
                  scope="row"
                  css={(theme) => ({
                    background: theme.layer?.background,
                    borderBottom: `1px solid ${theme.border?.default}`,
                    color: theme.text?.light,
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    padding: '8px 12px',
                    position: 'sticky',
                    left: 0,
                    textAlign: 'left',
                    width: 180,
                    zIndex: 1,
                  })}
                >
                  {formatBuildDiscoveryLabel(row)}
                </th>
                {builds.map(({ build }) => (
                  <td
                    key={`${buildDiscoveryResultKey(build)}:${row}`}
                    css={(theme) => ({
                      borderBottom: `1px solid ${theme.border?.default}`,
                      padding: '8px 12px',
                      verticalAlign: 'top',
                      overflowWrap: 'anywhere',
                    })}
                  >
                    {renderValue(build, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BuildComparison({
  builds,
}: {
  builds: Array<{ build: BuildDiscoveryBuild; index: number }>;
}) {
  const slots = useMemo(() => {
    const found = new Set(
      builds.flatMap(({ build }) => Object.keys(build.items ?? {})),
    );
    return [...found].sort((left, right) => {
      const leftIndex = SLOT_ORDER.indexOf(left);
      const rightIndex = SLOT_ORDER.indexOf(right);
      return (
        (leftIndex < 0 ? 999 : leftIndex) - (rightIndex < 0 ? 999 : rightIndex)
      );
    });
  }, [builds]);

  if (builds.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Select builds to compare"
      />
    );
  }

  return (
    <div css={{ display: 'grid', gap: 20 }}>
      <ComparisonTable
        title="Characteristics"
        builds={builds}
        rows={COMPARISON_STATS.filter((stat) =>
          builds.some(({ build }) => statValue(build, stat) !== undefined),
        )}
        renderValue={(build, stat) => {
          const value = statValue(build, stat);
          return value === undefined ? '—' : value;
        }}
      />
      <ComparisonTable
        title="Equipment"
        builds={builds}
        rows={slots}
        renderValue={(build, slot) => {
          const item = build.items?.[slot];
          return item ? (
            <div>
              <div css={{ fontWeight: 500 }}>{item.name ?? item.id}</div>
              {(item.type || typeof item.level === 'number') && (
                <div
                  css={(theme) => ({
                    color: theme.text?.light,
                    fontSize: '0.65rem',
                    marginTop: 2,
                  })}
                >
                  {[item.type, item.level ? `Lvl. ${item.level}` : null]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              )}
            </div>
          ) : (
            '—'
          );
        }}
      />
    </div>
  );
}

export default function BuildDiscoveryPage() {
  const theme = useTheme();
  const router = useRouter();
  const client = useApolloClient();
  const { t } = useTranslation('common');
  const { data: classData } = useQuery<classes>(ClassesQuery);
  const [input, setInput] = useState<BuildDiscoveryQueryInput>({
    ...DEFAULT_BUILD_DISCOVERY_INPUT,
  });
  const [submittedInput, setSubmittedInput] =
    useState<BuildDiscoveryQueryInput | null>(null);
  const [displayedJob, setDisplayedJob] = useState<{
    input: BuildDiscoveryQueryInput;
    job: BuildDiscoveryJob;
  } | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [promotionError, setPromotionError] = useState<string | null>(null);
  const [savedBuildCount, setSavedBuildCount] = useState(0);
  const latestRunId = useRef(0);

  const classOptions = useMemo(
    () =>
      [...(classData?.classes ?? [])]
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((dofusClass) => ({
          label: dofusClass.name,
          value: dofusClass.enName,
        })),
    [classData?.classes],
  );
  const targetLevel = input.level ?? 200;
  const minimumAp = targetLevel >= 200 ? 10 : targetLevel >= 100 ? 7 : 6;
  const minimumMp = targetLevel >= 200 ? 5 : 3;
  const queryInput = submittedInput ?? input;
  const { error, loading, startBuildDiscovery } =
    useStartBuildDiscoveryMutation();
  const jobId = displayedJob?.job.id;
  const job = displayedJob?.job;
  const shouldPoll =
    Boolean(jobId) && job?.status !== 'succeeded' && job?.status !== 'failed';
  const {
    buildDiscoveryJob: refreshedJob,
    error: jobLookupError,
    loading: jobLookupLoading,
  } = useBuildDiscoveryJobQuery(jobId, {
    fetchPolicy: 'cache-and-network',
    pollInterval: shouldPoll ? 2000 : 0,
  });
  const response = displayedJob?.job.result;
  const builds = response?.builds ?? [];
  const isGenerating =
    (loading || shouldPoll || jobLookupLoading) && !response && !jobLookupError;
  const [importBuildMutation, { loading: isSaving }] = useMutation<
    importGeneratedCustomSet,
    importGeneratedCustomSetVariables
  >(ImportGeneratedCustomSetMutation, {
    refetchQueries: () => ['buildList'],
  });

  const run = useCallback(
    async (nextInput: BuildDiscoveryQueryInput) => {
      const runId = latestRunId.current + 1;
      latestRunId.current = runId;
      setSubmittedInput({ ...nextInput });
      setDisplayedJob(null);
      setPromotionError(null);
      setSavedBuildCount(0);
      setElapsedSeconds(0);
      try {
        const result = await startBuildDiscovery(nextInput);
        if (latestRunId.current !== runId) {
          return;
        }
        const nextJob = parseBuildDiscoveryJob(
          result.data?.startBuildDiscovery?.job,
        );
        if (nextJob) {
          setDisplayedJob({ input: { ...nextInput }, job: nextJob });
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
      return { input: current.input, job: refreshedJob };
    });
  }, [refreshedJob]);

  useEffect(() => {
    if (!isGenerating) {
      return undefined;
    }
    const startedAt = Date.now();
    const interval = window.setInterval(
      () => setElapsedSeconds((Date.now() - startedAt) / 1000),
      250,
    );
    return () => window.clearInterval(interval);
  }, [isGenerating, submittedInput]);

  useEffect(() => {
    setSelectedKeys(builds.map(buildDiscoveryResultKey));
  }, [response?.cacheKey, builds.length]);

  const selectedBuilds = useMemo(
    () =>
      builds
        .map((build, index) => ({ build, index }))
        .filter(({ build }) =>
          selectedKeys.includes(buildDiscoveryResultKey(build)),
        ),
    [builds, selectedKeys],
  );
  const selectedHaveImportErrors = selectedBuilds.some(({ build }) =>
    Boolean(buildImportBlockMessage(build)),
  );

  const saveBuilds = useCallback(
    async (
      entries: Array<{ build: BuildDiscoveryBuild; index: number }>,
      openAfterSave: boolean,
    ) => {
      setPromotionError(null);
      setSavedBuildCount(0);
      const ok = await checkAuthentication(client, t);
      if (!ok) {
        return;
      }
      const importContext: BuildDiscoveryImportContext = {
        datasetVersion: response?.datasetVersion,
        solverVersion: response?.solverVersion,
        query: response?.query,
        input: displayedJob?.input ?? queryInput,
      };
      const created: Array<{ id: string }> = [];
      try {
        for (const { build } of entries) {
          const importInput = buildDiscoveryImportItems(build);
          const blockMessage = buildImportBlockMessage(build);
          if (blockMessage) {
            throw new Error(blockMessage);
          }
          const { data } = await importBuildMutation({
            variables: {
              items: importInput.items,
              name: generatedBuildName(build, importContext),
              level: importContext.input.level ?? 200,
              source: 'build_discovery',
              datasetVersion: importContext.datasetVersion,
              solverVersion: importContext.solverVersion,
              requestPayload: buildDiscoveryRequestPayload(
                build,
                importContext,
              ),
            },
          });
          const customSet = data?.importGeneratedCustomSet?.customSet;
          if (!customSet) {
            throw new Error('Could not create build.');
          }
          created.push({ id: customSet.id });
        }
        setSavedBuildCount(created.length);
        gtag.event({
          action: 'build_discovery_save_success',
          category: 'Build Discovery',
          label: submittedInput?.element,
          value: created.length,
        });
        if (openAfterSave && created[0]) {
          navigateToNewCustomSet(router, created[0].id);
        }
      } catch (caughtError) {
        setPromotionError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not save generated builds.',
        );
      }
    },
    [
      client,
      displayedJob?.input,
      importBuildMutation,
      queryInput,
      response?.datasetVersion,
      response?.query,
      response?.solverVersion,
      router,
      submittedInput?.element,
      t,
    ],
  );

  const resultError = jobErrorMessage(job);
  const duration =
    response?.diagnostics.elapsedMs ?? job?.elapsedMs ?? undefined;

  return (
    <main
      css={{
        width: '100%',
        maxWidth: 1380,
        margin: '0 auto',
        padding: '12px 14px 40px',
        display: 'grid',
        gap: 18,
        [mq[1]]: { padding: '18px 24px 48px' },
      }}
    >
      <header
        css={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 css={{ margin: 0, fontSize: '1.35rem', fontWeight: 600 }}>
            {t('BUILD_DISCOVERY')}
          </h1>
          <div css={{ color: theme.text?.light, marginTop: 4 }}>
            {t('BUILD_DISCOVERY_SUBTITLE', {
              defaultValue:
                'Generate complete equipment options for your character.',
            })}
          </div>
        </div>
        {submittedInput && (
          <Tooltip title="Run these requirements again">
            <Button
              aria-label="Generate these builds again"
              icon={<ReloadOutlined />}
              loading={isGenerating}
              onClick={() => run(submittedInput)}
            />
          </Tooltip>
        )}
      </header>

      <section
        css={{
          borderTop: `1px solid ${theme.border?.default}`,
          borderBottom: `1px solid ${theme.border?.default}`,
          padding: '16px 0',
          display: 'grid',
          gap: 14,
        }}
      >
        <div>
          <h2 css={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
            Build requirements
          </h2>
          <div
            css={{ color: theme.text?.light, fontSize: '0.7rem', marginTop: 3 }}
          >
            PvM · minimum AP and MP targets
          </div>
        </div>
        <div
          css={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 12,
            alignItems: 'end',
            [mq[1]]: { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
            [mq[3]]: { gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' },
          }}
        >
          <FormField label="Class">
            <Select
              aria-label="Class"
              showSearch
              optionFilterProp="label"
              css={{ width: '100%' }}
              loading={!classData}
              options={classOptions}
              value={input.className}
              onChange={(className) =>
                setInput((current) => ({ ...current, className }))
              }
            />
          </FormField>
          <FormField label="Level">
            <InputNumber
              aria-label="Level"
              css={{ width: '100%' }}
              min={1}
              max={200}
              value={input.level}
              onChange={(level) =>
                setInput((current) => ({
                  ...current,
                  level: numberValue(level, 200),
                }))
              }
            />
          </FormField>
          <FormField label="Element">
            <Select
              aria-label="Element"
              css={{ width: '100%' }}
              options={ELEMENTS}
              value={input.element}
              onChange={(element) =>
                setInput((current) => ({ ...current, element }))
              }
            />
          </FormField>
          <FormField label="Focus">
            <Select
              aria-label="Damage and survivability focus"
              css={{ width: '100%' }}
              options={PRESETS}
              value={input.damageSurvivabilityPreset}
              onChange={(damageSurvivabilityPreset) =>
                setInput((current) => ({
                  ...current,
                  damageSurvivabilityPreset,
                }))
              }
            />
          </FormField>
          <FormField label="Min AP">
            <InputNumber
              aria-label="Minimum AP"
              css={{ width: '100%' }}
              min={minimumAp}
              max={12}
              value={input.apTarget}
              onChange={(apTarget) =>
                setInput((current) => ({
                  ...current,
                  apTarget: numberValue(apTarget, 11),
                }))
              }
            />
          </FormField>
          <FormField label="Min MP">
            <InputNumber
              aria-label="Minimum MP"
              css={{ width: '100%' }}
              min={minimumMp}
              max={6}
              value={input.mpTarget}
              onChange={(mpTarget) =>
                setInput((current) => ({
                  ...current,
                  mpTarget: numberValue(mpTarget, 6),
                }))
              }
            />
          </FormField>
          <FormField label="Min Range">
            <Select
              aria-label="Minimum Range"
              css={{ width: '100%' }}
              options={RANGE_OPTIONS}
              value={
                input.rangeTarget === null || input.rangeTarget === undefined
                  ? 'any'
                  : String(input.rangeTarget)
              }
              onChange={(rangeTarget) =>
                setInput((current) => ({
                  ...current,
                  rangeTarget:
                    rangeTarget === 'any' ? null : Number(rangeTarget),
                }))
              }
            />
          </FormField>
          <FormField label="Budget">
            <Select
              aria-label="Budget"
              css={{ width: '100%' }}
              options={BUDGETS}
              value={input.budgetTier}
              onChange={(budgetTier) =>
                setInput((current) => ({ ...current, budgetTier }))
              }
            />
          </FormField>
          <FormField label="Exos">
            <Select
              aria-label="Exos"
              css={{ width: '100%' }}
              options={[
                { label: 'None', value: 'none' },
                { label: 'Allow', value: 'allow' },
                { label: 'Opti', value: 'opti' },
              ]}
              value={input.exoPolicy}
              onChange={(exoPolicy) =>
                setInput((current) => ({ ...current, exoPolicy }))
              }
            />
          </FormField>
          <FormField label="Weapon" wide>
            <Select
              aria-label="Weapon use"
              css={{ width: '100%' }}
              options={[
                { label: 'Stats only', value: 'stat_stick_allowed' },
                {
                  label: 'Include weapon damage',
                  value: 'weapon_damage_allowed',
                },
              ]}
              value={input.weaponPolicy}
              onChange={(weaponPolicy) =>
                setInput((current) => ({ ...current, weaponPolicy }))
              }
            />
          </FormField>
          <FormField label="Results">
            <Select
              aria-label="Number of results"
              css={{ width: '100%' }}
              options={RESULT_LIMITS}
              value={input.limit}
              onChange={(limit) =>
                setInput((current) => ({ ...current, limit }))
              }
            />
          </FormField>
          <Button
            type="primary"
            loading={isGenerating}
            onClick={() => {
              gtag.event({
                action: 'build_discovery_run',
                category: 'Build Discovery',
                label: `${input.className}:${input.element}`,
                value: input.limit ?? undefined,
              });
              run(input);
            }}
          >
            {t('BUILD_DISCOVERY_COOK_CTA', {
              defaultValue: 'Let DofusLab cook',
            })}
          </Button>
        </div>
      </section>

      {error && <Alert type="error" message={error.message} showIcon />}
      {jobLookupError && (
        <Alert type="error" message={jobLookupError.message} showIcon />
      )}
      {resultError && <Alert type="error" message={resultError} showIcon />}
      {promotionError && (
        <Alert type="error" message={promotionError} showIcon closable />
      )}
      {savedBuildCount > 0 && (
        <Alert
          type="success"
          showIcon
          message={`${savedBuildCount} generated ${
            savedBuildCount === 1 ? 'build' : 'builds'
          } saved to My Builds.`}
          action={
            <Link href="/my-builds">
              <Button size="small">View builds</Button>
            </Link>
          }
        />
      )}
      {response?.warnings.map((warning) => (
        <Alert key={warning} type="warning" message={warning} showIcon />
      ))}

      {isGenerating && (
        <>
          {submittedInput && <QuerySummary input={submittedInput} />}
          <LoadingExperience elapsedSeconds={elapsedSeconds} />
        </>
      )}

      {!isGenerating && response && builds.length > 0 && (
        <section css={{ display: 'grid', gap: 16 }}>
          <div
            css={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <h2 css={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                {t('BUILD_DISCOVERY_RESULT_COUNT', {
                  count: builds.length,
                  defaultValue_one: '{{count}} generated build',
                  defaultValue_other: '{{count}} generated builds',
                })}
              </h2>
              <div css={{ marginTop: 7 }}>
                <QuerySummary input={displayedJob?.input ?? queryInput} />
              </div>
              {typeof duration === 'number' && (
                <div
                  css={{
                    color: theme.text?.light,
                    fontSize: '0.7rem',
                    marginTop: 7,
                  }}
                >
                  Generated in {(duration / 1000).toFixed(1)}s
                </div>
              )}
            </div>
            <div css={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button
                onClick={() =>
                  setSelectedKeys(
                    selectedKeys.length === builds.length
                      ? []
                      : builds.map(buildDiscoveryResultKey),
                  )
                }
              >
                {selectedKeys.length === builds.length ? 'Clear' : 'Select all'}
              </Button>
              <Tooltip
                title={
                  selectedHaveImportErrors
                    ? 'One or more selected builds cannot be imported.'
                    : undefined
                }
              >
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  disabled={
                    selectedBuilds.length === 0 || selectedHaveImportErrors
                  }
                  loading={isSaving}
                  onClick={() => saveBuilds(selectedBuilds, false)}
                >
                  Save selected ({selectedBuilds.length})
                </Button>
              </Tooltip>
            </div>
          </div>

          <div
            css={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 12,
              [mq[1]]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
              [mq[3]]: {
                gridTemplateColumns: `repeat(${Math.min(
                  builds.length,
                  3,
                )}, minmax(0, 1fr))`,
              },
            }}
          >
            {builds.map((build, index) => {
              const key = buildDiscoveryResultKey(build);
              return (
                <ResultChoice
                  key={key}
                  build={build}
                  index={index}
                  element={
                    (displayedJob?.input.element ??
                      DEFAULT_BUILD_DISCOVERY_INPUT.element) as BuildDiscoveryElement
                  }
                  selected={selectedKeys.includes(key)}
                  saving={isSaving}
                  onSelect={(selected) =>
                    setSelectedKeys((current) =>
                      selected
                        ? [...current, key]
                        : current.filter((value) => value !== key),
                    )
                  }
                  onOpen={() => saveBuilds([{ build, index }], true)}
                />
              );
            })}
          </div>

          <section
            css={{
              borderTop: `1px solid ${theme.border?.default}`,
              paddingTop: 16,
              display: 'grid',
              gap: 12,
            }}
          >
            <div>
              <h2 css={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                Compare selected
              </h2>
              <div
                css={{
                  color: theme.text?.light,
                  fontSize: '0.7rem',
                  marginTop: 3,
                }}
              >
                Scroll the tables horizontally on smaller screens.
              </div>
            </div>
            <BuildComparison builds={selectedBuilds} />
          </section>
        </section>
      )}

      {!isGenerating &&
        submittedInput &&
        response &&
        builds.length === 0 &&
        !resultError && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No build met these requirements"
          >
            <Button onClick={() => setSubmittedInput(null)}>
              Adjust requirements
            </Button>
          </Empty>
        )}
    </main>
  );
}
