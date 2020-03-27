/** @jsx jsx */

import { jsx } from '@emotion/core';
import { NextPage } from 'next';
import Head from 'next/head';
import DesktopSetBuilder from 'components/desktop/SetBuilder';
import MobileSetBuilder from 'components/mobile/SetBuilder';
import { mediaStyles, Media } from 'components/common/Media';

const Index: NextPage = () => (
  <div className="App" css={{ height: '100%' }}>
    <Head>
      <style
        type="text/css"
        dangerouslySetInnerHTML={{ __html: mediaStyles }}
      />
      <title>DofusLab.io</title>
    </Head>
    <Media lessThan="xs">
      <MobileSetBuilder />
    </Media>
    <Media greaterThanOrEqual="xs" css={{ height: '100%' }}>
      <DesktopSetBuilder />
    </Media>
  </div>
);

Index.getInitialProps = async () => {
  return {
    namespacesRequired: ['common', 'stat', 'auth', 'weapon_stat'],
  };
};

export default Index;
