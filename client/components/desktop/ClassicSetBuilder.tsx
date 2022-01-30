/** @jsxImportSource @emotion/react */

import * as React from 'react';

import { Tabs } from 'antd';

import { mq } from 'common/constants';

import { getErrors, CustomSetContext } from 'common/utils';
import { BuildError } from 'common/types';
import StatTable from 'components/common/StatTable';
import { BuildGender, Stat } from '__generated__/globalTypes';
import { useTranslation } from 'next-i18next';
import BasicItemCard from 'components/common/BasicItemCard';
import WeaponDamage from 'components/common/WeaponDamage';
import ClassicClassSpells from 'components/desktop/ClassicClassSpells';
import { CustomSet } from 'common/type-aliases';
import BuffModal from 'components/common/BuffModal';
import { BuffButton } from 'common/wrappers';
import { useQuery } from '@apollo/client';
import { currentUser as CurrentUserQueryType } from 'graphql/queries/__generated__/currentUser';
import currentUserQuery from 'graphql/queries/currentUser.graphql';
import ClassicRightColumnStats from './ClassicRightColumnStats';
import ClassicLeftColumnStats from './ClassicLeftColumnStats';
import ClassicEquipmentSlots from './ClassicEquipmentSlots';
import SetHeader from './SetHeader';
import ClassicClassSelector from './ClassicClassSelector';

const { TabPane } = Tabs;

interface Props {
  customSet?: CustomSet | null;
}

const ClassicSetBuilder: React.FC<Props> = ({ customSet }) => {
  const { appliedBuffs, statsFromCustomSet, customSetLoading } =
    React.useContext(CustomSetContext);

  const { data: currentUserData } =
    useQuery<CurrentUserQueryType>(currentUserQuery);

  const [dofusClassId, setDofusClassId] = React.useState<string | undefined>(
    customSet?.defaultClass?.id,
  );

  React.useEffect(() => {
    setDofusClassId(customSet?.defaultClass?.id);
  }, [customSet?.id]);

  const { t } = useTranslation();

  const weapon = customSet?.equippedItems.find(
    (equippedItem) => !!equippedItem.item.weaponStats,
  );

  let errors: Array<BuildError> = [];

  if (customSet && statsFromCustomSet) {
    errors = getErrors(customSet, statsFromCustomSet);
  }

  const [buffModalOpen, setBuffModalOpen] = React.useState(false);
  const openBuffModal = React.useCallback(() => {
    setBuffModalOpen(true);
  }, []);
  const closeBuffModal = React.useCallback(() => {
    setBuffModalOpen(false);
  }, []);

  return (
    <>
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: '0 12px',
          width: '100%',
          maxWidth: 1036,
          [mq[4]]: {
            maxWidth: 1124,
          },
        }}
      >
        <SetHeader
          key={customSet?.id}
          customSet={customSet}
          customSetLoading={customSetLoading}
          errors={errors}
          isClassic
          setDofusClassId={setDofusClassId}
        />
        <Tabs
          defaultActiveKey="characteristics"
          tabBarExtraContent={
            <BuffButton
              openBuffModal={openBuffModal}
              appliedBuffs={appliedBuffs}
            />
          }
          css={{
            '&.ant-tabs > .ant-tabs-nav > .ant-tabs-nav-wrap': {
              justifyContent: 'center',
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
              <ClassicLeftColumnStats openBuffModal={openBuffModal} />
              <div css={{ flex: '1 1 auto' }}>
                <ClassicEquipmentSlots
                  customSet={customSet}
                  errors={errors}
                  setDofusClassId={setDofusClassId}
                />
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
                    openBuffModal={openBuffModal}
                  />
                  <StatTable
                    group={[
                      Stat.NEUTRAL_RES,
                      Stat.EARTH_RES,
                      Stat.FIRE_RES,
                      Stat.WATER_RES,
                      Stat.AIR_RES,
                    ]}
                    openBuffModal={openBuffModal}
                  />
                  <StatTable
                    group={[Stat.PCT_MELEE_RES, Stat.PCT_RANGED_RES]}
                    openBuffModal={openBuffModal}
                  />
                  <StatTable
                    group={[Stat.CRITICAL_RES, Stat.PUSHBACK_RES]}
                    openBuffModal={openBuffModal}
                  />
                </div>
              </div>
              <ClassicRightColumnStats openBuffModal={openBuffModal} />
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
              <ClassicClassSelector
                dofusClassId={dofusClassId}
                setDofusClassId={setDofusClassId}
                buildGender={
                  customSet?.buildGender ||
                  currentUserData?.currentUser?.settings.buildGender ||
                  BuildGender.MALE
                }
              />
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
                dofusClassId={dofusClassId}
              />
            </div>
          </TabPane>
        </Tabs>
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

export default React.memo(ClassicSetBuilder);
