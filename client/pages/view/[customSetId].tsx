/** @jsx jsx */

import { jsx } from '@emotion/core';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/react-hooks';

import MobileSetBuilder from 'components/mobile/SetBuilder';
import { mediaStyles, Media } from 'components/common/Media';
import CustomSetQuery from 'graphql/queries/customSet.graphql';
import {
  customSet as CustomSetQueryType,
  customSetVariables,
} from 'graphql/queries/__generated__/customSet';
import { CustomSetHead } from 'common/wrappers';
import ClassicSetBuilder from 'components/desktop/ClassicSetBuilder';
import { ClassicContext, useClassic, EditableContext } from 'common/utils';
import ErrorPage from '../_error';

const Index: NextPage = () => {
  const router = useRouter();
  const { customSetId } = router.query;

  const { data: customSetData, loading } = useQuery<
    CustomSetQueryType,
    customSetVariables
  >(CustomSetQuery, { variables: { id: customSetId }, skip: !customSetId });

  const customSet = customSetData?.customSetById || null;

  const [isClassic, setIsClassic] = useClassic();

  if (!customSet && !loading) {
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
        <EditableContext.Provider value={false}>
          <Media lessThan="xs">
            <MobileSetBuilder customSet={customSet} />
          </Media>
          <Media greaterThanOrEqual="xs" css={{ height: '100%' }}>
            <ClassicSetBuilder customSet={customSet} />
          </Media>
        </EditableContext.Provider>
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
