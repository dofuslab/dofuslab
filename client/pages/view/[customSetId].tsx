/** @jsxImportSource @emotion/react */

import { GetServerSideProps, NextPage } from 'next';

import { createApolloClient } from 'common/apollo';
import { itemSlots } from 'graphql/queries/__generated__/itemSlots';
import ItemSlotsQuery from 'graphql/queries/itemSlots.graphql';
import { customSetTags } from 'graphql/queries/__generated__/customSetTags';
import CustomSetTagsQuery from 'graphql/queries/customSetTags.graphql';
import { classes } from 'graphql/queries/__generated__/classes';
import ClassesQuery from 'graphql/queries/classes.graphql';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { DEFAULT_LANGUAGE } from 'common/i18n-utils';
import SessionSettingsQuery from 'graphql/queries/sessionSettings.graphql';
import { sessionSettings } from 'graphql/queries/__generated__/sessionSettings';
import { currentUser } from 'graphql/queries/__generated__/currentUser';
import CurrentUserQuery from 'graphql/queries/currentUser.graphql';
import { SSRConfig } from 'next-i18next';
import { NormalizedCacheObject } from '@apollo/client';
import {
  customSet as customSetQueryType,
  customSetVariables,
} from 'graphql/queries/__generated__/customSet';
import CustomSetQuery from 'graphql/queries/customSet.graphql';
import { CustomSetContext, EditableContext } from 'common/utils';
import Head from 'next/head';
import { Media, mediaStyles } from 'components/common/Media';
import MobileSetBuilder from 'components/mobile/SetBuilder';
import ClassicSetBuilder from 'components/desktop/ClassicSetBuilder';
import { CustomSetHead } from 'common/wrappers';
import MobileLayout from 'components/mobile/Layout';
import DesktopLayout from 'components/desktop/Layout';
import { useRouter } from 'next/router';
import { useContext } from 'react';

const ViewPage: NextPage = () => {
  const router = useRouter();
  const { customSetId: csIdParam } = router.query;

  const customSetId = Array.isArray(csIdParam) ? csIdParam[0] : csIdParam;

  if (!customSetId) {
    throw new Error(`customSetId not found: ${customSetId}`);
  }

  const { customSet, customSetLoading } = useContext(CustomSetContext);

  if (!customSet && !customSetLoading) {
    throw new Error('No custom set found');
  }

  return (
    <div className="App" css={{ height: '100%' }}>
      <Head>
        <style
          type="text/css"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: mediaStyles }}
        />
      </Head>
      <CustomSetHead customSet={customSet} />
      <EditableContext.Provider value={false}>
        <Media lessThan="xs">
          <MobileLayout>
            <MobileSetBuilder customSet={customSet} />
          </MobileLayout>
        </Media>
        <Media greaterThanOrEqual="xs" css={{ height: '100%' }}>
          <DesktopLayout showSwitch={false}>
            <ClassicSetBuilder customSet={customSet} />
          </DesktopLayout>
        </Media>
      </EditableContext.Provider>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<
  SSRConfig & { apolloState: NormalizedCacheObject },
  {
    customSetId: string;
  }
> = async ({ locale, defaultLocale, req: { headers }, params }) => {
  const selectedLocale = locale || defaultLocale || DEFAULT_LANGUAGE;
  const ssrClient = createApolloClient(
    {},
    { ...headers, 'accept-language': selectedLocale },
    true,
  );

  if (!params?.customSetId) {
    return {
      notFound: true,
    };
  }

  try {
    // populate server-side apollo cache
    const results = await Promise.all([
      ssrClient.query<customSetQueryType, customSetVariables>({
        query: CustomSetQuery,
        variables: { id: params.customSetId },
      }),
      ssrClient.query<itemSlots>({ query: ItemSlotsQuery }),
      ssrClient.query<customSetTags>({ query: CustomSetTagsQuery }),
      ssrClient.query<classes>({ query: ClassesQuery }),
      ssrClient.query<sessionSettings>({ query: SessionSettingsQuery }),
      ssrClient.query<currentUser>({ query: CurrentUserQuery }),
    ]);

    const customSet = results[0].data.customSetById;

    if (!customSet) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        ...(await serverSideTranslations(selectedLocale, [
          'auth',
          'common',
          'mage',
          'stat',
          'status',
          'weapon_spell_effect',
          'keyboard_shortcut',
          'meta',
        ])),
        // extracts data from the server-side apollo cache to hydrate frontend cache
        apolloState: ssrClient.cache.extract(),
      },
    };
  } catch (e) {
    // TODO: improve error handling
    return {
      notFound: true,
    };
  }
};

export default ViewPage;
