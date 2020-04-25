/** @jsx jsx */

import { jsx } from '@emotion/core';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/react-hooks';

import DesktopSetBuilder from 'components/desktop/SetBuilder';
import MobileSetBuilder from 'components/mobile/SetBuilder';
import { mediaStyles, Media } from 'components/common/Media';
import CustomSetQuery from 'graphql/queries/customSet.graphql';
import {
  customSet,
  customSetVariables,
} from 'graphql/queries/__generated__/customSet';
import ErrorPage from './_error';
import { getTitle } from 'common/utils';
import { useTranslation } from 'i18n';

const Index: NextPage = () => {
  const router = useRouter();
  const { customSetId } = router.query;

  const { t } = useTranslation('common');

  const { data: customSetData, loading } = useQuery<
    customSet,
    customSetVariables
  >(CustomSetQuery, { variables: { id: customSetId }, skip: !customSetId });

  const customSet = customSetData?.customSetById || null;

  if (customSetId && !customSet && !loading) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <div className="App" css={{ height: '100%' }}>
      <Head>
        <style
          type="text/css"
          dangerouslySetInnerHTML={{ __html: mediaStyles }}
        />
        <title>
          {getTitle(customSet ? customSet.name || t('UNTITLED') : null)}
        </title>
        <meta name="title" content="DofusLab" />
        <meta
          name="description"
          lang="en"
          content="Experiment with your equipment at DofusLab, the open-source set builder for the MMORPG Dofus."
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dofuslab.io/" />
        <meta property="og:title" content="DofusLab" />
        <meta
          property="og:description"
          content="Experiment with your equipment at DofusLab, the open-source set builder for the MMORPG Dofus."
        />
        <meta
          property="og:image"
          content="https://dofus-lab.s3.us-east-2.amazonaws.com/logos/DL-Full_Dark_Filled_BG_1200x628.png"
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://dofuslab.io/" />
        <meta property="twitter:title" content="DofusLab" />
        <meta
          property="twitter:description"
          content="Experiment with your equipment at DofusLab, the open-source set builder for the MMORPG Dofus."
        />
        <meta
          property="twitter:image"
          content="https://dofus-lab.s3.us-east-2.amazonaws.com/logos/DL-Full_Dark_Filled_BG_1200x628.png"
        />
      </Head>
      <Media lessThan="xs">
        <MobileSetBuilder customSet={customSet} />
      </Media>
      <Media greaterThanOrEqual="xs" css={{ height: '100%' }}>
        <DesktopSetBuilder customSet={customSet} />
      </Media>
    </div>
  );
};

Index.getInitialProps = async () => {
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

export default Index;
