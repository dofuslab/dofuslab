/** @jsx jsx */

import { jsx } from '@emotion/core';
import { NextPage } from 'next';
import { SetBuilder } from 'components';

const Index: NextPage = () => (
  <div className="App" css={{ height: '100%' }}>
    <SetBuilder />
  </div>
);

Index.getInitialProps = async () => {
  return {
    namespacesRequired: ['common'],
  };
};

export default Index;
