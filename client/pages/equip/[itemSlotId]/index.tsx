/** @jsx jsx */

import { jsx } from '@emotion/core';
import { NextPage } from 'next';
import Head from 'next/head';
import { mediaStyles, Media } from 'components/common/Media';
import Selector from 'components/common/Selector';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/react-hooks';
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

const EquipPage: NextPage = () => {
  const router = useRouter();
  const { itemSlotId, customSetId } = router.query;

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
          />
        </MobileLayout>
      </Media>
      <Media greaterThanOrEqual="xs">
        <DesktopLayout>
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
          />
        </DesktopLayout>
      </Media>
    </>
  );
};

EquipPage.getInitialProps = async () => {
  return {
    namespacesRequired: [
      'common',
      'stat',
      'auth',
      'weapon_spell_effect',
      'status',
      'mage',
    ],
  };
};

export default EquipPage;
