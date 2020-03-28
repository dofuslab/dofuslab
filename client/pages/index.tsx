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

const Index: NextPage = () => {
  const router = useRouter();
  const { customSetId } = router.query;

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
        <title>DofusLab.io</title>
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
    namespacesRequired: ['common', 'stat', 'auth', 'weapon_stat'],
  };
};

export default Index;
