/** @jsxImportSource @emotion/react */

import { SaveOutlined } from '@ant-design/icons';
import { Button, Checkbox, Tag } from 'antd';

import {
  BuildDiscoveryBuild,
  BuildDiscoveryElement,
  buildDiscoveryExoLabels,
} from 'common/buildDiscovery';
import { getImageUrl } from 'common/utils';

import { ELEMENT_STAT } from './constants';
import { buildLabel } from './presentation';
import { statIcon, statValue } from './statHelpers';

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

type BuildDiscoveryResultCardProps = {
  build: BuildDiscoveryBuild;
  element: BuildDiscoveryElement;
  index: number;
  onOpen: () => void;
  onSelect: (selected: boolean) => void;
  saving: boolean;
  selected: boolean;
};

export default function BuildDiscoveryResultCard({
  build,
  index,
  element,
  selected,
  saving,
  onSelect,
  onOpen,
}: BuildDiscoveryResultCardProps) {
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
            {buildLabel(index)}
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
      <Button block icon={<SaveOutlined />} loading={saving} onClick={onOpen}>
        Open in builder
      </Button>
    </article>
  );
}
