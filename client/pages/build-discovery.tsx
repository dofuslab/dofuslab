/** @jsxImportSource @emotion/react */

import Head from 'next/head';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import BuildDiscoveryPageComponent from 'components/common/BuildDiscoveryPage';
import CommonLayout from 'components/common/CommonLayout';
import { mediaStyles } from 'components/common/Media';
import { DEFAULT_LANGUAGE } from 'common/i18n-utils';
import { getTitle } from 'common/utils';
import { useBuildDiscoveryGate } from 'common/statsig';
import ErrorPage from 'pages/_error';

const BuildDiscoveryPage: NextPage = () => {
  const { enabled: buildDiscoveryEnabled, loading: buildDiscoveryLoading } =
    useBuildDiscoveryGate();

  if (buildDiscoveryLoading) {
    return null;
  }

  if (!buildDiscoveryEnabled) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <CommonLayout showSwitch={false}>
      <Head>
        <style
          type="text/css"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: mediaStyles }}
        />
        <title>{getTitle('Build Discovery')}</title>
      </Head>
      <BuildDiscoveryPageComponent />
    </CommonLayout>
  );
};

export const getStaticProps: GetStaticProps = async ({
  locale,
  defaultLocale,
}) => {
  const selectedLocale = locale || defaultLocale || DEFAULT_LANGUAGE;

  return {
    props: {
      ...(await serverSideTranslations(selectedLocale, [
        'auth',
        'common',
        'status',
        'keyboard_shortcut',
      ])),
    },
  };
};

export default BuildDiscoveryPage;
