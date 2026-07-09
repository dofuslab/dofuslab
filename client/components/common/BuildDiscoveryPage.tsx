/** @jsxImportSource @emotion/react */

import { useMemo, useState } from 'react';
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
  BuildDiscoveryQueryInput,
  DEFAULT_BUILD_DISCOVERY_INPUT,
  useBuildDiscoveryQuery,
} from 'common/buildDiscovery';
import { mq } from 'common/constants';

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
  return stat
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
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

function BuildDiscoveryResult({
  build,
  index,
}: {
  build: BuildDiscoveryBuild;
  index: number;
}) {
  const itemEntries = Object.entries(build.items ?? {});
  const totalEntries = sortedTotals(build.totals);

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
    useState<BuildDiscoveryQueryInput>({
      ...DEFAULT_BUILD_DISCOVERY_INPUT,
    });

  const queryInput = useMemo<BuildDiscoveryQueryInput>(
    () => ({
      ...submittedInput,
      className: 'Iop',
      level: 200,
      mode: 'pvm',
    }),
    [submittedInput],
  );

  const { buildDiscovery, loading, error, refetch } =
    useBuildDiscoveryQuery(queryInput);
  const hasBuilds = Boolean(buildDiscovery?.builds.length);
  const showInitialLoading = loading && !buildDiscovery;

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
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => refetch()}
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
          onClick={() => setSubmittedInput(input)}
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
        {!showInitialLoading && !hasBuilds && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </section>
    </main>
  );
}
