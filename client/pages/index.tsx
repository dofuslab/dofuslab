/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/react-hooks';
import Lockr from 'lockr';

import DesktopSetBuilder from 'components/desktop/SetBuilder';
import MobileSetBuilder from 'components/mobile/SetBuilder';
import { mediaStyles, Media } from 'components/common/Media';
import CustomSetQuery from 'graphql/queries/customSet.graphql';
import {
  customSet as CustomSetQueryType,
  customSetVariables,
} from 'graphql/queries/__generated__/customSet';
import { CustomSetHead } from 'common/wrappers';
import ClassicSetBuilder from 'components/desktop/ClassicSetBuilder';
import { ClassicContext } from 'common/utils';
import { IS_CLASSIC_STORAGE_KEY } from 'common/constants';
import ErrorPage from './_error';

const Index: NextPage = () => {
  const router = useRouter();
  const { customSetId } = router.query;

  const [isClassic, setIsClassic] = React.useState<boolean>(false);

  React.useEffect(() => {
    setIsClassic(Lockr.get(IS_CLASSIC_STORAGE_KEY));
  }, []);

  const onIsClassicChange = React.useCallback((value: boolean) => {
    setIsClassic(value);
    Lockr.set(IS_CLASSIC_STORAGE_KEY, value);
  }, []);

  const { data: customSetData, loading } = useQuery<
    CustomSetQueryType,
    customSetVariables
  >(CustomSetQuery, { variables: { id: customSetId }, skip: !customSetId });

  const customSet = customSetData?.customSetById || null;

  if (customSetId && !customSet && !loading) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <ClassicContext.Provider value={[isClassic, onIsClassicChange]}>
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
          {isClassic ? (
            <ClassicSetBuilder customSet={customSet} />
          ) : (
            <DesktopSetBuilder customSet={customSet} />
          )}
        </Media>
      </div>
    </ClassicContext.Provider>
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
