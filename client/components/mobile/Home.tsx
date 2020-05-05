/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { Tabs } from 'antd';
import { useTheme } from 'emotion-theming';

import { Theme, BuildError } from 'common/types';
import { STAT_GROUPS } from 'common/constants';
import { ResponsiveGrid } from 'common/wrappers';
import { topMarginStyle } from 'common/mixins';
import { getStatsFromCustomSet, getErrors } from 'common/utils';
import BonusStats from 'components/desktop/BonusStats';
import BasicItemCard from 'components/common/BasicItemCard';
import WeaponDamage from 'components/common/WeaponDamage';
import ClassSpells from 'components/common/ClassSpells';
import { useTranslation } from 'i18n';

import { ItemSlot, CustomSet } from 'common/type-aliases';
import StatEditor from '../common/StatEditor';
import EquipmentSlots from '../common/EquipmentSlots';
import SetHeader from '../common/SetHeader';
import StatTable from '../common/StatTable';

const { TabPane } = Tabs;

interface Props {
  customSet: CustomSet | null;
  selectItemSlot: React.Dispatch<React.SetStateAction<ItemSlot | null>>;
  selectedItemSlot: ItemSlot | null;
}

const Home: React.FC<Props> = ({
  customSet,
  selectItemSlot,
  selectedItemSlot,
}) => {
  const statsFromCustomSet = React.useMemo(
    () => getStatsFromCustomSet(customSet),
    [customSet],
  );

  const weapon = customSet?.equippedItems.find(
    (equippedItem) => !!equippedItem.item.weaponStats,
  );

  let errors: Array<BuildError> = [];

  if (customSet && statsFromCustomSet) {
    errors = getErrors(customSet, statsFromCustomSet);
  }
  const { t } = useTranslation('common');

  const theme = useTheme<Theme>();

  return (
    <>
      <SetHeader customSet={customSet} errors={errors} isMobile />
      <EquipmentSlots
        customSet={customSet}
        selectItemSlot={selectItemSlot}
        selectedItemSlotId={selectedItemSlot?.id ?? null}
        errors={errors}
      />
      {customSet && <BonusStats customSet={customSet} isMobile />}
      <div
        css={{
          flex: '1 1 auto',
          overflowX: 'hidden',
          display: 'flex',
        }}
      >
        <div
          css={{
            flex: '1 1 296px',
            overflow: 'auto',
            ...topMarginStyle,
          }}
        >
          <Tabs
            defaultActiveKey="characteristics"
            css={{
              '.ant-tabs-bar': {
                borderBottom: `1px solid ${theme.border?.default}`,
              },
            }}
          >
            <TabPane tab={t('CHARACTERISTICS')} key="characteristics">
              <ResponsiveGrid numColumns={[2]} css={{ marginBottom: 20 }}>
                {STAT_GROUPS.map((group) => (
                  <StatTable
                    key={group[0].stat}
                    group={group}
                    statsFromCustomSet={statsFromCustomSet}
                    customSet={customSet}
                  />
                ))}
                <StatEditor customSet={customSet} />
              </ResponsiveGrid>
            </TabPane>
            <TabPane tab={t('WEAPON_AND_SPELLS')} key="weapon-and-spells">
              <ResponsiveGrid numColumns={[2]} css={{ marginBottom: 20 }}>
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
                <ClassSpells
                  key={`${customSet?.id}-${customSet?.level}`}
                  customSet={customSet}
                />
              </ResponsiveGrid>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Home;
