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
  customSet as CustomSetQueryType,
  customSetVariables,
} from 'graphql/queries/__generated__/customSet';
import { CustomSetHead } from 'common/wrappers';
import ErrorPage from './_error';

const Index: NextPage = () => {
  const router = useRouter();
  const { customSetId } = router.query;

  const { data: customSetData, loading } = useQuery<
    CustomSetQueryType,
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
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: mediaStyles }}
        />
      </Head>
      <CustomSetHead customSet={customSet} />
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
