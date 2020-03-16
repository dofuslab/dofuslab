/** @jsx jsx */

import { jsx } from '@emotion/core';
import { NextPage } from 'next';
import Head from 'next/head';
import { SetBuilder } from 'components';

const Index: NextPage = () => (
  <div className="App" css={{ height: '100%' }}>
    <Head>
      <title>DofusLab.io</title>
    </Head>
    <SetBuilder />
  </div>
);

Index.getInitialProps = async () => {
  return {
    namespacesRequired: ['common', 'stat', 'auth'],
  };
};

export default Index;
