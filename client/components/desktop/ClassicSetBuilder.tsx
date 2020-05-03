/** @jsx jsx */

import * as React from 'react';
import { jsx } from '@emotion/core';
import { Tabs } from 'antd';

import { SEARCH_BAR_ID, mq } from 'common/constants';
import Layout from './Layout';

import { customSet } from 'graphql/fragments/__generated__/customSet';
import { getStatsFromCustomSet, getErrors } from 'common/utils';
import SetHeader from '../common/SetHeader';
import ClassicEquipmentSlots from './ClassicEquipmentSlots';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import { IError } from 'common/types';
import ClassicLeftColumnStats from './ClassicLeftColumnStats';
import StatTable from 'components/common/StatTable';
import { Stat } from '__generated__/globalTypes';
import ClassicRightColumnStats from './ClassicRightColumnStats';
import { useTheme } from 'emotion-theming';
import { TTheme } from 'common/themes';
import { useTranslation } from 'i18n';
import BasicItemCard from 'components/common/BasicItemCard';
import WeaponDamage from 'components/common/WeaponDamage';
import ClassicClassSpells from 'components/desktop/ClassicClassSpells';
import ClassicClassSelector from './ClassicClassSelector';

const { TabPane } = Tabs;

interface IProps {
  customSet: customSet | null;
}

const ClassicSetBuilder: React.FC<IProps> = ({ customSet }) => {
  const [
    selectedItemSlot,
    selectItemSlot,
  ] = React.useState<itemSlots_itemSlots | null>(null);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.keyCode === 27) {
        // escape key
        selectItemSlot(null);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  React.useEffect(() => {
    const searchBar = document.getElementById(
      SEARCH_BAR_ID,
    ) as HTMLInputElement;
    if (searchBar) {
      searchBar.focus();
      searchBar.setSelectionRange(0, searchBar.value.length);
    }
  }, [selectedItemSlot?.id]);

  const statsFromCustomSet = React.useMemo(
    () => getStatsFromCustomSet(customSet),
    [customSet],
  );

  const theme = useTheme<TTheme>();

  const { t } = useTranslation();

  const weapon = customSet?.equippedItems.find(
    equippedItem => !!equippedItem.item.weaponStats,
  );

  let errors: Array<IError> = [];

  if (customSet && statsFromCustomSet) {
    errors = getErrors(customSet, statsFromCustomSet);
  }

  return (
    <Layout>
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: '0 12px',
        }}
      >
        <SetHeader customSet={customSet} errors={errors} />
        <Tabs
          defaultActiveKey="characteristics"
          css={{
            width: '100%',
            maxWidth: 1036,
            [mq[4]]: {
              maxWidth: 1124,
            },
            '& > .ant-tabs .ant-tabs-nav-scroll': { textAlign: 'center' },
            '.ant-tabs-bar': {
              borderBottom: `1px solid ${theme.border?.default}`,
            },
          }}
        >
          <TabPane tab={t('CHARACTERISTICS')} key="characteristics">
            <div
              css={{ display: 'flex', alignItems: 'flex-start', marginTop: 8 }}
            >
              <ClassicLeftColumnStats customSet={customSet} />
              <div>
                <ClassicEquipmentSlots
                  customSet={customSet}
                  selectItemSlot={selectItemSlot}
                  selectedItemSlotId={selectedItemSlot?.id ?? null}
                  errors={errors}
                />
                <div css={{ display: 'flex' }}>
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
                    css={{
                      flex: '1 1 0',
                      marginRight: 12,
                      [mq[4]]: { marginRight: 20 },
                    }}
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
                    css={{ flex: '1 1 0' }}
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
              {weapon && customSet && weapon.item.weaponStats && (
                <>
                  <ClassicClassSelector />
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
    </Layout>
  );
};

export default React.memo(ClassicSetBuilder);
