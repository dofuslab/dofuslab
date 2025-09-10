/** @jsxImportSource @emotion/react */

import { useCallback, useMemo } from 'react';
import Head from 'next/head';
import { mediaStyles, Media } from 'components/common/Media';
import Selector from 'components/common/Selector';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import {
  customSet as CustomSetQueryType,
  customSetVariables,
} from 'graphql/queries/__generated__/customSet';
import CustomSetQuery from 'graphql/queries/customSet.graphql';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';
import { itemSlots } from 'graphql/queries/__generated__/itemSlots';
import MobileLayout from 'components/mobile/Layout';
import DesktopLayout from 'components/desktop/Layout';
import { CustomSetHead } from 'common/wrappers';
import { ClassicContext, useClassic } from 'common/utils';

import EquipHead from './EquipHead';

type Props = {
  customSetId: string | null;
  // if itemSlotId is undefined, then show sets
  itemSlotId?: string;
};

const EquipPage = ({ customSetId, itemSlotId }: Props) => {
  const router = useRouter();

  const [isClassic, setIsClassic] = useClassic();

  const onIsClassicChange = useCallback(
    (value: boolean) => {
      setIsClassic(value);
      if (!value) {
        router.push(customSetId ? `/build/${customSetId}/` : '/');
      }
    },
    [router],
  );

  const { data } = useQuery<itemSlots>(ItemSlotsQuery);
  const itemSlot = data?.itemSlots.find((slot) => slot.id === itemSlotId);

  const { data: customSetData } = useQuery<
    CustomSetQueryType,
    customSetVariables
  >(CustomSetQuery, { variables: { id: customSetId }, skip: !customSetId });

  const contextValue = useMemo(
    () => [isClassic, onIsClassicChange] as const,
    [isClassic, onIsClassicChange],
  );

  const customSet = customSetData?.customSetById ?? null;

  return (
    <>
      <Media lessThan="xs">
        <MobileLayout>
          <Head>
            <style
              type="text/css"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: mediaStyles }}
            />
          </Head>
          {customSet ? (
            <CustomSetHead customSet={customSet} />
          ) : (
            <EquipHead itemSlot={itemSlot} />
          )}
          <Selector
            customSet={customSet}
            selectedItemSlot={itemSlot || null}
            showSets={!itemSlot}
            isMobile
            isClassic={false}
          />
        </MobileLayout>
      </Media>
      <Media greaterThanOrEqual="xs">
        <ClassicContext.Provider value={contextValue}>
          <DesktopLayout showSwitch>
            <Head>
              <style
                type="text/css"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: mediaStyles }}
              />
            </Head>
            <CustomSetHead customSet={customSet} />
            <Selector
              customSet={customSet}
              selectedItemSlot={itemSlot || null}
              showSets={!itemSlot}
              isClassic
              isMobile={false}
            />
          </DesktopLayout>
        </ClassicContext.Provider>
      </Media>
    </>
  );
};

export default EquipPage;
