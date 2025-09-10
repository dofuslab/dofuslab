/** @jsxImportSource @emotion/react */

import { useContext, useState, useEffect, useCallback, memo } from 'react';

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

interface Props {
  customSet?: CustomSet | null;
}

const ClassicSetBuilder = ({ customSet }: Props) => {
  const { appliedBuffs, statsFromCustomSet, customSetLoading } =
    useContext(CustomSetContext);

  const { data: currentUserData } =
    useQuery<CurrentUserQueryType>(currentUserQuery);

  const [dofusClassId, setDofusClassId] = useState<string | undefined>(
    customSet?.defaultClass?.id,
  );

  useEffect(() => {
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

  const [buffModalOpen, setBuffModalOpen] = useState(false);
  const openBuffModal = useCallback(() => {
    setBuffModalOpen(true);
  }, []);
  const closeBuffModal = useCallback(() => {
    setBuffModalOpen(false);
  }, []);

  const tabItems = [
    {
      key: 'characteristics',
      label: t('CHARACTERISTICS'),
      children: (
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
      ),
    },
    {
      key: 'weapon-and-spells',
      label: t('WEAPON_AND_SPELLS'),
      children: (
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
      ),
    },
  ];

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
          items={tabItems}
          css={{
            '&.ant-tabs > .ant-tabs-nav > .ant-tabs-nav-wrap': {
              justifyContent: 'center',
            },
          }}
        />
      </div>
      <BuffModal
        key={dofusClassId}
        open={buffModalOpen}
        closeBuffModal={closeBuffModal}
        customSet={customSet}
        dofusClassId={dofusClassId}
      />
    </>
  );
};

export default memo(ClassicSetBuilder);
