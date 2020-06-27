/** @jsx jsx */

import React from 'react';
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
import ClassicSetBuilder from 'components/desktop/ClassicSetBuilder';
import {
  ClassicContext,
  useClassic,
  appliedBuffsReducer,
  CustomSetContext,
  getStatsFromCustomSet,
  getStatsFromAppliedBuffs,
  combineStatsWithBuffs,
} from 'common/utils';
import DesktopLayout from 'components/desktop/Layout';
import MobileLayout from 'components/mobile/Layout';
import { AppliedBuffActionType } from 'common/types';
import ErrorPage from './_error';

const Index: NextPage = () => {
  const router = useRouter();
  const { customSetId } = router.query;

  const { data: customSetData, loading } = useQuery<
    CustomSetQueryType,
    customSetVariables
  >(CustomSetQuery, { variables: { id: customSetId }, skip: !customSetId });

  const customSet = customSetData?.customSetById || null;

  const [isClassic, setIsClassic] = useClassic();
  const [appliedBuffs, dispatch] = React.useReducer(appliedBuffsReducer, []);

  const statsFromCustomSet = React.useMemo(
    () => getStatsFromCustomSet(customSet),
    [customSet],
  );

  const statsFromAppliedBuffs = React.useMemo(
    () => getStatsFromAppliedBuffs(appliedBuffs),
    [appliedBuffs],
  );

  const statsFromCustomSetWithBuffs = React.useMemo(
    () => combineStatsWithBuffs(statsFromCustomSet, statsFromAppliedBuffs),
    [statsFromCustomSet, statsFromAppliedBuffs],
  );

  React.useEffect(() => {
    dispatch({ type: AppliedBuffActionType.CLEAR_ALL });
  }, [customSetId]);

  if (customSetId && !customSet && !loading) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <ClassicContext.Provider value={[isClassic, setIsClassic]}>
      <div className="App" css={{ height: '100%' }}>
        <Head>
          <style
            type="text/css"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: mediaStyles }}
          />
        </Head>
        <CustomSetHead customSet={customSet} />
        <CustomSetContext.Provider
          value={{
            dispatch,
            appliedBuffs,
            customSet,
            statsFromCustomSet,
            statsFromAppliedBuffs,
            statsFromCustomSetWithBuffs,
          }}
        >
          <Media lessThan="xs">
            <MobileLayout>
              <MobileSetBuilder customSet={customSet} />
            </MobileLayout>
          </Media>
          <Media greaterThanOrEqual="xs" css={{ height: '100%' }}>
            <DesktopLayout showSwitch>
              {isClassic ? (
                <ClassicSetBuilder customSet={customSet} />
              ) : (
                <DesktopSetBuilder customSet={customSet} />
              )}
            </DesktopLayout>
          </Media>
        </CustomSetContext.Provider>
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
