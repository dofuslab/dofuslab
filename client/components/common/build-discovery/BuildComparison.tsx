/** @jsxImportSource @emotion/react */

import { Empty } from 'antd';
import { ReactNode, useMemo } from 'react';

import {
  BuildDiscoveryBuild,
  buildDiscoveryResultKey,
  formatBuildDiscoveryLabel,
} from 'common/buildDiscovery';

import { COMPARISON_STATS, SLOT_ORDER } from './constants';
import { buildLabel } from './presentation';
import { statValue } from './statHelpers';

export type IndexedBuild = { build: BuildDiscoveryBuild; index: number };

function ComparisonTable({
  title,
  builds,
  rows,
  renderValue,
}: {
  title: string;
  builds: IndexedBuild[];
  rows: string[];
  renderValue: (build: BuildDiscoveryBuild, row: string) => ReactNode;
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
                  {buildLabel(index)}
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

function EquipmentValue({
  build,
  slot,
}: {
  build: BuildDiscoveryBuild;
  slot: string;
}) {
  const item = build.items?.[slot];
  if (!item) {
    return <>—</>;
  }
  return (
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
  );
}

export default function BuildComparison({
  builds,
}: {
  builds: IndexedBuild[];
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
        renderValue={(build, slot) => (
          <EquipmentValue build={build} slot={slot} />
        )}
      />
    </div>
  );
}
