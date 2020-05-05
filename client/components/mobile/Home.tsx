/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { Tabs } from 'antd';
import { useTheme } from 'emotion-theming';

import { TTheme } from 'common/themes';
import { STAT_GROUPS } from 'common/constants';
import StatTable from '../common/StatTable';
import { ResponsiveGrid } from 'common/wrappers';
import SetHeader from '../common/SetHeader';
import EquipmentSlots from '../common/EquipmentSlots';
import StatEditor from '../common/StatEditor';
import { topMarginStyle } from 'common/mixins';
import { customSet } from 'graphql/fragments/__generated__/customSet';
import { getStatsFromCustomSet, getErrors } from 'common/utils';
import { itemSlots_itemSlots } from 'graphql/queries/__generated__/itemSlots';
import BonusStats from 'components/desktop/BonusStats';
import BasicItemCard from 'components/common/BasicItemCard';
import WeaponDamage from 'components/common/WeaponDamage';
import ClassSpells from 'components/common/ClassSpells';
import { useTranslation } from 'i18n';
import { IError } from 'common/types';

const { TabPane } = Tabs;

interface IProps {
  customSet: customSet | null;
  selectItemSlot: React.Dispatch<
    React.SetStateAction<itemSlots_itemSlots | null>
  >;
  selectedItemSlot: itemSlots_itemSlots | null;
}

const Home: React.FC<IProps> = ({
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

  let errors: Array<IError> = [];

  if (customSet && statsFromCustomSet) {
    errors = getErrors(customSet, statsFromCustomSet);
  }
  const { t } = useTranslation('common');

  const theme = useTheme<TTheme>();

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
                {STAT_GROUPS.map((group, i) => (
                  <StatTable
                    key={`stat-table-${i}`}
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
