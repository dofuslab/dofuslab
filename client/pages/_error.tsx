/* eslint-disable react/jsx-props-no-spreading */
/** @jsx jsx */

import Error, { ErrorProps } from 'next/error';
import { jsx } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { TTheme } from 'common/themes';

const ErrorPage = (props: ErrorProps) => {
  const theme = useTheme<TTheme>();
  return (
    <div
      css={{
        '& > div': {
          background: `${theme.body?.background} !important`,
          color: `${theme.text?.default} !important`,
          '& > div > h1': {
            borderRight: `1px solid ${theme.border?.default} !important`,
          },
        },
      }}
    >
      <Error {...props} />
    </div>
  );
};

ErrorPage.getInitialProps = async () => {
  return {
    namespacesRequired: ['common'],
  };
};

export default ErrorPage;
