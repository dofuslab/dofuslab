import { BuildDiscoveryBuild } from 'common/buildDiscovery';
import { statIcons } from 'common/constants';

import { STAT_ICON_KEYS } from './constants';

function normalizedKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function statValue(build: BuildDiscoveryBuild, stat: string) {
  const target = normalizedKey(stat);
  const entry = Object.entries(build.totals ?? {}).find(
    ([name]) => normalizedKey(name) === target,
  );
  return entry?.[1];
}

export function statIcon(stat: string) {
  const iconKey = STAT_ICON_KEYS[stat];
  return iconKey ? statIcons[iconKey] : undefined;
}
