/** @jsxImportSource @emotion/react */

import React from 'react';
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
import {
  ClassicContext,
  getCustomSetMetaImage,
  getTitle,
  useClassic,
} from 'common/utils';
import { DEFAULT_LANGUAGE } from 'common/i18n-utils';
import { useTranslation } from 'react-i18next';

interface Props {
  customSetId: string | null;
  itemSlotId: string;
}

export const getItemSlotCanonicalUrl = (itemSlotId: string) => {
  return `https://dofuslab.io/equip/${itemSlotId}/`;
};

const EquipPage: React.FC<Props> = ({ customSetId, itemSlotId }) => {
  const router = useRouter();
  const locale = router.locale || router.defaultLocale || DEFAULT_LANGUAGE;

  const [isClassic, setIsClassic] = useClassic();

  const onIsClassicChange = React.useCallback(
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

  const contextValue = React.useMemo(
    () => [isClassic, onIsClassicChange] as const,
    [isClassic, onIsClassicChange],
  );

  const customSet = customSetData?.customSetById ?? null;

  const { t } = useTranslation('meta');

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
          {customSet ? (
            <CustomSetHead customSet={customSet} />
          ) : (
            <>
              <title>{getTitle(itemSlot.name)}</title>
              <meta name="title" content={getTitle(itemSlot.name)} />
              <meta
                name="description"
                lang={locale}
                content={t('EQUIP', { slot: itemSlot.name })}
              />
              <meta property="og:title" content={getTitle(itemSlot.name)} />
              <meta
                property="og:description"
                content={t('EQUIP', { slot: itemSlot.name })}
              />
              <meta
                property="og:url"
                content={getItemSlotCanonicalUrl(itemSlot.id)}
              />
              <meta property="og:image" content={getCustomSetMetaImage(null)} />
              <meta
                property="twitter:title"
                content={getTitle(itemSlot.name)}
              />
              <meta
                property="twitter:description"
                content={t('EQUIP', { slot: itemSlot.name })}
              />
              <meta
                property="twitter:url"
                content={getItemSlotCanonicalUrl(itemSlot.id)}
              />
              <meta
                property="twitter:image"
                content={getCustomSetMetaImage(null)}
              />
            </>
          )}
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
