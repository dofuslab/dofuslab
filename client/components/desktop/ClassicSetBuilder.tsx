/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { Tabs } from 'antd';

import { mq } from 'common/constants';

import { getStatsFromCustomSet, getErrors } from 'common/utils';
import { BuildError, Theme } from 'common/types';
import StatTable from 'components/common/StatTable';
import { Stat } from '__generated__/globalTypes';
import { useTheme } from 'emotion-theming';
import { useTranslation } from 'i18n';
import BasicItemCard from 'components/common/BasicItemCard';
import WeaponDamage from 'components/common/WeaponDamage';
import ClassicClassSpells from 'components/desktop/ClassicClassSpells';
import { CustomSet } from 'common/type-aliases';
import ClassicRightColumnStats from './ClassicRightColumnStats';
import ClassicLeftColumnStats from './ClassicLeftColumnStats';
import ClassicEquipmentSlots from './ClassicEquipmentSlots';
import SetHeader from '../common/SetHeader';
import ClassicClassSelector from './ClassicClassSelector';

const { TabPane } = Tabs;

interface Props {
  customSet: CustomSet | null;
}

const ClassicSetBuilder: React.FC<Props> = ({ customSet }) => {
  const statsFromCustomSet = React.useMemo(
    () => getStatsFromCustomSet(customSet),
    [customSet],
  );

  const theme = useTheme<Theme>();

  const { t } = useTranslation();

  const weapon = customSet?.equippedItems.find(
    (equippedItem) => !!equippedItem.item.weaponStats,
  );

  let errors: Array<BuildError> = [];

  if (customSet && statsFromCustomSet) {
    errors = getErrors(customSet, statsFromCustomSet);
  }

  return (
    <>
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: '0 12px',
        }}
      >
        <SetHeader
          key={customSet?.id}
          customSet={customSet}
          errors={errors}
          isClassic
          isMobile={false}
        />
        <Tabs
          defaultActiveKey="characteristics"
          css={{
            width: '100%',
            maxWidth: 1036,
            [mq[4]]: {
              maxWidth: 1124,
            },
            '&.ant-tabs > .ant-tabs-bar': { textAlign: 'center' },
            '.ant-tabs-bar': {
              borderBottom: `1px solid ${theme.border?.default}`,
            },
          }}
        >
          <TabPane tab={t('CHARACTERISTICS')} key="characteristics">
            <div
              css={{
                display: 'flex',
                alignItems: 'flex-start',
                marginTop: 8,
                marginBottom: 60,
              }}
            >
              <ClassicLeftColumnStats customSet={customSet} />
              <div css={{ flex: '1 1 auto' }}>
                <ClassicEquipmentSlots customSet={customSet} errors={errors} />
                <div
                  css={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gridGap: 12,
                    marginTop: 12,
                    [mq[4]]: { gridGap: 20, marginTop: 20 },
                  }}
                >
                  <StatTable
                    group={[
                      Stat.PCT_NEUTRAL_RES,
                      Stat.PCT_EARTH_RES,
                      Stat.PCT_FIRE_RES,
                      Stat.PCT_WATER_RES,
                      Stat.PCT_AIR_RES,
                    ]}
                    statsFromCustomSet={statsFromCustomSet}
                    customSet={customSet}
                  />
                  <StatTable
                    group={[
                      Stat.NEUTRAL_RES,
                      Stat.EARTH_RES,
                      Stat.FIRE_RES,
                      Stat.WATER_RES,
                      Stat.AIR_RES,
                    ]}
                    statsFromCustomSet={statsFromCustomSet}
                    customSet={customSet}
                  />
                  <StatTable
                    group={[Stat.PCT_MELEE_RES, Stat.PCT_RANGED_RES]}
                    statsFromCustomSet={statsFromCustomSet}
                    customSet={customSet}
                  />
                  <StatTable
                    group={[Stat.CRITICAL_RES, Stat.PUSHBACK_RES]}
                    statsFromCustomSet={statsFromCustomSet}
                    customSet={customSet}
                  />
                </div>
              </div>
              <ClassicRightColumnStats customSet={customSet} />
            </div>
          </TabPane>
          <TabPane
            tab={t('WEAPON_AND_SPELLS')}
            key="weapon-and-spells"
            forceRender
          >
            <div
              css={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridGap: 12,
                [mq[4]]: { gridGap: 20 },
                marginBottom: 60,
              }}
            >
              <ClassicClassSelector />
              {weapon && customSet && weapon.item.weaponStats && (
                <>
                  <BasicItemCard
                    item={weapon.item}
                    showOnlyWeaponStats
                    weaponElementMage={weapon.weaponElementMage}
                  />
                  <WeaponDamage
                    weaponStats={weapon.item.weaponStats}
                    customSet={customSet}
                    weaponElementMage={weapon.weaponElementMage}
                  />
                </>
              )}
              <ClassicClassSpells
                key={`${customSet?.id}-${customSet?.level}`}
                customSet={customSet}
              />
            </div>
          </TabPane>
        </Tabs>
      </div>
    </>
  );
};

export default React.memo(ClassicSetBuilder);
