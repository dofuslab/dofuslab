/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
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
import ErrorPage from 'pages/_error';
import MobileLayout from 'components/mobile/Layout';
import DesktopLayout from 'components/desktop/Layout';
import { CustomSetHead } from 'common/wrappers';
import { ClassicContext, useClassic } from 'common/utils';

interface Props {
  customSetId: string | null;
}

const EquipPage: React.FC<Props> = ({ customSetId }) => {
  const router = useRouter();
  const { itemSlotId } = router.query;

  const [isClassic, setIsClassic] = useClassic();

  const onIsClassicChange = React.useCallback(
    (value: boolean) => {
      setIsClassic(value);
      if (!value) {
        const { itemSlotId: oldItemSlotId, ...restQuery } = router.query;

        router.push(
          { pathname: '/', query: restQuery },
          customSetId ? `/build/${customSetId}/` : '/',
        );
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

  const customSet = customSetData?.customSetById ?? null;

  if (!itemSlot) {
    return <ErrorPage statusCode={404} />;
  }

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
          <CustomSetHead customSet={customSet} />
          <Selector
            customSet={customSet}
            selectedItemSlot={itemSlot}
            showSets={false}
            isMobile
            isClassic={false}
          />
        </MobileLayout>
      </Media>
      <Media greaterThanOrEqual="xs">
        <ClassicContext.Provider value={[isClassic, onIsClassicChange]}>
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
              selectedItemSlot={itemSlot}
              showSets={false}
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
