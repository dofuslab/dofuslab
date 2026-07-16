/** @jsxImportSource @emotion/react */

import {
  CheckCircleFilled,
  ClockCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Spin, Tag } from 'antd';
import { useTranslation } from 'next-i18next';

import {
  BuildDiscoveryQueryInput,
  DEFAULT_BUILD_DISCOVERY_INPUT,
  formatBuildDiscoveryLabel,
} from 'common/buildDiscovery';

import { PRESETS } from './constants';

export function buildLabel(index: number) {
  return index === 0 ? 'Recommended' : `Alternative ${index}`;
}

export function QuerySummary({ input }: { input: BuildDiscoveryQueryInput }) {
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

function PhaseIcon({ phase, index }: { phase: number; index: number }) {
  if (index < phase) {
    return (
      <CheckCircleFilled css={(theme) => ({ color: theme.text?.primary })} />
    );
  }
  if (index === phase) {
    return <LoadingOutlined spin />;
  }
  return <ClockCircleOutlined />;
}

export function LoadingExperience({
  elapsedSeconds,
}: {
  elapsedSeconds: number;
}) {
  const { t } = useTranslation('common');
  let phase = 2;
  if (elapsedSeconds < 2) {
    phase = 0;
  } else if (elapsedSeconds < 6) {
    phase = 1;
  }
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
            <PhaseIcon phase={phase} index={index} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
