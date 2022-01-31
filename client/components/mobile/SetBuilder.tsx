/** @jsxImportSource @emotion/react */

import * as React from 'react';
import { Tabs } from 'antd';
import { useTheme } from '@emotion/react';

import { BuildError } from 'common/types';
import { classicStatGroups } from 'common/constants';
import { ResponsiveGrid, BuffButton } from 'common/wrappers';
import { topMarginStyle } from 'common/mixins';
import { getErrors, CustomSetContext } from 'common/utils';
import BonusStats from 'components/desktop/BonusStats';
import BasicItemCard from 'components/common/BasicItemCard';
import WeaponDamage from 'components/common/WeaponDamage';
import ClassSpells from 'components/common/ClassSpells';
import { useTranslation } from 'next-i18next';

import { ItemSlot, CustomSet } from 'common/type-aliases';
import BuffModal from 'components/common/BuffModal';
import EquipSetLink from 'components/common/EquipSetLink';
import StatTable from '../common/StatTable';
import StatEditor from '../common/StatEditor';
import EquipmentSlots from '../common/EquipmentSlots';
import SetHeader from './SetHeader';

const { TabPane } = Tabs;

interface Props {
  customSet?: CustomSet | null;
}

const SetBuilder: React.FC<Props> = ({ customSet }) => {
  const { appliedBuffs, statsFromCustomSet, customSetLoading } =
    React.useContext(CustomSetContext);
  const [selectedItemSlot, selectItemSlot] = React.useState<ItemSlot | null>(
    null,
  );

  const [dofusClassId, setDofusClassId] = React.useState<string | undefined>(
    customSet?.defaultClass?.id,
  );

  const [buffModalOpen, setBuffModalOpen] = React.useState(false);
  const openBuffModal = React.useCallback(() => {
    setBuffModalOpen(true);
  }, []);
  const closeBuffModal = React.useCallback(() => {
    setBuffModalOpen(false);
  }, []);

  const weapon = customSet?.equippedItems.find(
    (equippedItem) => !!equippedItem.item.weaponStats,
  );

  let errors: Array<BuildError> = [];

  if (customSet && statsFromCustomSet) {
    errors = getErrors(customSet, statsFromCustomSet);
  }
  const { t } = useTranslation('common');

  const theme = useTheme();

  return (
    <>
      <SetHeader
        key={customSet?.id}
        customSet={customSet}
        customSetLoading={customSetLoading}
        errors={errors}
        setDofusClassId={setDofusClassId}
      />
      <EquipmentSlots
        customSet={customSet}
        selectItemSlot={selectItemSlot}
        selectedItemSlotId={selectedItemSlot?.id ?? null}
        errors={errors}
        isMobile
      />
      {customSet ? (
        <BonusStats customSet={customSet} isMobile isClassic={false} />
      ) : (
        <EquipSetLink />
      )}
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
          <BuffButton
            openBuffModal={openBuffModal}
            appliedBuffs={appliedBuffs}
            css={{ marginTop: 12 }}
          />
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
                {classicStatGroups.map((group) => (
                  <StatTable
                    key={group[0]}
                    group={group}
                    openBuffModal={openBuffModal}
                  />
                ))}
                <StatEditor key={customSet?.stats.id} customSet={customSet} />
              </ResponsiveGrid>
            </TabPane>
            <TabPane tab={t('WEAPON_AND_SPELLS')} key="weapon-and-spells">
              <ResponsiveGrid numColumns={[2]} css={{ marginBottom: 20 }}>
                {weapon &&
                  customSet &&
                  statsFromCustomSet &&
                  weapon.item.weaponStats && (
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
                  dofusClassId={dofusClassId}
                  setDofusClassId={setDofusClassId}
                />
              </ResponsiveGrid>
            </TabPane>
          </Tabs>
        </div>
      </div>
      <BuffModal
        key={dofusClassId}
        visible={buffModalOpen}
        closeBuffModal={closeBuffModal}
        customSet={customSet}
        dofusClassId={dofusClassId}
      />
    </>
  );
};

export default SetBuilder;
