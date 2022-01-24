/* eslint-disable react/jsx-props-no-spreading */
/** @jsxImportSource @emotion/react */

import Error, { ErrorProps } from 'next/error';

import { useTheme } from '@emotion/react';

function ErrorPage(props: ErrorProps) {
  const theme = useTheme();
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
}

ErrorPage.getInitialProps = async () => {
  return {
    namespacesRequired: ['common'],
  };
};

export default ErrorPage;
