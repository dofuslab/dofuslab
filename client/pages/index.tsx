/** @jsx jsx */

import { useContext } from 'react';
import { jsx } from '@emotion/core';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import DesktopSetBuilder from 'components/desktop/SetBuilder';
import MobileSetBuilder from 'components/mobile/SetBuilder';
import { mediaStyles, Media } from 'components/common/Media';

import { CustomSetHead } from 'common/wrappers';
import ClassicSetBuilder from 'components/desktop/ClassicSetBuilder';
import { ClassicContext, useClassic, CustomSetContext } from 'common/utils';
import DesktopLayout from 'components/desktop/Layout';
import MobileLayout from 'components/mobile/Layout';
import ErrorPage from './_error';

const Index: NextPage = () => {
  const [isClassic, setIsClassic] = useClassic();
  const router = useRouter();
  const { customSetId } = router.query;

  const { customSet, customSetLoading } = useContext(CustomSetContext);

  if (customSetId && !customSet && !customSetLoading) {
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
