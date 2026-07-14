/** @jsxImportSource @emotion/react */

import { Button, InputNumber, Select } from 'antd';
import { ReactNode } from 'react';

import { BuildDiscoveryQueryInput } from 'common/buildDiscovery';
import { mq } from 'common/constants';

import {
  BUDGETS,
  ELEMENTS,
  PRESETS,
  RANGE_OPTIONS,
  RESULT_LIMITS,
} from './constants';

type ClassOption = { label: string; value: string };

type BuildDiscoveryFormProps = {
  classOptions: ClassOption[];
  classesLoading: boolean;
  generating: boolean;
  input: BuildDiscoveryQueryInput;
  minimumAp: number;
  minimumMp: number;
  onChange: (changes: Partial<BuildDiscoveryQueryInput>) => void;
  onSubmit: () => void;
  submitLabel: string;
};

function numberValue(value: number | null, fallback: number) {
  return typeof value === 'number' ? value : fallback;
}

function FormField({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div css={{ minWidth: 0, gridColumn: wide ? 'span 2' : undefined }}>
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
    </div>
  );
}

export default function BuildDiscoveryForm({
  classOptions,
  classesLoading,
  generating,
  input,
  minimumAp,
  minimumMp,
  onChange,
  onSubmit,
  submitLabel,
}: BuildDiscoveryFormProps) {
  const rangeValue =
    input.rangeTarget === null || input.rangeTarget === undefined
      ? 'any'
      : String(input.rangeTarget);

  return (
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
          loading={classesLoading}
          options={classOptions}
          value={input.className}
          onChange={(className) => onChange({ className })}
        />
      </FormField>
      <FormField label="Level">
        <InputNumber
          aria-label="Level"
          css={{ width: '100%' }}
          min={1}
          max={200}
          value={input.level}
          onChange={(level) => onChange({ level: numberValue(level, 200) })}
        />
      </FormField>
      <FormField label="Element">
        <Select
          aria-label="Element"
          css={{ width: '100%' }}
          options={ELEMENTS}
          value={input.element}
          onChange={(element) => onChange({ element })}
        />
      </FormField>
      <FormField label="Focus">
        <Select
          aria-label="Damage and survivability focus"
          css={{ width: '100%' }}
          options={PRESETS}
          value={input.damageSurvivabilityPreset}
          onChange={(damageSurvivabilityPreset) =>
            onChange({ damageSurvivabilityPreset })
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
            onChange({ apTarget: numberValue(apTarget, 11) })
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
            onChange({ mpTarget: numberValue(mpTarget, 6) })
          }
        />
      </FormField>
      <FormField label="Min Range">
        <Select
          aria-label="Minimum Range"
          css={{ width: '100%' }}
          options={RANGE_OPTIONS}
          value={rangeValue}
          onChange={(rangeTarget) =>
            onChange({
              rangeTarget: rangeTarget === 'any' ? null : Number(rangeTarget),
            })
          }
        />
      </FormField>
      <FormField label="Budget">
        <Select
          aria-label="Budget"
          css={{ width: '100%' }}
          options={BUDGETS}
          value={input.budgetTier}
          onChange={(budgetTier) => onChange({ budgetTier })}
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
          onChange={(exoPolicy) => onChange({ exoPolicy })}
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
          onChange={(weaponPolicy) => onChange({ weaponPolicy })}
        />
      </FormField>
      <FormField label="Results">
        <Select
          aria-label="Number of results"
          css={{ width: '100%' }}
          options={RESULT_LIMITS}
          value={input.limit}
          onChange={(limit) => onChange({ limit })}
        />
      </FormField>
      <Button type="primary" loading={generating} onClick={onSubmit}>
        {submitLabel}
      </Button>
    </div>
  );
}
